/**
 * 승무원 브리핑 패키지 생성 API
 *
 * @requirements FR-008
 */

import { NextResponse } from 'next/server';
import * as briefingRepo from '@/lib/db/briefing.repository';
import * as flightRepo from '@/lib/db/flight.repository';
import * as impactRepo from '@/lib/db/impact.repository';
import * as notamRepo from '@/lib/db/notam.repository';
import * as bedrockService from '@/lib/services/bedrock.service';
import { generateCrewBriefingSchema } from '@/lib/validation/briefing.validation';
import type { Notam } from '@/types/notam';
import type { NextRequest } from 'next/server';

/**
 * 승무원 브리핑 패키지를 AI로 생성한다.
 *
 * @param request - HTTP 요청
 * @returns 생성된 crew-briefing 타입 브리핑
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = generateCrewBriefingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation Error', message: parsed.error.message, statusCode: 400 }, { status: 400 });
  }

  const flight = flightRepo.findById(parsed.data.flightId);
  if (!flight) {
    return NextResponse.json({ error: 'Not Found', message: 'Flight not found', statusCode: 404 }, { status: 404 });
  }

  const flightImpacts = impactRepo.findFlightImpactsByFlight(flight.id);
  const notamIds = [...new Set(flightImpacts.map((fi) => fi.notamId))];
  const notams = notamIds
    .map((nid) => notamRepo.findById(nid))
    .filter((n): n is Notam => n !== undefined);

  try {
    const crewPackage = await bedrockService.generateCrewPackage(flight, notams);

    const briefing = briefingRepo.create({
      type: 'crew-briefing',
      flightId: flight.id,
      generatedAt: new Date().toISOString(),
      content: JSON.stringify(crewPackage),
      notamIds: notams.map((n) => n.id),
      status: 'draft',
      approvedBy: null,
      approvedAt: null,
    });

    return NextResponse.json(briefing, { status: 201 });
  } catch (err) {
    console.error('Crew briefing generation failed:', err);
    return NextResponse.json({ error: 'AI Error', message: 'Failed to generate crew briefing', statusCode: 500 }, { status: 500 });
  }
}
