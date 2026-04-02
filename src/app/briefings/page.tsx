/**
 * 브리핑 목록 페이지
 *
 * 브리핑 문서 목록을 표시한다.
 *
 * @route /briefings
 * @requirements FR-007, FR-008, FR-014
 */

'use client';

import BriefingTable from '@/components/briefings/BriefingTable';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import { useBriefings } from '@/hooks/useBriefings';

/**
 * 브리핑 목록 페이지 컴포넌트
 *
 * @returns 브리핑 목록 레이아웃
 */
export default function BriefingListPage() {
  const { data, error, isLoading, mutate } = useBriefings();

  if (isLoading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={() => mutate()} />;

  return (
    <BriefingTable
      briefings={data?.items ?? []}
      totalCount={data?.total ?? 0}
      isLoading={isLoading}
    />
  );
}
