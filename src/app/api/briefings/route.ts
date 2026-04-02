/**
 * 브리핑 목록 API
 *
 * @requirements FR-007, FR-008
 */

import { NextResponse } from 'next/server';
import * as briefingRepo from '@/lib/db/briefing.repository';
import type { NextRequest } from 'next/server';

/**
 * 브리핑 목록을 조회한다.
 *
 * @param request - HTTP 요청
 * @returns 페이지네이션된 브리핑 목록
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const result = briefingRepo.findAll({
    flightId: sp.get('flightId') ?? undefined,
    type: (sp.get('type') as 'dispatcher-summary' | 'company-notam' | 'disp-comment' | 'crew-briefing') || undefined,
    status: (sp.get('status') as 'draft' | 'pending-review' | 'approved' | 'distributed') || undefined,
    sortBy: sp.get('sortBy') ?? undefined,
    order: sp.get('order') ?? undefined,
    page: parseInt(sp.get('page') ?? '1', 10),
    pageSize: parseInt(sp.get('pageSize') ?? '20', 10),
  });

  return NextResponse.json(result);
}
