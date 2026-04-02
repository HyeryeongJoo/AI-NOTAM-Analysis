/**
 * 항로 목록 API
 *
 * @requirements FR-006, FR-010
 */

import { NextResponse } from 'next/server';
import * as routeRepo from '@/lib/db/route.repository';
import { routeQuerySchema } from '@/lib/validation/route.validation';
import type { NextRequest } from 'next/server';

/**
 * 항로 목록을 조회한다.
 *
 * @param request - HTTP 요청
 * @returns 페이지네이션된 항로 목록
 */
export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = routeQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters', message: parsed.error.message, statusCode: 400 }, { status: 400 });
  }

  const result = routeRepo.findAll(parsed.data);
  return NextResponse.json(result);
}
