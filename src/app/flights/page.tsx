/**
 * 운항편 목록 페이지
 *
 * 필터와 정렬을 포함한 운항편 목록.
 *
 * @route /flights
 * @requirements FR-004, FR-013
 */

'use client';

import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import FlightTable from '@/components/flights/FlightTable';
import { useFlights } from '@/hooks/useFlights';

/**
 * 운항편 목록 페이지 컴포넌트
 *
 * @returns 운항편 목록 레이아웃
 */
export default function FlightListPage() {
  const { data, error, isLoading } = useFlights();

  if (isLoading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <FlightTable
      flights={data?.items ?? []}
      totalCount={data?.total ?? 0}
      isLoading={isLoading}
    />
  );
}
