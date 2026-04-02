/**
 * 항로 목록 조회 훅
 *
 * SWR 기반으로 항로 목록을 조회한다.
 *
 * @requirements FR-006, FR-010
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { Route } from '@/types/route';

interface UseRoutesParams {
  status?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface RoutesResponse {
  items: Route[];
  total: number;
}

/**
 * 항로 목록을 조회한다
 *
 * @param params - 필터링, 정렬, 페이지네이션 파라미터
 * @returns 항로 목록 데이터, 로딩 상태, 에러
 */
export function useRoutes(params: UseRoutesParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  const url = `/api/routes${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading } = useSWR<RoutesResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return { data, error, isLoading };
}
