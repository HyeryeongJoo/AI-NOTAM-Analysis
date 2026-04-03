/**
 * 대시보드 항로 영향 API
 *
 * 대시보드 요약 + 항로별 NOTAM 영향 지도 데이터.
 *
 * @requirements FR-006
 */

import { NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/dashboard.service';
import type { NextRequest } from 'next/server';

/**
 * 대시보드 데이터를 반환한다.
 *
 * @param request - HTTP 요청
 * @returns 요약 카드 + 항로별 영향 지도 + critical NOTAM
 */
export async function GET(request: NextRequest) {
  const routeIdFilter = request.nextUrl.searchParams.get('routeId') ?? undefined;
  const data = getDashboardData(routeIdFilter);
  return NextResponse.json(data);
}
