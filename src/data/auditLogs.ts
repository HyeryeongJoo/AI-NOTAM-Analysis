/**
 * 감사 로그 시드 데이터
 *
 * 운항관리사 행위 기록 15건. 다양한 액션 유형.
 *
 * @requirements FR-017
 */

import type { AuditLog } from '@/types/auditLog';

/**
 * 상대 시각을 생성한다.
 *
 * @param hoursOffset - 시간 오프셋
 * @returns ISO-8601 문자열
 */
function relHours(hoursOffset: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hoursOffset, 0, 0, 0);
  return d.toISOString();
}

/** 시드 감사 로그 데이터 (15건) */
export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    userId: 'dispatcher-001',
    action: 'view',
    targetType: 'notam',
    targetId: 'notam-001',
    details: 'NOTAM A1234/26 상세 조회',
    timestamp: relHours(-8),
  },
  {
    id: 'audit-002',
    userId: 'dispatcher-001',
    action: 'analyze',
    targetType: 'notam',
    targetId: 'notam-001',
    details: 'AI 분석 실행 — 중요도: critical (0.92)',
    timestamp: relHours(-7),
  },
  {
    id: 'audit-003',
    userId: 'dispatcher-001',
    action: 'register-ref-book',
    targetType: 'refBook',
    targetId: 'refbook-001',
    details: 'NOTAM A1234/26 REF BOOK 등재',
    timestamp: relHours(-7),
  },
  {
    id: 'audit-004',
    userId: 'dispatcher-001',
    action: 'analyze',
    targetType: 'notam',
    targetId: 'notam-002',
    details: 'AI 분석 실행 — 중요도: high (0.78)',
    timestamp: relHours(-6),
  },
  {
    id: 'audit-005',
    userId: 'dispatcher-001',
    action: 'register-ref-book',
    targetType: 'refBook',
    targetId: 'refbook-008',
    details: 'NOTAM A1235/26 REF BOOK 등재',
    timestamp: relHours(-6),
  },
  {
    id: 'audit-006',
    userId: 'dispatcher-001',
    action: 'generate-briefing',
    targetType: 'briefing',
    targetId: 'briefing-001',
    details: '7C101 운항 브리핑 생성 (dispatcher-summary)',
    timestamp: relHours(-5),
  },
  {
    id: 'audit-007',
    userId: 'dispatcher-001',
    action: 'approve',
    targetType: 'briefing',
    targetId: 'briefing-001',
    details: '7C101 브리핑 승인',
    timestamp: relHours(-4),
  },
  {
    id: 'audit-008',
    userId: 'dispatcher-002',
    action: 'view',
    targetType: 'notam',
    targetId: 'notam-011',
    details: 'NOTAM J4501/26 상세 조회',
    timestamp: relHours(-4),
  },
  {
    id: 'audit-009',
    userId: 'dispatcher-002',
    action: 'register-ref-book',
    targetType: 'refBook',
    targetId: 'refbook-004',
    details: 'NOTAM J4501/26 REF BOOK 등재',
    timestamp: relHours(-4),
  },
  {
    id: 'audit-010',
    userId: 'dispatcher-001',
    action: 'generate-briefing',
    targetType: 'briefing',
    targetId: 'briefing-002',
    details: '7C301 운항 브리핑 생성 (dispatcher-summary)',
    timestamp: relHours(-3),
  },
  {
    id: 'audit-011',
    userId: 'dispatcher-001',
    action: 'approve',
    targetType: 'briefing',
    targetId: 'briefing-002',
    details: '7C301 브리핑 승인',
    timestamp: relHours(-3),
  },
  {
    id: 'audit-012',
    userId: 'dispatcher-002',
    action: 'generate-briefing',
    targetType: 'briefing',
    targetId: 'briefing-003',
    details: '7C501 Company NOTAM 생성',
    timestamp: relHours(-2),
  },
  {
    id: 'audit-013',
    userId: 'dispatcher-002',
    action: 'approve',
    targetType: 'briefing',
    targetId: 'briefing-003',
    details: '7C501 Company NOTAM 승인',
    timestamp: relHours(-2),
  },
  {
    id: 'audit-014',
    userId: 'dispatcher-001',
    action: 'acknowledge-alert',
    targetType: 'notam',
    targetId: 'notam-004',
    details: 'NOTAM A1237/26 critical 알림 확인',
    timestamp: relHours(-1),
  },
  {
    id: 'audit-015',
    userId: 'dispatcher-001',
    action: 'view',
    targetType: 'notam',
    targetId: 'notam-023',
    details: 'NOTAM A1260/26 미사일 사격 훈련 조회',
    timestamp: relHours(-1),
  },
];
