/**
 * NOTAM 변경 비교 API
 *
 * NOTAMR의 원본/대체 간 필드별 차이 제공.
 *
 * @requirements FR-018
 */

import { NextResponse } from 'next/server';
import * as notamRepo from '@/lib/db/notam.repository';
import * as notamDiffService from '@/lib/services/notamDiff.service';

/**
 * NOTAM diff를 반환한다.
 *
 * @param _request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns 원본, 대체 NOTAM, 변경 사항
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notam = notamRepo.findById(id);

  if (!notam) {
    return NextResponse.json({ error: 'Not Found', message: 'NOTAM not found', statusCode: 404 }, { status: 404 });
  }

  // 이 NOTAM이 대체 NOTAM인 경우 (replacesNotamId가 있음)
  if (notam.replacesNotamId) {
    const original = notamRepo.findById(notam.replacesNotamId);
    if (!original) {
      return NextResponse.json({ error: 'Not Found', message: 'Original NOTAM not found', statusCode: 404 }, { status: 404 });
    }
    const changes = notamDiffService.calculateDiff(original, notam);
    return NextResponse.json({ original, replacement: notam, changes });
  }

  // 이 NOTAM이 원본인 경우 (다른 NOTAM이 이것을 대체)
  const replacement = notamRepo.findByReplacesId(id);
  if (replacement) {
    const changes = notamDiffService.calculateDiff(notam, replacement);
    return NextResponse.json({ original: notam, replacement, changes });
  }

  return NextResponse.json(
    { error: 'No Diff', message: 'No replacement relationship found for this NOTAM', statusCode: 404 },
    { status: 404 },
  );
}
