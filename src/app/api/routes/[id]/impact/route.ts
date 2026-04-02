/**
 * 항로 영향 API
 *
 * 특정 항로에 대한 NOTAM 영향 목록.
 *
 * @requirements FR-010
 */

import { NextResponse } from 'next/server';
import * as impactRepo from '@/lib/db/impact.repository';
import * as notamRepo from '@/lib/db/notam.repository';
import * as routeRepo from '@/lib/db/route.repository';

/**
 * 항로의 NOTAM 영향 목록과 요약을 반환한다.
 *
 * @param _request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns 영향 목록 + 요약 문자열
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const route = routeRepo.findById(id);

  if (!route) {
    return NextResponse.json({ error: 'Not Found', message: 'Route not found', statusCode: 404 }, { status: 404 });
  }

  const notamImpacts = impactRepo.findRouteImpactsByRoute(id);

  // 요약 생성
  const criticalCount = notamImpacts.filter((ni) => {
    const n = notamRepo.findById(ni.notamId);
    return n?.importanceLevel === 'critical';
  }).length;

  const summary = `항로 ${route.routeName}: NOTAM 영향 ${notamImpacts.length}건 (critical ${criticalCount}건)`;

  return NextResponse.json({ notamImpacts, summary });
}
