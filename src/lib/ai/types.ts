/**
 * AI 관련 타입 정의
 *
 * Bedrock LLM 호출 및 응답 파싱에 사용되는 타입.
 *
 * @requirements FR-001, FR-003, FR-007, FR-008, FR-009, FR-014, FR-015
 */

import type { ImportanceLevel } from '@/types/notam';

/** NOTAM 중요도 분석 결과 -- LLM 구조화 출력 */
export interface NotamImportanceResult {
  importanceScore: number;
  importanceLevel: ImportanceLevel;
  aiSummary: string;
  aiAnalysis: string;
}

/** 승무원 브리핑 패키지 -- LLM이 3개 문서를 동시 생성 */
export interface CrewPackageResult {
  dispComment: string;
  companyNotam: string;
  crewBriefing: string;
}

/** 대체 항로 AI 분석 항목 */
export interface RouteAlternativeAiItem {
  routeName: string;
  reason: string;
  distanceDifference: number;
  timeDifference: number;
}

/** 대체 항로 AI 분석 결과 */
export interface RouteAlternativeAiResult {
  alternatives: RouteAlternativeAiItem[];
  reasoning: string;
}

/** LLM 호출 설정 옵션 */
export interface LlmInvokeOptions {
  temperature?: number;
  maxTokens?: number;
}

/** Q-Code 기반 분류 결과 (LLM 폴백용) */
export interface QCodeFallbackInfo {
  subject: string;
  condition: string;
  defaultImportance: ImportanceLevel;
  descriptionKo: string;
}
