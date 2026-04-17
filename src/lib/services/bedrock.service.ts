/**
 * Amazon Bedrock AI 서비스
 *
 * Claude 모델을 통한 실제 LLM 호출. Mocking 금지.
 * NOTAM 중요도 분석, 한국어 요약, 영향 분석, 브리핑 생성, 대체 항로 제안.
 * XML 태그 기반 구조화 프롬프트로 도메인 최적화.
 *
 * @requirements FR-001, FR-003, FR-007, FR-008, FR-009, FR-014, FR-015, FR-020
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import {
  parseCrewPackageResult,
  parseFieldExtractionResult,
  parseImportanceResult,
  parseRouteAlternativesResult,
  parseTifrsDecisionResult,
} from '@/lib/ai/parsers';
import {
  IMPACT_ANALYSIS_SYSTEM_PROMPT,
  KOREAN_SUMMARY_SYSTEM_PROMPT,
  NOTAM_FIELD_EXTRACTION_SYSTEM_PROMPT,
  NOTAM_IMPORTANCE_SYSTEM_PROMPT,
  ROUTE_ALTERNATIVES_SYSTEM_PROMPT,
  SHIFT_HANDOVER_SYSTEM_PROMPT,
  TIFRS_DECISION_SYSTEM_PROMPT,
  getBriefingSystemPrompt,
} from '@/lib/ai/prompts/system';
import {
  buildBriefingMessage,
  buildCrewPackageMessage,
  buildFieldExtractionMessage,
  buildImpactAnalysisMessage,
  buildImportanceAnalysisMessage,
  buildKoreanSummaryMessage,
  buildRouteAlternativesMessage,
  buildShiftHandoverMessage,
  buildTifrsDecisionMessage,
} from '@/lib/ai/prompts/templates';
import type {
  CrewPackageResult,
  LlmInvokeOptions,
  NotamFieldExtractionResult,
  NotamImportanceResult,
  TifrsDecisionResult,
} from '@/lib/ai/types';
import type { Airport } from '@/types/airport';
import type { BriefingType } from '@/types/briefing';
import type { Flight } from '@/types/flight';
import type { NotamFlightImpact, NotamRouteImpact } from '@/types/impact';
import type { Notam } from '@/types/notam';
import type { QCode } from '@/types/qCode';
import type { Route, RouteAlternative } from '@/types/route';

/** Bedrock 클라이언트 싱글턴 */
const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? 'us-west-2',
});

/** 모델 ID -- Bedrock cross-region inference 지원 */
const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? 'us.anthropic.claude-sonnet-4-6';

/** 기본 최대 토큰 */
const DEFAULT_MAX_TOKENS = 4096;

/** 기본 온도 -- 구조화 출력에 적합한 낮은 온도 */
const DEFAULT_TEMPERATURE = 0.2;

/**
 * Bedrock Claude API를 호출한다.
 *
 * @param systemPrompt - 시스템 프롬프트 (역할, 지시, 출력 형식)
 * @param userMessage - 사용자 메시지 (입력 데이터)
 * @param options - 호출 옵션 (온도, 토큰 등)
 * @returns LLM 응답 텍스트
 * @throws Bedrock API 호출 실패 시 에러
 */
async function invokeModel(
  systemPrompt: string,
  userMessage: string,
  options: LlmInvokeOptions = {},
): Promise<string> {
  const { temperature = DEFAULT_TEMPERATURE, maxTokens = DEFAULT_MAX_TOKENS } = options;

  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    body: new TextEncoder().encode(body),
    contentType: 'application/json',
    accept: 'application/json',
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body)) as {
    content: Array<{ text: string }>;
  };
  return responseBody.content[0].text;
}

/**
 * NOTAM 원문에서 구조화 필드를 LLM으로 추출한다.
 *
 * 좌표, 반경, 고도, 유효시간을 ICAO NOTAM 형식에서 파싱.
 * 추출 실패 시 null 반환 (기존 값 유지).
 *
 * @param notam - 추출 대상 NOTAM
 * @returns 추출된 필드 또는 null
 */
export async function extractNotamFields(notam: Notam): Promise<NotamFieldExtractionResult | null> {
  const userMessage = buildFieldExtractionMessage(notam);
  const text = await invokeModel(NOTAM_FIELD_EXTRACTION_SYSTEM_PROMPT, userMessage, {
    temperature: 0.0,
    maxTokens: 1024,
  });
  return parseFieldExtractionResult(text);
}

