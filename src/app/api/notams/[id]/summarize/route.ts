/**
 * NOTAM 한국어 요약 API
 *
 * @requirements FR-015
 */

import { NextResponse } from 'next/server';
import * as notamRepo from '@/lib/db/notam.repository';
import * as bedrockService from '@/lib/services/bedrock.service';

/**
 * NOTAM을 한국어로 요약한다.
 *
 * @param _request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns 한국어 요약
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notam = notamRepo.findById(id);

  if (!notam) {
    return NextResponse.json({ error: 'Not Found', message: 'NOTAM not found', statusCode: 404 }, { status: 404 });
  }

  try {
    const summary = await bedrockService.generateKoreanSummary(notam);
    notamRepo.update(id, { aiSummary: summary });
    return NextResponse.json({ summary });
  } catch (err) {
    console.error('Korean summary generation failed:', err);
    return NextResponse.json({ error: 'AI Error', message: 'Failed to generate summary', statusCode: 500 }, { status: 500 });
  }
}
