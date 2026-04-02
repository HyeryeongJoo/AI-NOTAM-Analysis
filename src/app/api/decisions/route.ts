/**
 * 의사결정 목록 API
 *
 * 모든 TIFRS 의사결정 기록을 필터링/정렬/페이지네이션하여 조회.
 *
 * @requirements FR-020
 */

import { NextResponse } from 'next/server';
import * as decisionRepository from '@/lib/db/decision.repository';
import { decisionQuerySchema } from '@/lib/validation/decision.validation';
import type { NextRequest } from 'next/server';

/**
 * 의사결정 기록 목록을 조회한다.
 *
 * @param request - Next.js 요청 객체 (쿼리 파라미터 포함)
 * @returns 페이지네이션된 의사결정 기록 목록
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const queryInput: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    queryInput[key] = value;
  }

  const parsed = decisionQuerySchema.safeParse(queryInput);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation Error', message: parsed.error.flatten(), statusCode: 400 },
      { status: 400 },
    );
  }

  const result = decisionRepository.findAll(parsed.data);
  return NextResponse.json(result);
}
