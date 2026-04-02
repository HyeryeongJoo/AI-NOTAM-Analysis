/**
 * 대체 항로 제안 API
 *
 * AI를 활용한 우회 항로 분석.
 *
 * @requirements FR-009
 */

import { NextResponse } from 'next/server';
import * as notamRepo from '@/lib/db/notam.repository';
import * as routeRepo from '@/lib/db/route.repository';
import * as bedrockService from '@/lib/services/bedrock.service';
import { routeAlternativesSchema } from '@/lib/validation/route.validation';

/**
 * NOTAM에 대한 대체 항로를 AI로 제안한다.
 *
 * @param request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns 대체 항로 목록 + AI 분석
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = routeAlternativesSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation Error', message: parsed.error.message, statusCode: 400 }, { status: 400 });
  }

  const route = routeRepo.findById(id);
  if (!route) {
    return NextResponse.json({ error: 'Not Found', message: 'Route not found', statusCode: 404 }, { status: 404 });
  }

  const notam = notamRepo.findById(parsed.data.notamId);
  if (!notam) {
    return NextResponse.json({ error: 'Not Found', message: 'NOTAM not found', statusCode: 404 }, { status: 404 });
  }

  const alternates = routeRepo.findAlternates(id);

  try {
    const result = await bedrockService.suggestRouteAlternatives(route, notam, alternates);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Route alternatives suggestion failed:', err);
    // 폴백: 기본 대체 항로 정보 반환
    const alternatives = alternates.map((alt) => ({
      route: alt,
      reason: `${alt.routeName} 대체 항로`,
      distanceDifference: alt.distance - route.distance,
      timeDifference: Math.round((alt.distance - route.distance) / 8),
      avoidedNotams: [notam.id],
    }));

    return NextResponse.json({
      alternatives,
      reasoning: `대체 항로 ${alternates.length}개 가용. AI 분석 불가.`,
    });
  }
}
