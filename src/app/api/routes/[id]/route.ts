/**
 * 항로 상세 API
 *
 * 항로 + 영향 NOTAM 조회.
 *
 * @requirements FR-010
 */

import { NextResponse } from 'next/server';
import * as impactRepo from '@/lib/db/impact.repository';
import * as notamRepo from '@/lib/db/notam.repository';
import * as routeRepo from '@/lib/db/route.repository';

/**
 * 항로 상세 정보를 반환한다 (영향 + NOTAM 포함).
 *
 * @param _request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns 확장된 항로 데이터
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const route = routeRepo.findById(id);

  if (!route) {
    return NextResponse.json({ error: 'Not Found', message: `Route ${id} not found`, statusCode: 404 }, { status: 404 });
  }

  const impacts = impactRepo.findRouteImpactsByRoute(id);
  const notamIds = [...new Set(impacts.map((i) => i.notamId))];
  const activeNotams = notamIds
    .map((nid) => notamRepo.findById(nid))
    .filter((n) => n !== undefined && n.status !== 'expired' && n.status !== 'cancelled');

  return NextResponse.json({ ...route, impacts, activeNotams });
}
