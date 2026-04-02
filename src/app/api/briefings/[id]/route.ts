/**
 * 브리핑 상세/수정 API
 *
 * @requirements FR-007, FR-008
 */

import { NextResponse } from 'next/server';
import * as briefingRepo from '@/lib/db/briefing.repository';
import { updateBriefingSchema } from '@/lib/validation/briefing.validation';

/**
 * 브리핑 상세를 조회한다.
 *
 * @param _request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns 브리핑 데이터
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const briefing = briefingRepo.findById(id);

  if (!briefing) {
    return NextResponse.json({ error: 'Not Found', message: 'Briefing not found', statusCode: 404 }, { status: 404 });
  }

  return NextResponse.json(briefing);
}

/**
 * 브리핑을 수정한다.
 *
 * @param request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns 수정된 브리핑
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateBriefingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation Error', message: parsed.error.message, statusCode: 400 }, { status: 400 });
  }

  const updated = briefingRepo.update(id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: 'Not Found', message: 'Briefing not found', statusCode: 404 }, { status: 404 });
  }

  return NextResponse.json(updated);
}
