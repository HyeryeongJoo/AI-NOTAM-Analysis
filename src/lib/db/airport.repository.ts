/**
 * 공항 데이터 접근 레이어
 *
 * 인메모리 스토어 기반 공항 조회.
 *
 * @requirements FR-003, FR-006
 */

import { getStore } from './store';
import type { Airport } from '@/types/airport';

/**
 * ICAO 코드로 공항을 조회한다.
 *
 * @param icaoCode - 4글자 ICAO 코드
 * @returns 공항 또는 undefined
 */
export function findByIcao(icaoCode: string): Airport | undefined {
  return getStore().airports.get(icaoCode);
}

/**
 * 전체 공항 목록을 반환한다.
 *
 * @returns 공항 배열
 */
export function findAll(): Airport[] {
  return Array.from(getStore().airports.values());
}
