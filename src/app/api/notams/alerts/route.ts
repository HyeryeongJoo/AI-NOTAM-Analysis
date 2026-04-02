/**
 * NOTAM 알림 API
 *
 * critical/high 중요도의 new/active NOTAM 조회.
 *
 * @requirements FR-016
 */

import { NextResponse } from 'next/server';
import * as notamRepo from '@/lib/db/notam.repository';

/**
 * 긴급 알림 대상 NOTAM 목록을 반환한다.
 *
 * @returns critical/high NOTAM 배열
 */
export async function GET() {
  const alerts = notamRepo.findAlerts();
  return NextResponse.json(alerts);
}
