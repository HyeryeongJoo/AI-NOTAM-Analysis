/**
 * NOTAM 목록 API
 *
 * 필터링, 정렬, 페이지네이션을 지원하는 NOTAM 목록 조회.
 *
 * @requirements FR-001, FR-005, FR-019
 */

import { NextResponse } from 'next/server';
import * as notamRepo from '@/lib/db/notam.repository';
import { notamQuerySchema } from '@/lib/validation/notam.validation';
import type { NextRequest } from 'next/server';

/**
 * NOTAM 목록을 조회한다.
 *
 * @param request - HTTP 요청
 * @returns 페이지네이션된 NOTAM 목록 + 통계
 */
export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = notamQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters', message: parsed.error.message, statusCode: 400 }, { status: 400 });
  }

  const result = notamRepo.findAll(parsed.data);
  return NextResponse.json(result);
}
