/**
 * AI 응답 파싱 유틸리티
 *
 * LLM JSON 응답을 안전하게 파싱하고 검증하는 함수 모음.
 * 파싱 실패 시 도메인 기반 폴백 값을 반환.
 *
 * @requirements FR-001, FR-008, FR-009, FR-020
 */

import type {
  CrewPackageResult,
  NotamFieldExtractionResult,
  NotamImportanceResult,
  QCodeFallbackInfo,
  RouteAlternativeAiResult,
  TifrsDecisionResult,
} from './types';
import type { DecisionType } from '@/types/decision';
import type { ImportanceLevel } from '@/types/notam';

/** 중요도 등급별 기본 점수 매핑 */
const IMPORTANCE_SCORE_MAP: Record<ImportanceLevel, number> = {
  critical: 0.9,
  high: 0.7,
  medium: 0.5,
  low: 0.3,
  routine: 0.1,
};

/** 점수 범위별 등급 매핑 */
const SCORE_TO_LEVEL: Array<{ min: number; level: ImportanceLevel }> = [
  { min: 0.85, level: 'critical' },
  { min: 0.65, level: 'high' },
  { min: 0.4, level: 'medium' },
  { min: 0.2, level: 'low' },
  { min: 0.0, level: 'routine' },
];

/**
 * 점수에 맞는 중요도 등급을 반환한다.
 *
 * @param score - 0.0~1.0 사이의 중요도 점수
 * @returns 해당 등급
 */
function scoreToLevel(score: number): ImportanceLevel {
  for (const { min, level } of SCORE_TO_LEVEL) {
    if (score >= min) return level;
  }
  return 'routine';
}

/**
 * LLM 응답 텍스트에서 JSON 객체를 추출한다.
 *
 * @param text - LLM 응답 전체 텍스트
 * @returns 파싱된 객체 또는 null
 */
export function extractJson<T>(text: string): T | null {
  try {
    // JSON 블록을 중괄호 매칭으로 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    return null;
  }
}

/**
 * NOTAM 중요도 분석 응답을 파싱한다.
 *
 * @param text - LLM 응답 텍스트
 * @param fallback - Q-Code 기반 폴백 정보
 * @returns 파싱된 중요도 분석 결과
 */
export function parseImportanceResult(
  text: string,
  fallback: QCodeFallbackInfo | undefined,
): NotamImportanceResult {
  const parsed = extractJson<Record<string, unknown>>(text);

  if (
    parsed &&
    typeof parsed.importanceScore === 'number' &&
    typeof parsed.aiSummary === 'string'
  ) {
    const score = Math.max(0, Math.min(1, Number(parsed.importanceScore)));
    const declaredLevel = String(parsed.importanceLevel ?? '');
    // 점수-등급 일관성 보장: 점수 기준이 우선
    const level = isValidImportanceLevel(declaredLevel) ? declaredLevel : scoreToLevel(score);

    return {
      importanceScore: Math.round(score * 100) / 100,
      importanceLevel: level,
      aiSummary: String(parsed.aiSummary),
      aiAnalysis: String(parsed.aiAnalysis ?? ''),
    };
  }

  // 파싱 실패: Q-Code 기반 폴백
  const defaultLevel = fallback?.defaultImportance ?? 'medium';
  return {
    importanceScore: IMPORTANCE_SCORE_MAP[defaultLevel],
    importanceLevel: defaultLevel,
    aiSummary: fallback?.descriptionKo ?? text.slice(0, 200),
    aiAnalysis: text.slice(0, 500),
  };
}

/**
 * 승무원 브리핑 패키지 응답을 파싱한다.
 *
 * @param text - LLM 응답 텍스트
 * @returns 파싱된 크루 패키지 또는 원문 기반 폴백
 */
export function parseCrewPackageResult(text: string): CrewPackageResult {
  const parsed = extractJson<Record<string, unknown>>(text);

  if (parsed && typeof parsed.dispComment === 'string') {
    return {
      dispComment: String(parsed.dispComment),
      companyNotam: String(parsed.companyNotam ?? ''),
      crewBriefing: String(parsed.crewBriefing ?? ''),
    };
  }

  // 파싱 실패 폴백: 원문을 3등분
  const thirdLen = Math.ceil(text.length / 3);
  return {
    dispComment: text.slice(0, thirdLen),
    companyNotam: text.slice(thirdLen, thirdLen * 2),
    crewBriefing: text,
  };
}

/**
 * 대체 항로 제안 응답을 파싱한다.
 *
 * @param text - LLM 응답 텍스트
 * @returns 파싱된 결과 또는 null (폴백은 호출측에서 처리)
 */
