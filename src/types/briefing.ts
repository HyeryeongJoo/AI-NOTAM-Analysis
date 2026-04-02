/**
 * 브리핑 타입 정의
 *
 * AI가 생성한 운항 브리핑 문서 엔티티.
 *
 * @requirements FR-007, FR-008, FR-014
 */

/** 브리핑 문서 유형 */
export type BriefingType =
  | 'dispatcher-summary'
  | 'company-notam'
  | 'disp-comment'
  | 'crew-briefing';

/** 브리핑 문서 상태 */
export type BriefingStatus = 'draft' | 'pending-review' | 'approved' | 'distributed';

/** 브리핑 엔티티 -- AI가 생성한 문서 */
export interface Briefing {
  id: string;
  type: BriefingType;
  flightId: string;
  /** ISO-8601 생성 시각 */
  generatedAt: string;
  /** 마크다운 또는 JSON (crew-package인 경우) */
  content: string;
  notamIds: string[];
  status: BriefingStatus;
  approvedBy: string | null;
  /** ISO-8601 승인 시각 */
  approvedAt: string | null;
}

/** 브리핑 수정 요청 */
export interface UpdateBriefingRequest {
  content?: string;
  status?: BriefingStatus;
  approvedBy?: string;
}
