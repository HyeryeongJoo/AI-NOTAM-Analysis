/**
 * NOTAM별 의사결정 조회 훅
 *
 * SWR 기반으로 특정 NOTAM에 대한 TIFRS 의사결정 기록을 조회한다.
 * 404 응답 시 데이터가 없는 것으로 처리(에러 아님).
 *
 * @requirements FR-020
 */

'use client';

import useSWR from 'swr';
import type { DecisionRecord } from '@/types/decision';

/**
 * 404를 null로 처리하는 fetcher
 *
 * @param url - API 엔드포인트 URL
 * @returns 의사결정 기록 또는 null
 */
async function decisionFetcher(url: string): Promise<DecisionRecord | null> {
  const response = await fetch(url);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<DecisionRecord>;
}

/**
 * 특정 NOTAM의 의사결정 기록을 조회한다
 *
 * @param notamId - 대상 NOTAM ID (null이면 요청 보류)
 * @returns 의사결정 데이터, 로딩 상태, 에러, mutate 함수
 */
export function useNotamDecision(notamId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<DecisionRecord | null>(
    notamId ? `/api/notams/${notamId}/decision` : null,
    decisionFetcher,
    { revalidateOnFocus: false },
  );

  return { decision: data ?? null, error, isLoading, mutate };
}
