/**
 * 브리핑 생성 API
 *
 * AI를 활용한 운항 브리핑 문서 생성.
 *
 * @requirements FR-007
 */

import { NextResponse } from 'next/server';
import * as auditLogRepo from '@/lib/db/auditLog.repository';
import * as briefingRepo from '@/lib/db/briefing.repository';
import * as flightRepo from '@/lib/db/flight.repository';
import * as impactRepo from '@/lib/db/impact.repository';
import * as notamRepo from '@/lib/db/notam.repository';
import * as bedrockService from '@/lib/services/bedrock.service';
import { generateBriefingSchema } from '@/lib/validation/briefing.validation';
import type { Notam } from '@/types/notam';
import type { NextRequest } from 'next/server';

/**
 * AI로 브리핑 문서를 생성한다.
 *
 * @param request - HTTP 요청
 * @returns 생성된 브리핑
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = generateBriefingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation Error', message: parsed.error.message, statusCode: 400 }, { status: 400 });
  }

  const flight = flightRepo.findById(parsed.data.flightId);
  if (!flight) {
    return NextResponse.json({ error: 'Not Found', message: 'Flight not found', statusCode: 404 }, { status: 404 });
  }

  // 관련 NOTAM 조회
  const flightImpacts = impactRepo.findFlightImpactsByFlight(flight.id);
  const notamIds = [...new Set(flightImpacts.map((fi) => fi.notamId))];
  const notams = notamIds
    .map((nid) => notamRepo.findById(nid))
    .filter((n): n is Notam => n !== undefined);

  try {
    const content = await bedrockService.generateBriefingContent(flight, notams, parsed.data.type);

    const briefing = briefingRepo.create({
      type: parsed.data.type,
      flightId: flight.id,
      generatedAt: new Date().toISOString(),
      content,
      notamIds: notams.map((n) => n.id),
      status: 'draft',
      approvedBy: null,
      approvedAt: null,
    });

    auditLogRepo.create({
      userId: 'dispatcher-001',
      action: 'generate-briefing',
      targetType: 'briefing',
      targetId: briefing.id,
      details: `${flight.flightNumber} 브리핑 생성 (${parsed.data.type})`,
    });

    return NextResponse.json(briefing, { status: 201 });
  } catch (err) {
    console.error('Briefing generation failed:', err);
    return NextResponse.json({ error: 'AI Error', message: 'Failed to generate briefing', statusCode: 500 }, { status: 500 });
  }
}
