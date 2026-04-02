/**
 * 영향 분석 데이터 접근 레이어
 *
 * NOTAM-항로/운항편 영향 기록 조회 및 생성.
 *
 * @requirements FR-003, FR-004, FR-010
 */

import { getStore } from './store';
import type { NotamFlightImpact, NotamRouteImpact } from '@/types/impact';

/**
 * 특정 NOTAM의 항로 영향 목록을 반환한다.
 *
 * @param notamId - NOTAM ID
 * @returns 해당 NOTAM의 항로 영향 배열
 */
export function findRouteImpactsByNotam(notamId: string): NotamRouteImpact[] {
  return getStore().routeImpacts.filter((ri) => ri.notamId === notamId);
}

/**
 * 특정 NOTAM의 운항편 영향 목록을 반환한다.
 *
 * @param notamId - NOTAM ID
 * @returns 해당 NOTAM의 운항편 영향 배열
 */
export function findFlightImpactsByNotam(notamId: string): NotamFlightImpact[] {
  return getStore().flightImpacts.filter((fi) => fi.notamId === notamId);
}

/**
 * 특정 항로의 NOTAM 영향 목록을 반환한다.
 *
 * @param routeId - 항로 ID
 * @returns 해당 항로의 NOTAM 영향 배열
 */
export function findRouteImpactsByRoute(routeId: string): NotamRouteImpact[] {
  return getStore().routeImpacts.filter((ri) => ri.routeId === routeId);
}

/**
 * 특정 운항편의 NOTAM 영향 목록을 반환한다.
 *
 * @param flightId - 운항편 ID
 * @returns 해당 운항편의 NOTAM 영향 배열
 */
export function findFlightImpactsByFlight(flightId: string): NotamFlightImpact[] {
  return getStore().flightImpacts.filter((fi) => fi.flightId === flightId);
}

/**
 * 항로 영향 기록을 생성한다.
 *
 * @param data - 영향 데이터 (ID 제외)
 * @returns 생성된 항로 영향 기록
 */
export function createRouteImpact(data: Omit<NotamRouteImpact, 'id'>): NotamRouteImpact {
  const store = getStore();
  const impact: NotamRouteImpact = {
    id: `ri-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...data,
  };
  store.routeImpacts.push(impact);
  return impact;
}

/**
 * 운항편 영향 기록을 생성한다.
 *
 * @param data - 영향 데이터 (ID 제외)
 * @returns 생성된 운항편 영향 기록
 */
export function createFlightImpact(data: Omit<NotamFlightImpact, 'id'>): NotamFlightImpact {
  const store = getStore();
  const impact: NotamFlightImpact = {
    id: `fi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...data,
  };
  store.flightImpacts.push(impact);
  return impact;
}

/** 영향 조회 필터 */
interface ImpactQueryParams {
  notamId?: string;
  routeId?: string;
  flightId?: string;
}

/**
 * 조건에 맞는 영향 기록을 반환한다.
 *
 * @param params - 필터 조건
 * @returns 항로 영향 및 운항편 영향 배열
 */
export function findAll(params: ImpactQueryParams): { routeImpacts: NotamRouteImpact[]; flightImpacts: NotamFlightImpact[] } {
  const store = getStore();

  let routeImpacts = [...store.routeImpacts];
  let flightImpacts = [...store.flightImpacts];

  if (params.notamId) {
    routeImpacts = routeImpacts.filter((ri) => ri.notamId === params.notamId);
    flightImpacts = flightImpacts.filter((fi) => fi.notamId === params.notamId);
  }
  if (params.routeId) {
    routeImpacts = routeImpacts.filter((ri) => ri.routeId === params.routeId);
    flightImpacts = flightImpacts.filter((fi) => fi.routeId === params.routeId);
  }
  if (params.flightId) {
    flightImpacts = flightImpacts.filter((fi) => fi.flightId === params.flightId);
  }

  return { routeImpacts, flightImpacts };
}
