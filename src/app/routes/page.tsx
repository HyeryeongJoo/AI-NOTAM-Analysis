/**
 * 항로 목록 페이지
 *
 * 필터와 정렬을 포함한 항로 목록.
 *
 * @route /routes
 * @requirements FR-010, FR-006
 */

'use client';

import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import RouteTable from '@/components/routes/RouteTable';
import { useRoutes } from '@/hooks/useRoutes';

/**
 * 항로 목록 페이지 컴포넌트
 *
 * @returns 항로 목록 레이아웃
 */
export default function RouteListPage() {
  const { data, error, isLoading } = useRoutes();

  if (isLoading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <RouteTable
      routes={data?.items ?? []}
      totalCount={data?.total ?? 0}
      isLoading={isLoading}
    />
  );
}
