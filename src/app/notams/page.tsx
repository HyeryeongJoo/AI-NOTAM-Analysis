/**
 * NOTAM 목록 페이지
 *
 * PropertyFilter와 SplitPanel을 포함한 NOTAM 목록.
 *
 * @route /notams
 * @requirements FR-001, FR-002, FR-005, FR-019
 */

'use client';

import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import NotamTable from '@/components/notams/NotamTable';
import { useNotams } from '@/hooks/useNotams';

/**
 * NOTAM 목록 페이지 컴포넌트
 *
 * @returns NOTAM 목록 레이아웃
 */
export default function NotamListPage() {
  const { data, error, isLoading, mutate } = useNotams();

  if (isLoading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={() => mutate()} />;

  return (
    <NotamTable
      notams={data?.items ?? []}
      totalCount={data?.total ?? 0}
      stats={data?.stats}
      isLoading={isLoading}
    />
  );
}
