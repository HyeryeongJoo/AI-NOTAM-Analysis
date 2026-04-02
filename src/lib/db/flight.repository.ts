/**
 * 운항편 데이터 접근 레이어
 *
 * 인메모리 스토어 기반 운항편 조회/필터링.
 *
 * @requirements FR-004, FR-013
 */

import { getStore } from './store';
import type { Flight } from '@/types/flight';
import type { ImportanceLevel } from '@/types/notam';

/** 운항편 목록 필터 파라미터 */
interface FlightQueryParams {
  airport?: string;
  route?: string;
  date?: string;
  impactStatus?: string;
  sortBy?: string;
  order?: string;
  page: number;
  pageSize: number;
}

/** 중요도 우선순위 (높을수록 심각) */
const IMPORTANCE_RANK: Record<ImportanceLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  routine: 0,
};

/**
 * flightImpacts 데이터로부터 notamImpactCount와 notamMaxSeverity를 계산한다.
 *
 * @param flight - 운항편
 * @returns 영향 카운트와 최대 중요도가 계산된 운항편
 */
function enrichWithImpactData(flight: Flight): Flight {
  const store = getStore();
  const impacts = store.flightImpacts.filter((fi) => fi.flightId === flight.id);
  const notamImpactCount = impacts.length;

  if (notamImpactCount === 0) {
    return { ...flight, notamImpactCount: 0, notamMaxSeverity: 'routine' };
  }

  const notamIds = [...new Set(impacts.map((fi) => fi.notamId))];
  let maxSeverity: ImportanceLevel = 'routine';
  for (const nid of notamIds) {
    const notam = store.notams.get(nid);
    if (notam && IMPORTANCE_RANK[notam.importanceLevel] > IMPORTANCE_RANK[maxSeverity]) {
      maxSeverity = notam.importanceLevel;
    }
  }

  return { ...flight, notamImpactCount, notamMaxSeverity: maxSeverity };
}

/** 타입 안전한 정렬 필드 접근자 */
const SORTABLE_FIELDS: Record<string, (item: Flight) => string | number> = {
  flightNumber: (i) => i.flightNumber,
  scheduledDeparture: (i) => i.scheduledDeparture,
  departureAirport: (i) => i.departureAirport,
  notamImpactCount: (i) => i.notamImpactCount,
};

/**
 * 필터, 정렬, 페이지네이션을 적용한 운항편 목록을 반환한다.
 *
 * @param params - 필터 조건 및 페이지 정보
 * @returns 페이지네이션된 운항편 목록
 */
export function findAll(params: FlightQueryParams): { items: Flight[]; total: number } {
  const store = getStore();
  let items = Array.from(store.flights.values()).map(enrichWithImpactData);

  if (params.airport) {
    items = items.filter(
      (f) => f.departureAirport === params.airport || f.arrivalAirport === params.airport,
    );
  }
  if (params.route) {
    items = items.filter((f) => f.routeId === params.route);
  }
  if (params.date) {
    const dateStr = params.date;
    items = items.filter((f) => f.scheduledDeparture.startsWith(dateStr));
  }
  if (params.impactStatus === 'affected') {
    items = items.filter((f) => f.notamImpactCount > 0);
  } else if (params.impactStatus === 'clear') {
    items = items.filter((f) => f.notamImpactCount === 0);
  }

  const sortBy = params.sortBy ?? 'scheduledDeparture';
  const accessor = SORTABLE_FIELDS[sortBy];
  if (accessor) {
    const direction = params.order === 'asc' ? 1 : -1;
    items.sort((a, b) => {
      const aVal = accessor(a);
      const bVal = accessor(b);
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * direction;
      }
      return String(aVal).localeCompare(String(bVal)) * direction;
    });
  }

  const total = items.length;
  const start = (params.page - 1) * params.pageSize;
  const paged = items.slice(start, start + params.pageSize);

  return { items: paged, total };
}

/**
 * ID로 운항편을 조회한다.
 *
 * @param id - 운항편 고유 ID
 * @returns 운항편 또는 undefined
 */
export function findById(id: string): Flight | undefined {
  const flight = getStore().flights.get(id);
  return flight ? enrichWithImpactData(flight) : undefined;
}
