/**
 * 단일 운항편 조회 훅
 *
 * 운항편 상세 정보와 연관 항로, 영향 NOTAM을 조회한다.
 *
 * @requirements FR-004, FR-013
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { Flight } from '@/types/flight';
import type { Notam } from '@/types/notam';
import type { Route } from '@/types/route';

interface FlightDetail extends Flight {
  route: Route;
  affectedNotams: Notam[];
}

/**
 * 단일 운항편을 조회한다
 *
 * @param id - 운항편 ID
 * @returns 운항편 상세 데이터, 로딩 상태, 에러
 */
export function useFlight(id: string) {
  const { data, error, isLoading } = useSWR<FlightDetail>(`/api/flights/${id}`, fetcher, {
    revalidateOnFocus: false,
  });

  return { data, error, isLoading };
}
