/**
 * 브리핑 생성 훅
 *
 * Amazon Bedrock를 통한 브리핑 문서 생성을 요청한다.
 *
 * @requirements FR-007
 */

'use client';

import useSWRMutation from 'swr/mutation';
import type { Briefing, BriefingType } from '@/types/briefing';

interface GenerateBriefingArg {
  flightId: string;
  type: BriefingType;
}

/**
 * POST 요청을 보내는 fetcher
 *
 * @param url - API URL
 * @param options - SWR mutation 옵션
 * @param options.arg
 * @returns 생성된 브리핑
 */
async function postFetcher(url: string, { arg }: { arg: GenerateBriefingArg }): Promise<Briefing> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error(`브리핑 생성 실패: ${res.status}`);
  return res.json() as Promise<Briefing>;
}

/**
 * 브리핑 생성을 트리거한다
 *
 * @returns trigger 함수와 mutating 상태
 */
export function useGenerateBriefing() {
  const { trigger, isMutating } = useSWRMutation('/api/briefings/generate', postFetcher);

  return { trigger, isMutating };
}
