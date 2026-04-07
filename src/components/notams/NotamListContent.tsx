/**
 * NOTAM 목록 클라이언트 컴포넌트
 *
 * 서버에서 받은 초기 데이터로 즉시 렌더링하고, SWR로 갱신한다.
 *
 * @requirements FR-001, FR-002, FR-005, FR-019
 */

'use client';

import useSWR from 'swr';
import ErrorState from '@/components/common/ErrorState';
import NotamTable from '@/components/notams/NotamTable';
import { fetcher } from '@/lib/fetcher';
import type { Notam, NotamStats } from '@/types/notam';

interface NotamsResponse {
  items: Notam[];
  total: number;
  stats: NotamStats;
}

interface NotamListContentProps {
  initialData: NotamsResponse;
}

/**
 * NOTAM 목록 콘텐츠를 렌더링한다
 *
 * @param props - 서버에서 조회한 초기 데이터
 * @param props.initialData - NOTAM 목록 초기 데이터
 * @returns NOTAM 테이블
 */
export default function NotamListContent({ initialData }: NotamListContentProps) {
  const { data, error, isLoading, mutate } = useSWR<NotamsResponse>('/api/notams', fetcher, {
    revalidateOnFocus: false,
    fallbackData: initialData,
  });

  const displayData = data ?? initialData;

  if (error) return <ErrorState error={error} onRetry={() => mutate()} />;

  return (
    <NotamTable
      notams={displayData.items}
      totalCount={displayData.total}
      stats={displayData.stats}
      isLoading={isLoading && !displayData}
    />
  );
}
