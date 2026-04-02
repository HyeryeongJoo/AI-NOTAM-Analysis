/**
 * 단일 NOTAM 조회 훅
 *
 * ID 기반으로 NOTAM 상세 정보를 조회한다.
 *
 * @requirements FR-002, FR-012
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { Notam } from '@/types/notam';

/**
 * 단일 NOTAM을 조회한다
 *
 * @param id - NOTAM ID (null이면 요청하지 않음)
 * @returns NOTAM 데이터, 로딩 상태, 에러
 */
export function useNotam(id: string | null) {
  const { data, error, isLoading } = useSWR<Notam>(id ? `/api/notams/${id}` : null, fetcher, {
    revalidateOnFocus: false,
  });

  return { data, error, isLoading };
}
