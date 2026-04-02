/**
 * TIFRS 의사결정 기록 타입 정의
 *
 * Time, Impact, Facilities, Route, Schedule 5가지 기준으로
 * NOTAM에 대한 운항관리사의 의사결정을 구조화하여 기록한다.
 *
 * @requirements FR-020
 */

/** 의사결정 유형 -- NOTAM 영향에 대한 대응 조치 분류 */
export type DecisionType =
  | 'no-action'
  | 'monitor'
  | 'route-change'
  | 'schedule-change'
  | 'cancel-flight'
  | 'divert';

/** TIFRS 의사결정 기록 엔티티 */
export interface DecisionRecord {
  id: string;
  /** 대상 NOTAM ID */
  notamId: string;
  /** 의사결정 운항관리사 ID */
  decidedBy: string;
  /** 의사결정 시각 (ISO-8601) */
  decidedAt: string;
  /** TIFRS - Time: 시간적 영향 분석 */
  tifrsTime: string;
  /** TIFRS - Impact: 운영 영향 심각도 */
  tifrsImpact: string;
  /** TIFRS - Facilities: 영향받는 시설/장비 */
  tifrsFacilities: string;
  /** TIFRS - Route: 영향받는 항로 구간 */
  tifrsRoute: string;
  /** TIFRS - Schedule: 운항 스케줄 영향 */
  tifrsSchedule: string;
  /** 운항관리사 최종 결정 */
  overallDecision: DecisionType;
  /** 운항관리사 결정 근거 */
  rationale: string;
  /** AI 제안 의사결정 유형 */
  aiSuggestedDecision: DecisionType;
  /** AI 제안 근거 */
  aiRationale: string;
}

/** 의사결정 기록 생성 요청 (운항관리사 입력 필드) */
export interface CreateDecisionRecordRequest {
  notamId: string;
  tifrsTime: string;
  tifrsImpact: string;
  tifrsFacilities: string;
  tifrsRoute: string;
  tifrsSchedule: string;
  overallDecision: DecisionType;
  rationale: string;
}
