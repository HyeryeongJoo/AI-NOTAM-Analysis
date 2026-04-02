/**
 * REF BOOK 타입 정의
 *
 * 운항관리사가 등록한 중요 NOTAM 기록 엔티티.
 *
 * @requirements FR-011
 */

import type { ImportanceLevel } from './notam';

/** REF BOOK 상태 */
export type RefBookStatus = 'active' | 'expired' | 'superseded';

/** REF BOOK 항목 -- 운항관리사가 등록한 중요 NOTAM 기록 */
export interface RefBookEntry {
  id: string;
  notamId: string;
  registeredBy: string;
  /** ISO-8601 등록 시각 */
  registeredAt: string;
  summary: string;
  impactLevel: ImportanceLevel;
  /** ICAO 코드 배열 */
  affectedAirports: string[];
  affectedRoutes: string[];
  remarks: string;
  status: RefBookStatus;
  /** ISO-8601 만료 시각 */
  expiresAt: string;
}

/** REF BOOK 생성 요청 */
export interface CreateRefBookEntryRequest {
  notamId: string;
  summary: string;
  impactLevel: ImportanceLevel;
  affectedAirports: string[];
  affectedRoutes: string[];
  remarks: string;
  expiresAt: string;
}

/** REF BOOK 수정 요청 -- 모든 필드 선택적 */
export interface UpdateRefBookEntryRequest {
  summary?: string;
  impactLevel?: ImportanceLevel;
  affectedAirports?: string[];
  affectedRoutes?: string[];
  remarks?: string;
  status?: RefBookStatus;
  expiresAt?: string;
}
