/**
 * NOTAM 목록 페이지
 *
 * PropertyFilter와 SplitPanel을 포함한 NOTAM 목록.
 *
 * @route /notams
 * @requirements FR-001, FR-002, FR-005, FR-019
 */

'use client';

import { useState } from 'react';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import NotamSplitPanelDetail from '@/components/notams/NotamSplitPanelDetail';
import NotamTable from '@/components/notams/NotamTable';
import { useNotams } from '@/hooks/useNotams';
import type { Notam } from '@/types/notam';

/**
 * NOTAM 목록 페이지 컴포넌트
 *
 * @returns NOTAM 목록 레이아웃
 */
export default function NotamListPage() {
  const { data, error, isLoading, mutate } = useNotams();
  const [selectedNotam, setSelectedNotam] = useState<Notam | null>(null);

  if (isLoading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={() => mutate()} />;

  return (
    <>
      <NotamTable
        notams={data?.items ?? []}
        totalCount={data?.total ?? 0}
        stats={data?.stats}
        isLoading={isLoading}
        onSelectionChange={setSelectedNotam}
      />
      <NotamSplitPanelDetail notam={selectedNotam} />
    </>
  );
}
