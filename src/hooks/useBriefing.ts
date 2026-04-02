/**
 * 단일 브리핑 조회 훅
 *
 * 브리핑 문서 상세 정보를 조회한다.
 *
 * @requirements FR-007, FR-008
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { Briefing } from '@/types/briefing';

/**
 * 단일 브리핑을 조회한다
 *
 * @param id - 브리핑 ID
 * @returns 브리핑 데이터, 로딩 상태, 에러
 */
export function useBriefing(id: string) {
  const { data, error, isLoading } = useSWR<Briefing>(`/api/briefings/${id}`, fetcher, {
    revalidateOnFocus: false,
  });

  return { data, error, isLoading };
}
