/**
 * AI 사용자 메시지 템플릿
 *
 * 각 AI 기능에 대한 구조화된 사용자 메시지 생성 함수.
 * XML 태그로 입력 데이터를 구분하여 프롬프트 주입 방어 및 정보 구조화.
 *
 * @requirements FR-001, FR-003, FR-007, FR-008, FR-009, FR-014, FR-015, FR-020
 */

import type { Airport } from '@/types/airport';
import type { Flight } from '@/types/flight';
import type { NotamFlightImpact, NotamRouteImpact } from '@/types/impact';
import type { Notam } from '@/types/notam';
import type { QCode } from '@/types/qCode';
import type { Route } from '@/types/route';

/**
 * NOTAM 중요도 분석 사용자 메시지를 생성한다.
 *
 * @param notam - 분석 대상 NOTAM
 * @param qCode - Q-Code 참조 정보
 * @param airport - 해당 공항 정보
 * @returns 구조화된 사용자 메시지
 */
export function buildImportanceAnalysisMessage(
  notam: Notam,
  qCode: QCode | undefined,
  airport: Airport | undefined,
): string {
  return `<notam_data>
<raw_text>
${notam.rawText}
</raw_text>

<parsed_fields>
Q-Code: ${notam.qCode}
Subject: ${notam.qCodeSubject}
Condition: ${notam.qCodeCondition}
FIR: ${notam.fir}
Location: ${notam.locationIndicator}
Coordinates: ${notam.latitude}N ${notam.longitude}E, Radius: ${notam.radius}NM
Lower Limit: ${notam.lowerLimit}, Upper Limit: ${notam.upperLimit}
Effective: ${notam.effectiveFrom} ~ ${notam.effectiveTo}
${notam.schedule ? `Schedule: ${notam.schedule}` : 'Schedule: 24HR'}
Type: ${notam.type}
</parsed_fields>

<reference_data>
${
  qCode
    ? `Q-Code 설명: ${qCode.descriptionKo} (${qCode.description})
Q-Code 기본 중요도: ${qCode.defaultImportance}`
    : 'Q-Code 참조 정보 없음'
}
${
  airport
    ? `공항: ${airport.nameKo} (${airport.name})
ICAO: ${airport.icaoCode}, IATA: ${airport.iataCode}
활주로 수: ${airport.runwayCount}
FIR: ${airport.fir}, 국가: ${airport.country}`
    : '공항 참조 정보 없음'
}
</reference_data>
</notam_data>`;
}

/**
 * NOTAM 한국어 요약 사용자 메시지를 생성한다.
 *
 * @param notam - 요약 대상 NOTAM
 * @returns 구조화된 사용자 메시지
 */
export function buildKoreanSummaryMessage(notam: Notam): string {
  return `<notam>
${notam.rawText}
</notam>

위 NOTAM을 한국어로 요약하세요.`;
}

/**
 * NOTAM 영향 분석 사용자 메시지를 생성한다.
 *
 * @param notam - 분석 대상 NOTAM
 * @param affectedRoutes - 영향받는 항로 영향 데이터
 * @param affectedFlights - 영향받는 운항편 영향 데이터
 * @param airport - 해당 공항 정보
 * @returns 구조화된 사용자 메시지
 */
export function buildImpactAnalysisMessage(
  notam: Notam,
  affectedRoutes: NotamRouteImpact[],
  affectedFlights: NotamFlightImpact[],
  airport: Airport | undefined,
): string {
  const routeDetails = affectedRoutes
    .map(
      (r) =>
        `- 항로 ${r.routeId}: 유형=${r.overlapType}, 구간=${r.affectedSegment}, 통과거리=${r.distanceThroughArea}NM${r.altitudeConflict ? ', 고도 충돌' : ''}`,
    )
    .join('\n');

  const flightDetails = affectedFlights
    .map(
      (f) =>
        `- 운항편 ${f.flightId}: 시간중첩=${f.temporalOverlap ? '예' : '아니오'}, 공간중첩=${f.spatialOverlap ? '예' : '아니오'}`,
    )
    .join('\n');

  return `<notam>
${notam.rawText}
</notam>

<airport_info>
공항: ${notam.locationIndicator}${airport ? ` (${airport.nameKo}, 활주로 ${airport.runwayCount}개, FIR: ${airport.fir})` : ''}
</airport_info>

<impact_data>
영향 항로 (${affectedRoutes.length}개):
${routeDetails || '없음'}

영향 운항편 (${affectedFlights.length}개):
${flightDetails || '없음'}
</impact_data>

위 데이터를 기반으로 종합 영향 분석을 수행하세요.`;
}

/**
 * 브리핑 생성 사용자 메시지를 생성한다.
 *
 * @param flight - 대상 운항편
 * @param notams - 관련 NOTAM 목록
 * @returns 구조화된 사용자 메시지
 */
export function buildBriefingMessage(flight: Flight, notams: Notam[]): string {
  const notamList = notams
    .map(
      (n) =>
        `<notam_item importance="${n.importanceLevel}" score="${n.importanceScore}">
[${n.importanceLevel.toUpperCase()}] ${n.qCode} at ${n.locationIndicator}
본문: ${n.body}
요약: ${n.aiSummary ?? '요약 없음'}
유효: ${n.effectiveFrom} ~ ${n.effectiveTo}
</notam_item>`,
    )
    .join('\n');

  return `<flight_info>
편명: ${flight.flightNumber}
구간: ${flight.departureAirport} -> ${flight.arrivalAirport}
출발: ${flight.scheduledDeparture}
도착: ${flight.scheduledArrival}
항로: ${flight.routeId}
기종: ${flight.aircraftType}
상태: ${flight.status}
</flight_info>

<related_notams count="${notams.length}">
${notamList}
</related_notams>

위 운항편과 관련 NOTAM 정보를 기반으로 브리핑 문서를 생성하세요.`;
}