/**
 * NOTAM 중요도를 AI로 분석한다.
 *
 * XML 태그 구조화 프롬프트와 NOTAM 도메인 전문 시스템 프롬프트를 사용.
 * Q-Code, 공항 인프라, 유효 기간을 종합적으로 고려하여 점수를 산정.
 * 파싱 실패 시 Q-Code 기반 폴백 값을 반환.
 *
 * @param notam - 분석 대상 NOTAM
 * @param qCode - Q-Code 참조 정보
 * @param airport - 해당 공항 정보
 * @param affectedFlights
 * @param affectedRoutes
 * @returns 중요도 점수, 등급, 한국어 요약, 영향 분석
 */
export async function analyzeNotamImportance(
  notam: Notam,
  qCode: QCode | undefined,
  airport: Airport | undefined,
  affectedFlights?: Flight[],
  affectedRoutes?: NotamRouteImpact[],
): Promise<NotamImportanceResult> {
  const userMessage = buildImportanceAnalysisMessage(
    notam,
    qCode,
    airport,
    affectedFlights,
    affectedRoutes,
  );
  const text = await invokeModel(NOTAM_IMPORTANCE_SYSTEM_PROMPT, userMessage, { temperature: 0.1 });

  const fallback = qCode
    ? {
        subject: qCode.subject,
        condition: qCode.condition,
        defaultImportance: qCode.defaultImportance,
        descriptionKo: qCode.descriptionKo,
      }
    : undefined;

  return parseImportanceResult(text, fallback);
}

/**
 * NOTAM 원문을 한국어로 요약한다.
 *
 * ICAO 약어를 풀어 설명하는 전문 번역 프롬프트 사용.
 *
 * @param notam - 요약 대상 NOTAM
 * @returns 한국어 요약 문자열
 */
export async function generateKoreanSummary(notam: Notam): Promise<string> {
  const userMessage = buildKoreanSummaryMessage(notam);
  return invokeModel(KOREAN_SUMMARY_SYSTEM_PROMPT, userMessage, { temperature: 0.3 });
}

/**
 * NOTAM 영향 분석 보고서를 생성한다.
 *
 * 항로/운항편 영향 데이터와 공항 인프라 정보를 결합하여
 * 제주항공 관점의 맥락적 분석을 생성.
 *
 * @param notam - 분석 대상 NOTAM
 * @param affectedRoutes - 영향받는 항로 목록
 * @param affectedFlights - 영향받는 운항편 목록
 * @param airport - 해당 공항 정보
 * @param flights
 * @returns 영향 분석 텍스트
 */
export async function generateImpactAnalysis(
  notam: Notam,
  affectedRoutes: NotamRouteImpact[],
  affectedFlights: NotamFlightImpact[],
  airport: Airport | undefined,
  flights?: Flight[],
): Promise<string> {
  const userMessage = buildImpactAnalysisMessage(
    notam,
    affectedRoutes,
    affectedFlights,
    airport,
    flights,
  );
  return invokeModel(IMPACT_ANALYSIS_SYSTEM_PROMPT, userMessage, { temperature: 0.3 });
}

/**
 * 운항 브리핑 문서를 생성한다.
 *
 * 브리핑 유형별로 최적화된 프롬프트를 사용하여
 * 운항관리사/승무원용 전문 문서를 생성.
 *
 * @param flight - 대상 운항편
 * @param notams - 관련 NOTAM 목록
 * @param briefingType - 브리핑 유형
 * @returns 브리핑 내용 (마크다운)
 */
export async function generateBriefingContent(
  flight: Flight,
  notams: Notam[],
  briefingType: BriefingType,
): Promise<string> {
  const systemPrompt = getBriefingSystemPrompt(briefingType);
  const userMessage = buildBriefingMessage(flight, notams);
  return invokeModel(systemPrompt, userMessage, { temperature: 0.4, maxTokens: 6144 });
}

/**
 * 승무원 브리핑 패키지를 생성한다.
 *
 * JSON 구조화 출력으로 3가지 문서를 동시 생성.
 * 파싱 실패 시 원문 기반 폴백.
 *
 * @param flight - 대상 운항편
 * @param notams - 관련 NOTAM 목록
 * @returns DISP Comment, Company NOTAM, Crew Briefing 세트
 */
