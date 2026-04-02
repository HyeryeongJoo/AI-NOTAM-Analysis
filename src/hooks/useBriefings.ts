/**
 * 브리핑 목록 조회 훅
 *
 * SWR 기반으로 브리핑 문서 목록을 조회한다.
 *
 * @requirements FR-007, FR-008, FR-014
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { Briefing } from '@/types/briefing';

interface UseBriefingsParams {
  flightId?: string;
  type?: string;
  status?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface BriefingsResponse {
  items: Briefing[];
  total: number;
}

/**
 * 브리핑 목록을 조회한다
 *
 * @param params - 필터링, 정렬, 페이지네이션 파라미터
 * @returns 브리핑 목록 데이터, 로딩 상태, 에러, mutate 함수
 */
export function useBriefings(params: UseBriefingsParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  const url = `/api/briefings${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<BriefingsResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return { data, error, isLoading, mutate };
}