/**
 * 승무원 브리핑 패키지 사용자 메시지를 생성한다.
 *
 * @param flight - 대상 운항편
 * @param notams - 관련 NOTAM 목록
 * @returns 구조화된 사용자 메시지
 */
export function buildCrewPackageMessage(flight: Flight, notams: Notam[]): string {
  const notamSummary = notams
    .map(
      (n) => `[${n.importanceLevel.toUpperCase()}] ${n.qCode} at ${n.locationIndicator}: ${n.body}`,
    )
    .join('\n');

  return `<flight>
편명: ${flight.flightNumber} (${flight.departureAirport} -> ${flight.arrivalAirport})
출발: ${flight.scheduledDeparture}
도착: ${flight.scheduledArrival}
기종: ${flight.aircraftType}
</flight>

<notams count="${notams.length}">
${notamSummary}
</notams>

위 정보를 기반으로 3가지 문서(DISP Comment, Company NOTAM, Crew Briefing)를 생성하세요.`;
}

/**
 * 교대 인수인계 보고서 사용자 메시지를 생성한다.
 *
 * @param notams - 관련 NOTAM 목록
 * @param shiftStartTime - 교대 시작 시각
 * @param shiftEndTime - 교대 종료 시각
 * @returns 구조화된 사용자 메시지
 */
export function buildShiftHandoverMessage(
  notams: Notam[],
  shiftStartTime: string,
  shiftEndTime: string,
): string {
  const notamList = notams
    .map(
      (n) =>
        `[${n.importanceLevel.toUpperCase()}] ${n.type} ${n.qCode} at ${n.locationIndicator} (${n.status}): ${n.body}`,
    )
    .join('\n');

  return `<shift_info>
교대 시간: ${shiftStartTime} ~ ${shiftEndTime}
</shift_info>

<notams count="${notams.length}">
${notamList}
</notams>

위 교대 시간대의 NOTAM 정보를 기반으로 인수인계 보고서를 생성하세요.`;
}

/**
 * 대체 항로 분석 사용자 메시지를 생성한다.
 *
 * @param route - 영향받는 원래 항로
 * @param notam - 원인 NOTAM
 * @param alternateRoutes - 가용 대체 항로 목록
 * @returns 구조화된 사용자 메시지
 */
export function buildRouteAlternativesMessage(
  route: Route,
  notam: Notam,
  alternateRoutes: Route[],
): string {
  const alternateList = alternateRoutes
    .map(
      (r) =>
        `- ${r.routeName}: ${r.departureAirport}->${r.arrivalAirport}, ${r.distance}NM, ${r.flightLevel}, 상태: ${r.status}`,
    )
    .join('\n');

  return `<notam>
${notam.rawText}
</notam>

<original_route>
항로명: ${route.routeName}
구간: ${route.departureAirport} -> ${route.arrivalAirport}
거리: ${route.distance}NM
고도: ${route.flightLevel}
</original_route>

<alternate_routes count="${alternateRoutes.length}">
${alternateList}
</alternate_routes>

위 정보를 기반으로 대체 항로를 분석하고 권고하세요.`;
}

/**
 * TIFRS 의사결정 분석 사용자 메시지를 생성한다.
 *
 * @param notam - 분석 대상 NOTAM
 * @param affectedRoutes - 영향받는 항로 영향 목록
 * @param affectedFlights - 영향받는 운항편 영향 목록
 * @param airport - 해당 공항 정보
 * @returns 구조화된 사용자 메시지
 */
export function buildTifrsDecisionMessage(
  notam: Notam,
  affectedRoutes: NotamRouteImpact[],
  affectedFlights: NotamFlightImpact[],
  airport: Airport | undefined,
): string {
  const routeList = affectedRoutes
    .map(
      (r) =>
        `- 항로 ${r.routeId}: 중첩 유형=${r.overlapType}, 영향 구간=${r.affectedSegment}, 관통 거리=${r.distanceThroughArea}NM, 고도 충돌=${r.altitudeConflict}`,
    )
    .join('\n');

  const flightList = affectedFlights
    .map(
      (f) =>
        `- 편명 ${f.flightId}: 시간 중첩=${f.temporalOverlap}, 공간 중첩=${f.spatialOverlap}, 영향=${f.impactSummary}`,
    )
    .join('\n');

  const airportInfo = airport
    ? `공항: ${airport.name} (${airport.icaoCode}/${airport.iataCode}), 활주로 ${airport.runwayCount}개, FIR: ${airport.fir}`
    : '공항 정보 없음';

  return `<notam>
ID: ${notam.id}
유형: ${notam.type}
Q-Code: ${notam.qCode} (${notam.qCodeSubject}/${notam.qCodeCondition})
위치: ${notam.locationIndicator} (${notam.latitude}, ${notam.longitude})
반경: ${notam.radius}NM
유효기간: ${notam.effectiveFrom} ~ ${notam.effectiveTo}
스케줄: ${notam.schedule ?? '전 시간'}
중요도: ${notam.importanceLevel} (${notam.importanceScore})
원문: ${notam.body}
</notam>

<airport>
${airportInfo}
</airport>

<affected_routes count="${affectedRoutes.length}">
${routeList || '영향받는 항로 없음'}
</affected_routes>

<affected_flights count="${affectedFlights.length}">
${flightList || '영향받는 운항편 없음'}
</affected_flights>

위 NOTAM 정보와 영향 데이터를 기반으로 TIFRS 프레임워크에 따라 분석하고, 의사결정을 제안하세요.`;
}
