/**
 * NOTAM 자동 처리 파이프라인 API
 *
 * 3단계 체이닝: 필드 추출 → 중요도 분석 → 영향 매칭.
 * 각 단계 실패 시 다음 단계를 계속 진행한다 (부분 성공 허용).
 *
 * @requirements FR-001, FR-003, FR-004
 */

import { NextResponse } from 'next/server';
import * as airportRepo from '@/lib/db/airport.repository';
import * as flightRepo from '@/lib/db/flight.repository';
import * as impactRepo from '@/lib/db/impact.repository';
import * as notamRepo from '@/lib/db/notam.repository';
import { findByCode } from '@/lib/db/qCode.repository';
import * as bedrockService from '@/lib/services/bedrock.service';
import * as matchingService from '@/lib/services/matching.service';
import { classifyByQCode } from '@/lib/services/qCode.service';

/** 파이프라인 단계별 결과 */
interface PipelineResult {
  notamId: string;
  extraction: { success: boolean; updatedFields?: string[] };
  analysis: {
    success: boolean;
    importanceScore?: number;
    importanceLevel?: string;
  };
  matching: {
    success: boolean;
    routeImpacts?: number;
    flightImpacts?: number;
  };
  errors: string[];
}

/**
 * NOTAM을 3단계 파이프라인으로 처리한다.
 *
 * @param _request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns 파이프라인 처리 결과
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const notam = notamRepo.findById(id);

  if (!notam) {
    return NextResponse.json(
      { error: 'Not Found', message: 'NOTAM not found', statusCode: 404 },
      { status: 404 },
    );
  }

  const result: PipelineResult = {
    notamId: id,
    extraction: { success: false },
    analysis: { success: false },
    matching: { success: false },
    errors: [],
  };

  /* Step 1: 필드 추출 — NOTAM 원문에서 좌표/반경/고도/유효시간 LLM 추출 */
  try {
    const extracted = await bedrockService.extractNotamFields(notam);
    if (extracted) {
      const updatedFields: string[] = [];
      const updateData: Partial<typeof notam> = {};

      /* 추출된 좌표가 유효하면 업데이트 */
      if (extracted.latitude !== 0 && extracted.longitude !== 0) {
        updateData.latitude = extracted.latitude;
        updateData.longitude = extracted.longitude;
        updatedFields.push('latitude', 'longitude');
      }
      if (extracted.radius > 0) {
        updateData.radius = extracted.radius;
        updatedFields.push('radius');
      }
      if (extracted.lowerLimit) {
        updateData.lowerLimit = extracted.lowerLimit;
        updatedFields.push('lowerLimit');
      }
      if (extracted.upperLimit) {
        updateData.upperLimit = extracted.upperLimit;
        updatedFields.push('upperLimit');
      }
      if (extracted.effectiveFrom) {
        updateData.effectiveFrom = extracted.effectiveFrom;
        updatedFields.push('effectiveFrom');
      }
      if (extracted.effectiveTo) {
        updateData.effectiveTo = extracted.effectiveTo;
        updatedFields.push('effectiveTo');
      }

      if (updatedFields.length > 0) {
        notamRepo.update(id, updateData);
      }
      result.extraction = { success: true, updatedFields };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(`필드 추출 실패: ${msg}`);
  }

  /* 최신 NOTAM 데이터 리로드 (추출로 업데이트 되었을 수 있음) */
  const updatedNotam = notamRepo.findById(id) ?? notam;

  /* Step 2: 중요도 분석 — Bedrock AI로 종합 중요도 산정 */
  const qCode = findByCode(updatedNotam.qCode);
  const airport = airportRepo.findByIcao(updatedNotam.locationIndicator);

  /* 기존 영향 데이터 조회 (분석에 컨텍스트로 제공) */
  const routeImpacts = impactRepo.findRouteImpactsByNotam(id);
  const flightImpacts = impactRepo.findFlightImpactsByNotam(id);
  const affectedFlightIds = [...new Set(flightImpacts.map((fi) => fi.flightId))];
  const affectedFlights = affectedFlightIds
    .map((fid) => flightRepo.findById(fid))
    .filter((f) => f !== undefined);

  try {
    const analysisResult = await bedrockService.analyzeNotamImportance(
      updatedNotam,
      qCode,
      airport,
      affectedFlights,
      routeImpacts,
    );

    notamRepo.update(id, {
      importanceScore: analysisResult.importanceScore,
      importanceLevel: analysisResult.importanceLevel,
      aiSummary: analysisResult.aiSummary,
      aiAnalysis: analysisResult.aiAnalysis,
      status: 'analyzed',
    });

    result.analysis = {
      success: true,
      importanceScore: analysisResult.importanceScore,
      importanceLevel: analysisResult.importanceLevel,
    };
  } catch (err) {
    /* Bedrock 실패 시 Q-Code 폴백 */
    const classification = classifyByQCode(updatedNotam.qCode);
    const scoreMap = { critical: 0.9, high: 0.7, medium: 0.5, low: 0.3, routine: 0.1 } as const;

    notamRepo.update(id, {
      importanceScore: scoreMap[classification.defaultImportance],
      importanceLevel: classification.defaultImportance,
      aiSummary: classification.descriptionKo,
      aiAnalysis: `Q-Code 기반 분류: ${classification.descriptionKo}`,
      status: 'analyzed',
    });

    result.analysis = {
      success: false,
      importanceScore: scoreMap[classification.defaultImportance],
      importanceLevel: classification.defaultImportance,
    };

    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(`AI 분석 실패 (Q-Code 폴백 적용): ${msg}`);
  }

  /* Step 3: 영향 매칭 — 항로/운항편 시공간 교차 분석 */
  try {
    const impacts = matchingService.calculateAllImpacts(id);
    result.matching = {
      success: true,
      routeImpacts: impacts.routeImpacts.length,
      flightImpacts: impacts.flightImpacts.length,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(`영향 매칭 실패: ${msg}`);
  }

  return NextResponse.json(result);
}
