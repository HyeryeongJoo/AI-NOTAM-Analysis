/**
 * 대시보드 데이터 조회 훅
 *
 * 항로 영향 요약, 지도 데이터, 긴급 NOTAM을 30초 주기로 자동 갱신한다.
 * 서버에서 전달받은 초기 데이터가 있으면 로딩 없이 즉시 표시한다.
 *
 * @requirements FR-006, FR-005, FR-016
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { DashboardData } from '@/lib/dashboard.service';

/**
 * 대시보드 데이터를 조회한다
 *
 * @param routeId - 선택적 항로 필터
 * @param fallbackData - 서버에서 미리 조회한 초기 데이터
 * @returns 대시보드 데이터, 로딩 상태, 에러
 */
export function useDashboard(routeId?: string, fallbackData?: DashboardData) {
  const url = routeId ? `/api/dashboard/route-impact?routeId=${routeId}` : '/api/dashboard/route-impact';

  const { data, error, isLoading, mutate } = useSWR<DashboardData>(url, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 30000,
    fallbackData,
  });

  return { data, error, isLoading, mutate };
}
