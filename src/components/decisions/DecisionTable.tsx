/**
 * 의사결정 기록 테이블 컴포넌트
 *
 * useCollection 기반 TIFRS 의사결정 목록 테이블.
 * NOTAM ID 링크, 의사결정 유형 배지, TIFRS 요약을 표시한다.
 *
 * @requirements FR-020
 */

'use client';

import { useCollection } from '@cloudscape-design/collection-hooks';
import Box from '@cloudscape-design/components/box';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Pagination from '@cloudscape-design/components/pagination';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import DecisionTypeBadge from '@/components/common/DecisionTypeBadge';
import type { DecisionRecord } from '@/types/decision';

interface DecisionTableProps {
  decisions: DecisionRecord[];
  totalCount: number;
  isLoading: boolean;
  selectedItems: DecisionRecord[];
  onSelectionChange: (items: DecisionRecord[]) => void;
}

/**
 * 날짜를 한국 시간대로 포맷한다
 *
 * @param iso - ISO-8601 날짜 문자열
 * @returns 포맷된 날짜 문자열
 */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  } catch {
    return iso;
  }
}

/**
 * TIFRS 분석을 한 줄로 요약한다
 *
 * @param item - 의사결정 기록
 * @returns TIFRS 요약 문자열
 */
function summarizeTifrs(item: DecisionRecord): string {
  const parts = [
    item.tifrsTime ? `T:${item.tifrsTime.substring(0, 30)}` : null,
    item.tifrsImpact ? `I:${item.tifrsImpact.substring(0, 30)}` : null,
  ].filter(Boolean);
  return parts.join(' | ') || '-';
}

/**
 * 의사결정 기록 테이블을 렌더링한다
 *
 * @param props - 테이블 데이터와 선택 핸들러
 * @param props.decisions - DecisionRecord 배열
 * @param props.totalCount - 전체 기록 수
 * @param props.isLoading - 로딩 상태
 * @param props.selectedItems - 선택된 항목
 * @param props.onSelectionChange - 선택 변경 핸들러
 * @returns Table 컴포넌트
 */
export default function DecisionTable({
  decisions,
  totalCount,
  isLoading,
  selectedItems,
  onSelectionChange,
}: DecisionTableProps) {
  const { items, collectionProps, filterProps, paginationProps } = useCollection(decisions, {
    filtering: {
      empty: (
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>의사결정 기록이 없습니다</b>
        </Box>
      ),
      noMatch: (
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>일치하는 기록이 없습니다</b>
        </Box>
      ),
    },
    sorting: {
      defaultState: { sortingColumn: { sortingField: 'decidedAt' }, isDescending: true },
    },
    pagination: { pageSize: 20 },
    selection: {},
  });

  return (
    <Table
      {...collectionProps}
      items={items}
      loading={isLoading}
      loadingText="의사결정 기록을 불러오는 중..."
      enableKeyboardNavigation={true}
      stickyHeader={true}
      variant="full-page"
      selectionType="single"
      selectedItems={selectedItems}
      onSelectionChange={({ detail }) => onSelectionChange(detail.selectedItems)}
      header={
        <Header variant="awsui-h1-sticky" counter={`(${totalCount})`}>
          의사결정 기록
        </Header>
      }
      filter={<TextFilter {...filterProps} filteringPlaceholder="의사결정 기록 검색" />}
      pagination={<Pagination {...paginationProps} />}
      columnDefinitions={[
        {
          id: 'notamId',
          header: 'NOTAM',
          cell: (item) => (
            <Link href={`/notams/${item.notamId}`}>{item.notamId.substring(0, 12)}</Link>
          ),
          sortingField: 'notamId',
          isRowHeader: true,
        },
        {
          id: 'overallDecision',
          header: '결정 유형',
          cell: (item) => <DecisionTypeBadge type={item.overallDecision} />,
          sortingField: 'overallDecision',
        },
        {
          id: 'tifrsSummary',
          header: 'TIFRS 요약',
          cell: (item) => summarizeTifrs(item),
        },
        {
          id: 'decidedBy',
          header: '기록자',
          cell: (item) => item.decidedBy,
        },
        {
          id: 'decidedAt',
          header: '기록 시각',
          cell: (item) => formatDate(item.decidedAt),
          sortingField: 'decidedAt',
        },
        {
          id: 'aiSuggestedDecision',
          header: 'AI 제안',
          cell: (item) => <DecisionTypeBadge type={item.aiSuggestedDecision} />,
        },
      ]}
      empty={
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>의사결정 기록이 없습니다</b>
          <Box variant="p" color="text-body-secondary">
            NOTAM 상세 페이지에서 TIFRS 의사결정을 기록할 수 있습니다.
          </Box>
        </Box>
      }
    />
  );
}
