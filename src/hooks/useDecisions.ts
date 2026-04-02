/**
 * 의사결정 목록 조회 훅
 *
 * SWR 기반으로 TIFRS 의사결정 기록 목록을 조회한다.
 *
 * @requirements FR-020
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { DecisionRecord } from '@/types/decision';

interface UseDecisionsParams {
  decisionType?: string;
  decidedBy?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface DecisionsResponse {
  items: DecisionRecord[];
  total: number;
}

/**
 * 의사결정 기록 목록을 조회한다
 *
 * @param params - 필터링, 정렬, 페이지네이션 파라미터
 * @returns 의사결정 목록 데이터, 로딩 상태, 에러, mutate 함수
 */
export function useDecisions(params: UseDecisionsParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  const url = `/api/decisions${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<DecisionsResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return { data, error, isLoading, mutate };
}
