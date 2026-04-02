/**
 * REF BOOK 상세/수정/삭제 API
 *
 * @requirements FR-011
 */

import { NextResponse } from 'next/server';
import * as refBookRepo from '@/lib/db/refBook.repository';
import { updateRefBookEntrySchema } from '@/lib/validation/refBook.validation';

/**
 * REF BOOK 항목을 수정한다.
 *
 * @param request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns 수정된 항목
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateRefBookEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation Error', message: parsed.error.message, statusCode: 400 }, { status: 400 });
  }

  const updated = refBookRepo.update(id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: 'Not Found', message: 'REF BOOK entry not found', statusCode: 404 }, { status: 404 });
  }

  return NextResponse.json(updated);
}

/**
 * REF BOOK 항목을 삭제한다.
 *
 * @param _request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns 삭제 결과
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = refBookRepo.remove(id);

  if (!removed) {
    return NextResponse.json({ error: 'Not Found', message: 'REF BOOK entry not found', statusCode: 404 }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
