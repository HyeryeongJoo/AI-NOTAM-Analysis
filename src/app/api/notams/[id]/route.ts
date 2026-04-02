/**
 * NOTAM 상세 API
 *
 * @requirements FR-002, FR-012
 */

import { NextResponse } from 'next/server';
import * as notamRepo from '@/lib/db/notam.repository';

/**
 * 단일 NOTAM을 조회한다.
 *
 * @param _request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns NOTAM 상세 또는 404
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notam = notamRepo.findById(id);

  if (!notam) {
    return NextResponse.json({ error: 'Not Found', message: `NOTAM ${id} not found`, statusCode: 404 }, { status: 404 });
  }

  return NextResponse.json(notam);
}
