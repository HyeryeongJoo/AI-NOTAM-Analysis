/**
 * 감사 로그 타입 정의
 *
 * 운항관리사 행위 기록을 위한 감사 추적 엔티티.
 *
 * @requirements FR-017
 */

/** 감사 로그 액션 유형 */
export type AuditAction =
  | 'view'
  | 'analyze'
  | 'approve'
  | 'reject'
  | 'register-ref-book'
  | 'generate-briefing'
  | 'acknowledge-alert'
  | 'record-decision';

/** 감사 로그 엔티티 -- 운항관리사 행위 기록 */
export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  details: string;
  /** ISO-8601 기록 시각 */
  timestamp: string;
}

/** 감사 로그 생성 요청 */
export interface CreateAuditLogRequest {
  userId: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  details: string;
}
