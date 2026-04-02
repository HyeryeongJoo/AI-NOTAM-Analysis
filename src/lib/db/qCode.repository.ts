/**
 * Q-Code 데이터 접근 레이어
 *
 * 인메모리 스토어 기반 Q-Code 참조 테이블 조회.
 *
 * @requirements FR-002
 */

import { getStore } from './store';
import type { QCode } from '@/types/qCode';

/**
 * 전체 Q-Code 목록을 반환한다.
 *
 * @returns Q-Code 배열
 */
export function findAll(): QCode[] {
  return Array.from(getStore().qCodes.values());
}

/**
 * 코드 문자열로 Q-Code를 조회한다.
 *
 * @param code - 5글자 Q-Code (예: QMRLC)
 * @returns Q-Code 또는 undefined
 */
export function findByCode(code: string): QCode | undefined {
  return getStore().qCodes.get(code);
}
