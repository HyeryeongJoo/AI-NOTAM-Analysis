/**
 * NOTAM AI 분석 트리거 훅
 *
 * Amazon Bedrock를 통한 NOTAM 분석을 요청한다.
 *
 * @requirements FR-001, FR-003
 */

'use client';

import useSWRMutation from 'swr/mutation';
import type { ImportanceLevel } from '@/types/notam';

interface AnalysisResult {
  importanceScore: number;
  importanceLevel: ImportanceLevel;
  aiSummary: string;
  aiAnalysis: string;
}

/**
 * POST 요청을 보내는 fetcher
 *
 * @param url - API URL
 * @param options - SWR mutation 옵션
 * @param options.arg
 * @param options.arg.notamId
 * @returns 분석 결과
 */
async function postFetcher(url: string, { arg }: { arg: { notamId: string } }): Promise<AnalysisResult> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error(`분석 요청 실패: ${res.status}`);
  return res.json() as Promise<AnalysisResult>;
}

/**
 * NOTAM AI 분석을 트리거한다
 *
 * @returns trigger 함수와 mutating 상태
 */
export function useNotamAnalysis() {
  const { trigger, isMutating } = useSWRMutation('/api/notams/analyze', postFetcher);

  return { trigger, isMutating };
}
