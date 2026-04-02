/**
 * 승무원 브리핑 패키지 조회 API
 *
 * crew-briefing 타입 브리핑의 분리된 문서 세트 제공.
 *
 * @requirements FR-008
 */

import { NextResponse } from 'next/server';
import * as briefingRepo from '@/lib/db/briefing.repository';

/**
 * 승무원 브리핑 패키지를 반환한다.
 *
 * @param _request - HTTP 요청
 * @param context - 라우트 파라미터
 * @param context.params - URL 파라미터
 * @returns DISP Comment, Company NOTAM, Crew Briefing
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const briefing = briefingRepo.findById(id);

  if (!briefing) {
    return NextResponse.json({ error: 'Not Found', message: 'Briefing not found', statusCode: 404 }, { status: 404 });
  }

  try {
    const parsed = JSON.parse(briefing.content);
    return NextResponse.json({
      dispComment: parsed.dispComment ?? '',
      companyNotam: parsed.companyNotam ?? '',
      crewBriefing: parsed.crewBriefing ?? '',
    });
  } catch {
    return NextResponse.json({
      dispComment: briefing.content,
      companyNotam: '',
      crewBriefing: '',
    });
  }
}
