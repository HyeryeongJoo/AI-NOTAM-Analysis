/**
 * 교대 인수인계 보고서 생성 API
 *
 * @requirements FR-014
 */

import { NextResponse } from 'next/server';
import * as briefingRepo from '@/lib/db/briefing.repository';
import * as notamRepo from '@/lib/db/notam.repository';
import * as bedrockService from '@/lib/services/bedrock.service';
import { shiftHandoverSchema } from '@/lib/validation/briefing.validation';
import type { NextRequest } from 'next/server';

/**
 * 교대 인수인계 보고서를 AI로 생성한다.
 *
 * @param request - HTTP 요청
 * @returns 생성된 보고서 브리핑
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = shiftHandoverSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation Error', message: parsed.error.message, statusCode: 400 }, { status: 400 });
  }

  // 교대 시간 내 활성 NOTAM 조회
  const allNotams = notamRepo.findAll({ page: 1, pageSize: 1000 });
  const shiftStart = new Date(parsed.data.shiftStartTime).getTime();
  const shiftEnd = new Date(parsed.data.shiftEndTime).getTime();

  const relevantNotams = allNotams.items.filter((n) => {
    const created = new Date(n.createdAt).getTime();
    // 교대 시간 내 생성되었거나, 현재 활성 상태인 critical/high NOTAM
    return (
      (created >= shiftStart && created <= shiftEnd) ||
      ((n.importanceLevel === 'critical' || n.importanceLevel === 'high') &&
        (n.status === 'new' || n.status === 'active' || n.status === 'analyzed'))
    );
  });

  try {
    const content = await bedrockService.generateShiftHandoverReport(
      relevantNotams,
      parsed.data.shiftStartTime,
      parsed.data.shiftEndTime,
    );

    const briefing = briefingRepo.create({
      type: 'dispatcher-summary',
      flightId: '',
      generatedAt: new Date().toISOString(),
      content,
      notamIds: relevantNotams.map((n) => n.id),
      status: 'draft',
      approvedBy: null,
      approvedAt: null,
    });

    return NextResponse.json(briefing, { status: 201 });
  } catch (err) {
    console.error('Shift handover report failed:', err);
    return NextResponse.json({ error: 'AI Error', message: 'Failed to generate report', statusCode: 500 }, { status: 500 });
  }
}