export async function generateCrewPackage(
  flight: Flight,
  notams: Notam[],
): Promise<CrewPackageResult> {
  const systemPrompt = `<role>
당신은 제주항공 운항관리 AI입니다.
3가지 문서를 한 번에 생성하세요.
</role>

<instructions>
1. DISP Comment: 운항관리사의 전문적 코멘트 (간결, 3~5문장)
2. Company NOTAM: 회사 내부 NOTAM 형식 (리스트형, 각 항목 1~2줄)
3. Crew Briefing: 승무원용 브리핑 (출발-항로-도착 순, 주의 사항 중심)
한국어로 작성. ICAO 약어는 풀어서 설명.
</instructions>

<output_schema>
반드시 아래 JSON 형식으로만 응답하세요:
{"dispComment": "<text>", "companyNotam": "<text>", "crewBriefing": "<text>"}
</output_schema>

<constraints>
- JSON 형식만 출력
- 각 문서는 해당 독자(운항관리사/승무원)에게 적합한 톤
- 안전 관련 사항 빠짐없이 포함
</constraints>`;

  const userMessage = buildCrewPackageMessage(flight, notams);
  const text = await invokeModel(systemPrompt, userMessage, { temperature: 0.3, maxTokens: 6144 });

  return parseCrewPackageResult(text);
}

/**
 * 교대 인수인계 보고서를 생성한다.
 *
 * 교대 시간대의 NOTAM 현황을 종합하여 다음 근무자를 위한 보고서 생성.
 *
 * @param notams - 교대 시간 내 관련 NOTAM 목록
 * @param shiftStartTime - 교대 시작 시각
 * @param shiftEndTime - 교대 종료 시각
 * @returns 인수인계 보고서 텍스트 (마크다운)
 */
export async function generateShiftHandoverReport(
  notams: Notam[],
  shiftStartTime: string,
  shiftEndTime: string,
): Promise<string> {
  const userMessage = buildShiftHandoverMessage(notams, shiftStartTime, shiftEndTime);
  return invokeModel(SHIFT_HANDOVER_SYSTEM_PROMPT, userMessage, {
    temperature: 0.3,
    maxTokens: 6144,
  });
}

/**
 * 대체 항로를 제안한다.
 *
 * NOTAM 영향을 회피할 수 있는 대체 항로를 분석하고 비교.
 * JSON 구조화 출력으로 각 대체 항로의 장단점과 종합 권고를 생성.
 *
 * @param route - 영향받는 원래 항로
 * @param notam - 원인 NOTAM
 * @param alternateRoutes - 가용 대체 항로 목록
 * @returns 대체 항로 제안과 AI 근거
 */
export async function suggestRouteAlternatives(
  route: Route,
  notam: Notam,
  alternateRoutes: Route[],
): Promise<{ alternatives: RouteAlternative[]; reasoning: string }> {
  if (alternateRoutes.length === 0) {
    return {
      alternatives: [],
      reasoning: `항로 ${route.routeName}에 대한 등록된 대체 항로가 없습니다.`,
    };
  }

  const userMessage = buildRouteAlternativesMessage(route, notam, alternateRoutes);
  const text = await invokeModel(ROUTE_ALTERNATIVES_SYSTEM_PROMPT, userMessage, {
    temperature: 0.2,
  });

  const aiResult = parseRouteAlternativesResult(text);

  const alternatives: RouteAlternative[] = alternateRoutes.map((altRoute, idx) => {
    const altInfo = aiResult?.alternatives?.[idx];
    return {
      route: altRoute,
      reason: altInfo?.reason ?? `${altRoute.routeName} 대체 항로 사용 가능`,
      distanceDifference: altInfo?.distanceDifference ?? altRoute.distance - route.distance,
      timeDifference:
        altInfo?.timeDifference ?? Math.round((altRoute.distance - route.distance) / 8),
      avoidedNotams: [notam.id],
    };
  });

  return {
    alternatives,
    reasoning: aiResult?.reasoning ?? text,
  };
}

/**
 * TIFRS 프레임워크로 NOTAM 의사결정을 AI 분석한다.
 *
 * Time, Impact, Facilities, Route, Schedule 5가지 기준으로
 * NOTAM 영향을 평가하고, 의사결정 유형을 제안한다.
 * 운항관리사가 최종 결정 전에 참고하는 AI 사전 분석.
 *
 * @param notam - 분석 대상 NOTAM
 * @param affectedRoutes - 영향받는 항로 목록
 * @param affectedFlights - 영향받는 운항편 목록
 * @param airport - 해당 공항 정보
 * @returns TIFRS 분석 결과와 제안 의사결정
 */
export async function analyzeTifrsDecision(
  notam: Notam,
  affectedRoutes: NotamRouteImpact[],
  affectedFlights: NotamFlightImpact[],
  airport: Airport | undefined,
): Promise<TifrsDecisionResult> {
  const userMessage = buildTifrsDecisionMessage(notam, affectedRoutes, affectedFlights, airport);
  const text = await invokeModel(TIFRS_DECISION_SYSTEM_PROMPT, userMessage, { temperature: 0.2 });

  return parseTifrsDecisionResult(text);
}
