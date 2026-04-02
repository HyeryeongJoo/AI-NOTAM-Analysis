/**
 * NOTAM-항로/운항편 매칭 서비스
 *
 * 공간적(great-circle) 및 시간적 중첩 계산 알고리즘.
 * NOTAM 원형 영역과 항로 폴리라인 세그먼트 간의 교차 여부를 판정.
 *
 * @requirements FR-003, FR-004, FR-010
 */

import * as flightRepository from '@/lib/db/flight.repository';
import * as impactRepository from '@/lib/db/impact.repository';
import * as notamRepository from '@/lib/db/notam.repository';
import * as routeRepository from '@/lib/db/route.repository';
import type { Flight } from '@/types/flight';
import type { NotamFlightImpact, NotamRouteImpact } from '@/types/impact';
import type { Notam } from '@/types/notam';
import type { Route } from '@/types/route';

/** 지구 반경 (해리) */
const EARTH_RADIUS_NM = 3440.065;

/** 도를 라디안으로 변환 */
const DEG_TO_RAD = Math.PI / 180;

/**
 * 두 좌표 간 대원 거리를 계산한다 (해리).
 *
 * @param lat1 - 시작점 위도
 * @param lng1 - 시작점 경도
 * @param lat2 - 끝점 위도
 * @param lng2 - 끝점 경도
 * @returns 해리 단위 거리
 */
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLng = (lng2 - lng1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_NM * c;
}

/**
 * 점에서 선분까지의 최소 대원 거리를 계산한다 (해리).
 *
 * @param point - 점 좌표
 * @param point.lat - 위도
 * @param point.lng - 경도
 * @param segStart - 선분 시작점
 * @param segStart.lat - 위도
 * @param segStart.lng - 경도
 * @param segEnd - 선분 끝점
 * @param segEnd.lat - 위도
 * @param segEnd.lng - 경도
 * @returns 해리 단위 최소 거리
 */
export function pointToSegmentDistance(
  point: { lat: number; lng: number },
  segStart: { lat: number; lng: number },
  segEnd: { lat: number; lng: number },
): number {
  const dStart = haversineDistance(point.lat, point.lng, segStart.lat, segStart.lng);
  const dEnd = haversineDistance(point.lat, point.lng, segEnd.lat, segEnd.lng);
  const dSeg = haversineDistance(segStart.lat, segStart.lng, segEnd.lat, segEnd.lng);

  // 선분 길이가 0이면 점까지 거리 반환
  if (dSeg < 0.01) return dStart;

  // 투영 비율 계산 (근사)
  const t = Math.max(0, Math.min(1, (dStart ** 2 - dEnd ** 2 + dSeg ** 2) / (2 * dSeg)));

  // 투영점 좌표 근사 (선형 보간)
  const projLat = segStart.lat + t * (segEnd.lat - segStart.lat);
  const projLng = segStart.lng + t * (segEnd.lng - segStart.lng);

  return haversineDistance(point.lat, point.lng, projLat, projLng);
}

/**
 * NOTAM 영역과 항로의 공간적 중첩을 계산한다.
 *
 * @param notam - 분석 대상 NOTAM
 * @param route - 대상 항로
 * @returns 중첩 여부 및 세부 정보
 */
export function calculateSpatialOverlap(
  notam: Notam,
  route: Route,
): { overlaps: boolean; overlapType: string; affectedSegment: string; distanceThroughArea: number; altitudeConflict: boolean } {
  const wp = route.waypoints;
  let minDistance = Infinity;
  let closestSegment = '';

  for (let i = 0; i < wp.length - 1; i++) {
    const dist = pointToSegmentDistance(
      { lat: notam.latitude, lng: notam.longitude },
      { lat: wp[i].latitude, lng: wp[i].longitude },
      { lat: wp[i + 1].latitude, lng: wp[i + 1].longitude },
    );

    if (dist < minDistance) {
      minDistance = dist;
      closestSegment = `${wp[i].name}-${wp[i + 1].name}`;
    }
  }

  // 고도 충돌 확인
  const routeFL = parseInt(route.flightLevel.replace('FL', ''), 10);
  const notamLower = parseInt(notam.lowerLimit, 10) || 0;
  const notamUpper = parseInt(notam.upperLimit, 10) || 999;
  const altitudeConflict = routeFL >= notamLower && routeFL <= notamUpper;

  const overlaps = minDistance <= notam.radius;

  let overlapType = 'none';
  if (overlaps && minDistance < notam.radius * 0.5) {
    overlapType = 'direct-crossing';
  } else if (overlaps) {
    overlapType = 'within-radius';
  } else if (minDistance <= notam.radius * 1.5) {
    overlapType = 'adjacent';
  }

  const distanceThroughArea = overlaps ? Math.max(1, Math.round(notam.radius * 2 - minDistance)) : 0;

  return {
    overlaps: overlaps || overlapType === 'adjacent',
    overlapType,
    affectedSegment: closestSegment,
    distanceThroughArea,
    altitudeConflict,
  };
}

