/**
 * NOTAM 영향 항로 API
 *
 * @requirements FR-004
 */

import { NextResponse } from 'next/server';
import * as impactRepo from '@/lib/db/impact.repository';
import * as notamRepo from '@/lib/db/notam.repository';

/**
 * NOTAM에 영향받는 항로 목록을 반환한다.
 *
 * @param _request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns 항로 영향 배열
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notam = notamRepo.findById(id);

  if (!notam) {
    return NextResponse.json({ error: 'Not Found', message: 'NOTAM not found', statusCode: 404 }, { status: 404 });
  }

  const impacts = impactRepo.findRouteImpactsByNotam(id);
  return NextResponse.json(impacts);
}
