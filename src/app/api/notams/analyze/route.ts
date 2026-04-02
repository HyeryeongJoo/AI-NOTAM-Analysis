/**
 * NOTAM AI 분석 API
 *
 * Amazon Bedrock Claude를 통한 중요도 분석.
 *
 * @requirements FR-001, FR-003
 */

import { NextResponse } from 'next/server';
import * as airportRepo from '@/lib/db/airport.repository';
import * as notamRepo from '@/lib/db/notam.repository';
import { findByCode } from '@/lib/db/qCode.repository';
import * as bedrockService from '@/lib/services/bedrock.service';
import { classifyByQCode } from '@/lib/services/qCode.service';
import { analyzeNotamSchema } from '@/lib/validation/notam.validation';
import type { NextRequest } from 'next/server';

/**
 * NOTAM 중요도를 AI로 분석한다.
 *
 * @param request - HTTP 요청
 * @returns AI 분석 결과 (점수, 등급, 요약, 분석)
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = analyzeNotamSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation Error', message: parsed.error.message, statusCode: 400 }, { status: 400 });
  }

  const notam = notamRepo.findById(parsed.data.notamId);
  if (!notam) {
    return NextResponse.json({ error: 'Not Found', message: 'NOTAM not found', statusCode: 404 }, { status: 404 });
  }

  const qCode = findByCode(notam.qCode);
  const airport = airportRepo.findByIcao(notam.locationIndicator);

  try {
    const result = await bedrockService.analyzeNotamImportance(notam, qCode, airport);

    // NOTAM 레코드 업데이트
    notamRepo.update(notam.id, {
      importanceScore: result.importanceScore,
      importanceLevel: result.importanceLevel,
      aiSummary: result.aiSummary,
      aiAnalysis: result.aiAnalysis,
      status: 'analyzed',
    });

    return NextResponse.json(result);
  } catch (err) {
    // Bedrock 호출 실패 시 Q-Code 기본값으로 폴백
    const classification = classifyByQCode(notam.qCode);
    const scoreMap = { critical: 0.9, high: 0.7, medium: 0.5, low: 0.3, routine: 0.1 } as const;

    const fallback = {
      importanceScore: scoreMap[classification.defaultImportance],
      importanceLevel: classification.defaultImportance,
      aiSummary: classification.descriptionKo,
      aiAnalysis: `Q-Code 기반 분류: ${classification.descriptionKo}. AI 분석 실패로 규칙 기반 평가 적용.`,
    };

    notamRepo.update(notam.id, { ...fallback, status: 'analyzed' });

    console.error('Bedrock invocation failed, using Q-Code fallback:', err);
    return NextResponse.json(fallback);
  }
}
