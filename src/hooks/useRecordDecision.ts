/**
 * 의사결정 기록 mutation 훅
 *
 * POST /api/notams/[id]/decision 호출 후 SWR 캐시를 갱신한다.
 * useApiMutation 기반으로 에러 처리와 로딩 상태를 관리.
 *
 * @requirements FR-020
 */

'use client';

import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { useApiMutation } from '@/hooks/useApiMutation';
import type { CreateDecisionRecordRequest, DecisionRecord } from '@/types/decision';

/**
 * NOTAM에 대한 TIFRS 의사결정을 기록한다
 *
 * @param notamId - 대상 NOTAM ID
 * @returns mutation 상태와 실행 함수
 */
export function useRecordDecision(notamId: string) {
  const { mutate: globalMutate } = useSWRConfig();
  const mutation = useApiMutation<CreateDecisionRecordRequest, DecisionRecord>(
    `/api/notams/${notamId}/decision`,
    'POST',
  );

  const execute = useCallback(
    async (body: CreateDecisionRecordRequest) => {
      const result = await mutation.execute(body);
      // SWR 캐시 갱신: 해당 NOTAM의 의사결정 + 의사결정 목록
      await globalMutate(`/api/notams/${notamId}/decision`);
      await globalMutate(
        (key: string) => typeof key === 'string' && key.startsWith('/api/decisions'),
        undefined,
        { revalidate: true },
      );
      return result;
    },
    [mutation, globalMutate, notamId],
  );

  return { ...mutation, execute };
}
