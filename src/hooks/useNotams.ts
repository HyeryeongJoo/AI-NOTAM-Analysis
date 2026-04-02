/**
 * NOTAM 목록 조회 훅
 *
 * SWR 기반으로 NOTAM 목록, 통계, 페이지네이션을 관리한다.
 *
 * @requirements FR-001, FR-005, FR-019
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { ImportanceLevel, Notam, NotamStats, NotamStatus } from '@/types/notam';

interface UseNotamsParams {
  importance?: ImportanceLevel;
  status?: NotamStatus;
  airport?: string;
  qCode?: string;
  expiryStatus?: 'expiring-soon' | 'expired' | 'active';
  sortBy?: 'importanceScore' | 'effectiveFrom' | 'effectiveTo' | 'locationIndicator' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface NotamsResponse {
  items: Notam[];
  total: number;
  stats: NotamStats;
}

/**
 * NOTAM 목록을 조회한다
 *
 * @param params - 필터링, 정렬, 페이지네이션 파라미터
 * @returns NOTAM 목록 데이터, 로딩 상태, 에러, mutate 함수
 */
export function useNotams(params: UseNotamsParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  const url = `/api/notams${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<NotamsResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return { data, error, isLoading, mutate };
}
