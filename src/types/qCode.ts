/**
 * Q-Code 타입 정의
 *
 * ICAO Q-Code 해석 테이블 참조 데이터.
 *
 * @requirements FR-002
 */

import type { ImportanceLevel } from './notam';

/** Q-Code 참조 데이터 -- ICAO Q-Code 해석 테이블 */
export interface QCode {
  /** 5글자 코드 (예: QMRLC) */
  code: string;
  /** 주제 (예: Runway) */
  subject: string;
  /** 상태 (예: Closed) */
  condition: string;
  /** 영문 설명 */
  description: string;
  /** 한국어 설명 */
  descriptionKo: string;
  defaultImportance: ImportanceLevel;
}