export function parseRouteAlternativesResult(text: string): RouteAlternativeAiResult | null {
  const parsed = extractJson<Record<string, unknown>>(text);

  if (parsed && Array.isArray(parsed.alternatives)) {
    return {
      alternatives: parsed.alternatives.map((alt: Record<string, unknown>) => ({
        routeName: String(alt.routeName ?? ''),
        reason: String(alt.reason ?? ''),
        distanceDifference: Number(alt.distanceDifference ?? 0),
        timeDifference: Number(alt.timeDifference ?? 0),
      })),
      reasoning: String(parsed.reasoning ?? text),
    };
  }

  return null;
}

/**
 * NOTAM 본문 필드 추출 응답을 파싱한다.
 *
 * @param text - LLM 응답 텍스트
 * @returns 파싱된 필드 추출 결과 또는 null (추출 실패)
 */
export function parseFieldExtractionResult(text: string): NotamFieldExtractionResult | null {
  const parsed = extractJson<Record<string, unknown>>(text);
  if (!parsed) return null;

  const lat = parsed.latitude !== null && parsed.latitude !== undefined ? Number(parsed.latitude) : null;
  const lng = parsed.longitude !== null && parsed.longitude !== undefined ? Number(parsed.longitude) : null;
  const radius = parsed.radius !== null && parsed.radius !== undefined ? Math.round(Number(parsed.radius)) : null;

  /* 좌표 유효성: 위도 -90~90, 경도 -180~180 */
  if (lat !== null && (lat < -90 || lat > 90)) return null;
  if (lng !== null && (lng < -180 || lng > 180)) return null;
  if (radius !== null && (radius < 0 || radius > 999)) return null;

  /* 하나도 추출 못했으면 실패 */
  if (lat === null && lng === null && radius === null && !parsed.effectiveFrom && !parsed.effectiveTo) {
    return null;
  }

  return {
    latitude: lat ?? 0,
    longitude: lng ?? 0,
    radius: radius ?? 0,
    lowerLimit: parsed.lowerLimit ? String(parsed.lowerLimit) : 'SFC',
    upperLimit: parsed.upperLimit ? String(parsed.upperLimit) : 'UNL',
    effectiveFrom: parsed.effectiveFrom ? String(parsed.effectiveFrom) : '',
    effectiveTo: parsed.effectiveTo ? String(parsed.effectiveTo) : '',
  };
}

/**
 * 문자열이 유효한 ImportanceLevel인지 확인한다.
 *
 * @param value - 검사할 문자열
 * @returns ImportanceLevel 여부
 */
function isValidImportanceLevel(value: string): value is ImportanceLevel {
  return ['critical', 'high', 'medium', 'low', 'routine'].includes(value);
}

/** 유효한 의사결정 유형 목록 */
const VALID_DECISION_TYPES: DecisionType[] = [
  'no-action',
  'monitor',
  'route-change',
  'schedule-change',
  'cancel-flight',
  'divert',
];

/**
 * 문자열이 유효한 DecisionType인지 확인한다.
 *
 * @param value - 검사할 문자열
 * @returns DecisionType 여부
 */
function isValidDecisionType(value: string): value is DecisionType {
  return VALID_DECISION_TYPES.includes(value as DecisionType);
}

/**
 * TIFRS 의사결정 분석 응답을 파싱한다.
 *
 * @param text - LLM 응답 텍스트
 * @returns 파싱된 TIFRS 분석 결과 (파싱 실패 시 monitor 기본값)
 */
export function parseTifrsDecisionResult(text: string): TifrsDecisionResult {
  const parsed = extractJson<Record<string, unknown>>(text);

  if (
    parsed &&
    typeof parsed.suggestedDecision === 'string' &&
    typeof parsed.rationale === 'string'
  ) {
    const suggested = String(parsed.suggestedDecision);

    return {
      suggestedDecision: isValidDecisionType(suggested) ? suggested : 'monitor',
      tifrsTime: String(parsed.tifrsTime ?? '분석 정보 없음'),
      tifrsImpact: String(parsed.tifrsImpact ?? '분석 정보 없음'),
      tifrsFacilities: String(parsed.tifrsFacilities ?? '분석 정보 없음'),
      tifrsRoute: String(parsed.tifrsRoute ?? '분석 정보 없음'),
      tifrsSchedule: String(parsed.tifrsSchedule ?? '분석 정보 없음'),
      rationale: String(parsed.rationale),
    };
  }

  // 파싱 실패: 보수적 폴백 (모니터링 권고)
  return {
    suggestedDecision: 'monitor',
    tifrsTime: '자동 분석 실패 — 수동 확인 필요',
    tifrsImpact: '자동 분석 실패 — 수동 확인 필요',
    tifrsFacilities: '자동 분석 실패 — 수동 확인 필요',
    tifrsRoute: '자동 분석 실패 — 수동 확인 필요',
    tifrsSchedule: '자동 분석 실패 — 수동 확인 필요',
    rationale: text.slice(0, 500),
  };
}
