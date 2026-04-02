/**
 * 항로 데이터 접근 레이어
 *
 * 인메모리 스토어 기반 항로 조회/필터링.
 *
 * @requirements FR-006, FR-009, FR-010
 */

import { getStore } from './store';
import type { Route, RouteStatus } from '@/types/route';

/** 항로 목록 필터 파라미터 */
interface RouteQueryParams {
  status?: RouteStatus;
  sortBy?: string;
  order?: string;
  page: number;
  pageSize: number;
}

/** 타입 안전한 정렬 필드 접근자 */
const SORTABLE_FIELDS: Record<string, (item: Route) => string | number> = {
  routeName: (i) => i.routeName,
  departureAirport: (i) => i.departureAirport,
  distance: (i) => i.distance,
};

/**
 * 필터, 정렬, 페이지네이션을 적용한 항로 목록을 반환한다.
 *
 * @param params - 필터 조건 및 페이지 정보
 * @returns 페이지네이션된 항로 목록
 */
export function findAll(params: RouteQueryParams): { items: Route[]; total: number } {
  const store = getStore();
  let items = Array.from(store.routes.values());

  if (params.status) {
    items = items.filter((r) => r.status === params.status);
  }

  const sortBy = params.sortBy ?? 'routeName';
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
 * ID로 항로를 조회한다.
 *
 * @param id - 항로 고유 ID
 * @returns 항로 또는 undefined
 */
export function findById(id: string): Route | undefined {
  return getStore().routes.get(id);
}

/**
 * 대체 항로 목록을 반환한다.
 *
 * @param routeId - 원본 항로 ID
 * @returns 대체 항로 배열
 */
export function findAlternates(routeId: string): Route[] {
  const store = getStore();
  const route = store.routes.get(routeId);
  if (!route) return [];
  return route.alternateRouteIds
    .map((id) => store.routes.get(id))
    .filter((r): r is Route => r !== undefined);
}
