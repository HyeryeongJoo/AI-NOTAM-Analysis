/**
 * NOTAM 통계 API
 *
 * 중요도/상태별 카운트 및 만료 임박 수.
 *
 * @requirements FR-005
 */

import { NextResponse } from 'next/server';
import * as notamRepo from '@/lib/db/notam.repository';

/**
 * NOTAM 통계를 반환한다.
 *
 * @returns 통계 데이터
 */
export async function GET() {
  const stats = notamRepo.getStats();
  return NextResponse.json(stats);
}
