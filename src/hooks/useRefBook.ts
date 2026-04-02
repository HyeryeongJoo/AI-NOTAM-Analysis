/**
 * REF BOOK 목록 조회 훅
 *
 * SWR 기반으로 REF BOOK 항목을 조회한다.
 *
 * @requirements FR-011
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { RefBookEntry } from '@/types/refBook';

interface RefBookResponse {
  items: RefBookEntry[];
  total: number;
}

/**
 * REF BOOK 목록을 조회한다
 *
 * @returns REF BOOK 목록 데이터, 로딩 상태, 에러, mutate 함수
 */
export function useRefBook() {
  const { data, error, isLoading, mutate } = useSWR<RefBookResponse>('/api/ref-book', fetcher, {
    revalidateOnFocus: false,
  });

  return { data, error, isLoading, mutate };
}
