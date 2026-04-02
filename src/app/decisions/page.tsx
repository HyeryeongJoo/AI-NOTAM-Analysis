/**
 * 의사결정 기록 목록 페이지
 *
 * TIFRS 의사결정 테이블 + SplitPanel 상세 보기 레이아웃.
 *
 * @route /decisions
 * @requirements FR-020
 */

'use client';

import { useState } from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import DecisionSplitPanelDetail from '@/components/decisions/DecisionSplitPanelDetail';
import DecisionTable from '@/components/decisions/DecisionTable';
import { useDecisions } from '@/hooks/useDecisions';
import type { DecisionRecord } from '@/types/decision';

/**
 * 의사결정 기록 목록 페이지 컴포넌트
 *
 * @returns 의사결정 목록 + SplitPanel 레이아웃
 */
export default function DecisionsPage() {
  const { data, error, isLoading } = useDecisions();
  const [selectedItems, setSelectedItems] = useState<DecisionRecord[]>([]);

  if (isLoading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  const selectedDecision = selectedItems.length > 0 ? selectedItems[0] : null;

  return (
    <ContentLayout>
      <DecisionTable
        decisions={data?.items ?? []}
        totalCount={data?.total ?? 0}
        isLoading={isLoading}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
      />
      <DecisionSplitPanelDetail decision={selectedDecision} />
    </ContentLayout>
  );
}
