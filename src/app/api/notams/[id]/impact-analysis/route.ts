/**
 * NOTAM 영향 분석 API
 *
 * NOTAM의 항로/운항편 영향 + AI 맥락적 분석.
 *
 * @requirements FR-003
 */

import { NextResponse } from 'next/server';
import * as airportRepo from '@/lib/db/airport.repository';
import * as flightRepo from '@/lib/db/flight.repository';
import * as impactRepo from '@/lib/db/impact.repository';
import * as notamRepo from '@/lib/db/notam.repository';
import * as bedrockService from '@/lib/services/bedrock.service';
import * as matchingService from '@/lib/services/matching.service';

/**
 * NOTAM 영향을 종합 분석한다.
 *
 * @param _request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns 항로/운항편 영향 + AI 분석
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notam = notamRepo.findById(id);

  if (!notam) {
    return NextResponse.json({ error: 'Not Found', message: 'NOTAM not found', statusCode: 404 }, { status: 404 });
  }

  // 기존 영향 데이터 조회
  let affectedRoutes = impactRepo.findRouteImpactsByNotam(id);
  let affectedFlights = impactRepo.findFlightImpactsByNotam(id);

  // 없으면 실시간 계산
  if (affectedRoutes.length === 0 && affectedFlights.length === 0) {
    const calculated = matchingService.calculateAllImpacts(id);
    affectedRoutes = calculated.routeImpacts;
    affectedFlights = calculated.flightImpacts;
  }

  const airport = airportRepo.findByIcao(notam.locationIndicator);

  /* 영향받는 운항편의 실제 Flight 객체 조회 (편명, 스케줄, 기종 등 상세 정보) */
  const affectedFlightIds = [...new Set(affectedFlights.map((fi) => fi.flightId))];
  const flights = affectedFlightIds
    .map((fid) => flightRepo.findById(fid))
    .filter((f) => f !== undefined);

  try {
    const contextualSeverity = await bedrockService.generateImpactAnalysis(
      notam,
      affectedRoutes,
      affectedFlights,
      airport,
      flights,
    );

    return NextResponse.json({ affectedRoutes, affectedFlights, contextualSeverity });
  } catch (err) {
    console.error('Impact analysis generation failed:', err);
    return NextResponse.json({
      affectedRoutes,
      affectedFlights,
      contextualSeverity: `영향 항로 ${affectedRoutes.length}개, 운항편 ${affectedFlights.length}개. AI 분석 불가.`,
    });
  }
}
