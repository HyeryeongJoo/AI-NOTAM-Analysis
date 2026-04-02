/**
 * NOTAM 의사결정 API
 *
 * 특정 NOTAM에 대한 TIFRS 의사결정 기록을 조회하거나 생성한다.
 * POST 시 Bedrock AI가 TIFRS 분석을 사전 수행하고, 운항관리사 입력과 결합하여 기록.
 *
 * @requirements FR-020, FR-017
 */

import { NextResponse } from 'next/server';
import * as auditLogRepository from '@/lib/db/auditLog.repository';
import * as decisionRepository from '@/lib/db/decision.repository';
import * as impactRepository from '@/lib/db/impact.repository';
import * as notamRepository from '@/lib/db/notam.repository';
import { getStore } from '@/lib/db/store';
import { analyzeTifrsDecision } from '@/lib/services/bedrock.service';
import { createDecisionRecordSchema } from '@/lib/validation/decision.validation';
import type { NextRequest } from 'next/server';

/**
 * 특정 NOTAM의 의사결정 기록을 조회한다.
 *
 * @param _request - Next.js 요청 객체
 * @param context - 라우트 파라미터 컨텍스트
 * @param context.params - NOTAM ID를 포함하는 파라미터
 * @returns 의사결정 기록 또는 404
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const decision = decisionRepository.findByNotamId(id);

  if (!decision) {
    return NextResponse.json(
      {
        error: 'Not Found',
        message: `해당 NOTAM(${id})에 대한 의사결정 기록이 없습니다.`,
        statusCode: 404,
      },
      { status: 404 },
    );
  }

  return NextResponse.json(decision);
}

/**
 * 특정 NOTAM에 대한 TIFRS 의사결정을 기록한다.
 *
 * AI가 TIFRS 분석을 사전 수행하고, 운항관리사의 최종 결정과 함께 저장.
 *
 * @param request - Next.js 요청 객체
 * @param context - 라우트 파라미터 컨텍스트
 * @param context.params - NOTAM ID를 포함하는 파라미터
 * @returns 생성된 의사결정 기록
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  // 요청 본문 검증
  const body: unknown = await request.json();
  const parsed = createDecisionRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation Error', message: parsed.error.flatten(), statusCode: 400 },
      { status: 400 },
    );
  }

  // NOTAM 존재 확인
  const notam = notamRepository.findById(id);
  if (!notam) {
    return NextResponse.json(
      { error: 'Not Found', message: `NOTAM(${id})을 찾을 수 없습니다.`, statusCode: 404 },
      { status: 404 },
    );
  }

  // 영향 데이터 조회
  const affectedRoutes = impactRepository.findRouteImpactsByNotam(id);
  const affectedFlights = impactRepository.findFlightImpactsByNotam(id);

  // 공항 정보 조회
  const store = getStore();
  const airport = store.airports.get(notam.locationIndicator);

  // Bedrock AI TIFRS 분석
  const aiAnalysis = await analyzeTifrsDecision(notam, affectedRoutes, affectedFlights, airport);

  // 의사결정 기록 생성 (운항관리사 입력 + AI 분석)
  // 프로토타입에서 decidedBy는 기본 dispatcher 사용
  const decision = decisionRepository.create({
    ...parsed.data,
    notamId: id,
    decidedBy: 'dispatcher-001',
    aiSuggestedDecision: aiAnalysis.suggestedDecision,
    aiRationale: aiAnalysis.rationale,
  });

  // 감사 로그 기록
  auditLogRepository.create({
    userId: 'dispatcher-001',
    action: 'record-decision',
    targetType: 'decision',
    targetId: decision.id,
    details: `NOTAM ${notam.series}${notam.number}/${notam.year}에 대한 TIFRS 의사결정 기록: ${decision.overallDecision}`,
  });

  return NextResponse.json(decision, { status: 201 });
}
