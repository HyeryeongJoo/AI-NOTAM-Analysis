/**
 * 매칭 결과 조회 API
 *
 * 기존 매칭 결과를 필터링하여 조회.
 *
 * @requirements FR-010
 */

import { NextResponse } from 'next/server';
import * as impactRepo from '@/lib/db/impact.repository';
import type { NextRequest } from 'next/server';

/**
 * 매칭 결과를 조회한다.
 *
 * @param request - HTTP 요청
 * @returns 필터링된 영향 기록
 */
export async function GET(request: NextRequest) {
  const notamId = request.nextUrl.searchParams.get('notamId') ?? undefined;
  const routeId = request.nextUrl.searchParams.get('routeId') ?? undefined;
  const flightId = request.nextUrl.searchParams.get('flightId') ?? undefined;

  const result = impactRepo.findAll({ notamId, routeId, flightId });
  return NextResponse.json(result);
}
