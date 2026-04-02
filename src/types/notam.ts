/**
 * NOTAM 타입 정의
 *
 * ICAO 표준 NOTAM 형식의 구조화된 TypeScript 표현.
 * 프론트엔드와 백엔드가 공유하는 핵심 엔티티.
 *
 * @requirements FR-001, FR-002, FR-005, FR-012, FR-015, FR-018, FR-019
 */

/** NOTAM 유형 -- ICAO 표준에 따른 3가지 유형 */
export type NotamType = 'NOTAMN' | 'NOTAMR' | 'NOTAMC';

/** NOTAM 처리 상태 -- 수신부터 만료/취소까지 라이프사이클 */
export type NotamStatus =
  | 'new'
  | 'active'
  | 'analyzed'
  | 'ref-book-registered'
  | 'expired'
  | 'cancelled'
  | 'replaced';

/** 중요도 등급 -- AI 스코어링 결과를 5단계로 분류 */
export type ImportanceLevel = 'critical' | 'high' | 'medium' | 'low' | 'routine';

/** NOTAM 엔티티 -- ICAO 형식 NOTAM의 구조화된 표현 */
export interface Notam {
  id: string;
  series: string;
  number: number;
  year: number;
  type: NotamType;
  qCode: string;
  qCodeSubject: string;
  qCodeCondition: string;
  fir: string;
  trafficType: string;
  purpose: string;
  scope: string;
  lowerLimit: string;
  upperLimit: string;
  latitude: number;
  longitude: number;
  /** 해리(nautical miles) 단위 반경 */
  radius: number;
  /** ICAO 공항 코드 */
  locationIndicator: string;
  /** ISO-8601 유효 시작 시각 */
  effectiveFrom: string;
  /** ISO-8601 유효 종료 시각 또는 'PERM' */
  effectiveTo: string;
  schedule: string | null;
  /** Field E 본문 */
  body: string;
  /** 전체 원문 */
  rawText: string;
  /** AI 중요도 점수 (0.0 ~ 1.0) */
  importanceScore: number;
  importanceLevel: ImportanceLevel;
  /** AI 생성 한국어 요약 */
  aiSummary: string | null;
  /** AI 생성 영향 분석 */
  aiAnalysis: string | null;
  status: NotamStatus;
  /** NOTAMR인 경우 대체 대상 ID */
  replacesNotamId: string | null;
  /** ISO-8601 생성 시각 */
  createdAt: string;
}

/** NOTAM 통계 -- 대시보드 및 필터링 카운트용 */
export interface NotamStats {
  total: number;
  bySeverity: Record<ImportanceLevel, number>;
  byStatus: Record<NotamStatus, number>;
  expiringSoon: number;
}

/** NOTAM 변경 사항 -- NOTAMR diff 뷰에 표시할 필드별 차이 */
export interface DiffChange {
  field: string;
  oldValue: string;
  newValue: string;
}
