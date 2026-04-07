/**
 * NOTAM 영향 운항편 API
 *
 * @requirements FR-004
 */

import { NextResponse } from 'next/server';
import * as flightRepo from '@/lib/db/flight.repository';
import * as impactRepo from '@/lib/db/impact.repository';
import * as notamRepo from '@/lib/db/notam.repository';

/**
 * NOTAM에 영향받는 운항편 목록을 반환한다.
 *
 * @param _request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns 운항편 영향 배열
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notam = notamRepo.findById(id);

  if (!notam) {
    return NextResponse.json(
      { error: 'Not Found', message: 'NOTAM not found', statusCode: 404 },
      { status: 404 },
    );
  }

  const impacts = impactRepo.findFlightImpactsByNotam(id);
  const enriched = impacts.map((impact) => {
    const flight = flightRepo.findById(impact.flightId);
    return { ...impact, flightNumber: flight?.flightNumber ?? impact.flightId };
  });
  return NextResponse.json(enriched);
}
