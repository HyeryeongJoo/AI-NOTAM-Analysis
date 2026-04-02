/**
 * 운항편 상세 API
 *
 * 운항편 + 항로 + 영향 NOTAM 조회.
 *
 * @requirements FR-004, FR-013
 */

import { NextResponse } from 'next/server';
import * as flightRepo from '@/lib/db/flight.repository';
import * as impactRepo from '@/lib/db/impact.repository';
import * as notamRepo from '@/lib/db/notam.repository';
import * as routeRepo from '@/lib/db/route.repository';

/**
 * 운항편 상세 정보를 반환한다 (항로 + 영향 NOTAM 포함).
 *
 * @param _request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns 확장된 운항편 데이터
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flight = flightRepo.findById(id);

  if (!flight) {
    return NextResponse.json({ error: 'Not Found', message: `Flight ${id} not found`, statusCode: 404 }, { status: 404 });
  }

  const route = routeRepo.findById(flight.routeId);
  const flightImpacts = impactRepo.findFlightImpactsByFlight(id);

  // 영향 NOTAM 상세 조회
  const notamIds = [...new Set(flightImpacts.map((fi) => fi.notamId))];
  const affectedNotams = notamIds
    .map((nid) => notamRepo.findById(nid))
    .filter((n) => n !== undefined);

  return NextResponse.json({ ...flight, route, affectedNotams });
}
