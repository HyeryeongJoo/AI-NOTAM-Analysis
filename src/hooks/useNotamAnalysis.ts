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

/** 파이프라인 처리 결과 */
interface PipelineResult {
  notamId: string;
  extraction: { success: boolean; updatedFields?: string[] };
  analysis: {
    success: boolean;
    importanceScore?: number;
    importanceLevel?: ImportanceLevel;
  };
  matching: {
    success: boolean;
    routeImpacts?: number;
    flightImpacts?: number;
  };
  errors: string[];
}

/**
 * POST 요청을 보내는 fetcher — 파이프라인 API 호출
 *
 * @param _url - API URL (사용하지 않음, notamId로 동적 URL 구성)
 * @param options - SWR mutation 옵션
 * @param options.arg - 인자 객체
 * @param options.arg.notamId - 처리할 NOTAM ID
 * @returns 파이프라인 처리 결과
 */
async function postFetcher(
  _url: string,
  { arg }: { arg: { notamId: string } },
): Promise<PipelineResult> {
  const res = await fetch(`/api/notams/${arg.notamId}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`처리 요청 실패: ${res.status}`);
  return res.json() as Promise<PipelineResult>;
}

/**
 * NOTAM 자동 처리 파이프라인을 트리거한다 (추출 → 분석 → 매칭)
 *
 * @returns trigger 함수와 mutating 상태
 */
export function useNotamAnalysis() {
  const { trigger, isMutating } = useSWRMutation('/api/notams/process', postFetcher);

  return { trigger, isMutating };
}