/**
 * NOTAM 유효 기간과 운항편 스케줄의 시간적 중첩을 판정한다.
 *
 * @param notam - 분석 대상 NOTAM
 * @param flight - 대상 운항편
 * @returns 시간적 중첩 여부
 */
export function calculateTemporalOverlap(notam: Notam, flight: Flight): boolean {
  if (notam.effectiveTo === 'PERM') return true;

  const notamStart = new Date(notam.effectiveFrom).getTime();
  const notamEnd = new Date(notam.effectiveTo).getTime();
  const flightStart = new Date(flight.scheduledDeparture).getTime();
  const flightEnd = new Date(flight.scheduledArrival).getTime();

  // 시간 구간 중첩: 한쪽이 끝나기 전에 다른 쪽이 시작
  return flightStart < notamEnd && flightEnd > notamStart;
}

/**
 * NOTAM-항로/운항편 영향을 일괄 계산한다.
 *
 * @param notamId - 특정 NOTAM만 계산할 경우 ID 지정
 * @returns 새로 생성된 영향 기록
 */
export function calculateAllImpacts(notamId?: string): { routeImpacts: NotamRouteImpact[]; flightImpacts: NotamFlightImpact[] } {
  const notams: Notam[] = notamId
    ? [notamRepository.findById(notamId)].filter((n): n is Notam => n !== undefined)
    : notamRepository.findAll({ page: 1, pageSize: 1000 }).items;

  const routes = routeRepository.findAll({ page: 1, pageSize: 100 }).items;
  const flights = flightRepository.findAll({ page: 1, pageSize: 100 }).items;

  const newRouteImpacts: NotamRouteImpact[] = [];
  const newFlightImpacts: NotamFlightImpact[] = [];

  for (const notam of notams) {
    // 만료/취소 NOTAM은 건너뜀
    if (notam.status === 'expired' || notam.status === 'cancelled') continue;

    for (const route of routes) {
      const spatial = calculateSpatialOverlap(notam, route);
      if (spatial.overlaps) {
        const impact = impactRepository.createRouteImpact({
          notamId: notam.id,
          routeId: route.id,
          overlapType: spatial.overlapType,
          affectedSegment: spatial.affectedSegment,
          distanceThroughArea: spatial.distanceThroughArea,
          altitudeConflict: spatial.altitudeConflict,
        });
        newRouteImpacts.push(impact);
      }
    }

    for (const flight of flights) {
      // 운항편 항로의 공간 중첩 확인
      const route = routeRepository.findById(flight.routeId);
      if (!route) continue;

      const spatial = calculateSpatialOverlap(notam, route);
      if (!spatial.overlaps) continue;

      const temporal = calculateTemporalOverlap(notam, flight);

      const impact = impactRepository.createFlightImpact({
        notamId: notam.id,
        flightId: flight.id,
        routeId: flight.routeId,
        temporalOverlap: temporal,
        spatialOverlap: spatial.overlaps,
        impactSummary: `${notam.qCodeSubject} ${notam.qCodeCondition} at ${notam.locationIndicator}${temporal ? ' (시간 중첩)' : ''}`,
      });
      newFlightImpacts.push(impact);
    }
  }

  return { routeImpacts: newRouteImpacts, flightImpacts: newFlightImpacts };
}
