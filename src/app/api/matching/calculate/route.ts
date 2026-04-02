/**
 * 매칭 계산 API
 *
 * NOTAM-항로/운항편 공간-시간 매칭 실행.
 *
 * @requirements FR-010
 */

import { NextResponse } from 'next/server';
import * as matchingService from '@/lib/services/matching.service';
import { matchingCalculateSchema } from '@/lib/validation/matching.validation';
import type { NextRequest } from 'next/server';

/**
 * NOTAM 매칭을 계산한다.
 *
 * @param request - HTTP 요청
 * @returns 새로 계산된 영향 기록
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = matchingCalculateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation Error', message: parsed.error.message, statusCode: 400 }, { status: 400 });
  }

  const result = matchingService.calculateAllImpacts(parsed.data.notamId);
  return NextResponse.json(result);
}
