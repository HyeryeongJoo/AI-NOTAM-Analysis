/**
 * 운항편 목록 API
 *
 * @requirements FR-013
 */

import { NextResponse } from 'next/server';
import * as flightRepo from '@/lib/db/flight.repository';
import { flightQuerySchema } from '@/lib/validation/flight.validation';
import type { NextRequest } from 'next/server';

/**
 * 운항편 목록을 조회한다.
 *
 * @param request - HTTP 요청
 * @returns 페이지네이션된 운항편 목록
 */
export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = flightQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters', message: parsed.error.message, statusCode: 400 }, { status: 400 });
  }

  const result = flightRepo.findAll(parsed.data);
  return NextResponse.json(result);
}
