/**
 * 대체 항로 분석 훅
 *
 * AI 기반 대체 항로 제안을 요청한다.
 *
 * @requirements FR-009
 */

'use client';

import useSWRMutation from 'swr/mutation';
import type { RouteAlternative } from '@/types/route';

interface AlternativesResult {
  alternatives: RouteAlternative[];
  reasoning: string;
}

/**
 * POST 요청을 보내는 fetcher
 *
 * @param url - API URL
 * @param options - SWR mutation 옵션
 * @param options.arg
 * @returns 대체 항로 분석 결과
 */
async function postFetcher(
  url: string,
  { arg }: { arg: string },
): Promise<AlternativesResult> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notamId: arg }),
  });
  if (!res.ok) throw new Error(`대체 항로 분석 실패: ${res.status}`);
  return res.json() as Promise<AlternativesResult>;
}

/**
 * 대체 항로 분석을 트리거한다
 *
 * @param routeId - 분석 대상 항로 ID
 * @returns trigger 함수와 mutating 상태
 */
export function useRouteAlternatives(routeId: string) {
  const { trigger, isMutating } = useSWRMutation(
    `/api/routes/${routeId}/alternatives`,
    postFetcher,
  );

  return { trigger, isMutating };
}
