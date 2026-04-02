/**
 * 교대 인수인계 보고서 상세 API
 *
 * @requirements FR-014
 */

import { NextResponse } from 'next/server';
import * as briefingRepo from '@/lib/db/briefing.repository';

/**
 * 교대 인수인계 보고서를 조회한다.
 *
 * @param _request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns 보고서 브리핑
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const briefing = briefingRepo.findById(id);

  if (!briefing) {
    return NextResponse.json({ error: 'Not Found', message: 'Report not found', statusCode: 404 }, { status: 404 });
  }

  return NextResponse.json(briefing);
}
