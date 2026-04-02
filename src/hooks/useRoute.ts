/**
 * 단일 항로 조회 훅
 *
 * 항로 상세 정보와 NOTAM 영향 데이터를 조회한다.
 *
 * @requirements FR-009, FR-010
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { NotamRouteImpact } from '@/types/impact';
import type { Notam } from '@/types/notam';
import type { Route } from '@/types/route';

interface RouteDetail extends Route {
  impacts: NotamRouteImpact[];
  activeNotams: Notam[];
}

/**
 * 단일 항로를 조회한다
 *
 * @param id - 항로 ID
 * @returns 항로 상세 데이터, 로딩 상태, 에러
 */
export function useRoute(id: string) {
  const { data, error, isLoading } = useSWR<RouteDetail>(`/api/routes/${id}`, fetcher, {
    revalidateOnFocus: false,
  });

  return { data, error, isLoading };
}
