/**
 * 운항편 목록 조회 훅
 *
 * SWR 기반으로 운항편 목록을 조회한다.
 *
 * @requirements FR-004, FR-013
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { Flight } from '@/types/flight';

interface UseFlightsParams {
  airport?: string;
  route?: string;
  date?: string;
  impactStatus?: 'affected' | 'clear' | 'all';
  sortBy?: 'flightNumber' | 'scheduledDeparture' | 'departureAirport' | 'notamImpactCount';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface FlightsResponse {
  items: Flight[];
  total: number;
}

/**
 * 운항편 목록을 조회한다
 *
 * @param params - 필터링, 정렬, 페이지네이션 파라미터
 * @returns 운항편 목록 데이터, 로딩 상태, 에러
 */
export function useFlights(params: UseFlightsParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  const url = `/api/flights${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading } = useSWR<FlightsResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return { data, error, isLoading };
}
