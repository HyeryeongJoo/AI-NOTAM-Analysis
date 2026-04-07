/**
 * 브리핑 테이블 컴포넌트
 *
 * useCollection 기반 브리핑 문서 목록 테이블.
 *
 * @requirements FR-007, FR-008, FR-014
 */

'use client';

import { useCollection } from '@cloudscape-design/collection-hooks';
import Box from '@cloudscape-design/components/box';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Pagination from '@cloudscape-design/components/pagination';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import type { Briefing } from '@/types/briefing';

interface BriefingTableProps {
  briefings: Briefing[];
  totalCount: number;
  isLoading: boolean;
}

/** 브리핑 유형 한국어 매핑 */
const TYPE_LABELS: Record<string, string> = {
  'dispatcher-summary': '운항관리사 요약',
  'company-notam': 'Company NOTAM',
  'disp-comment': 'DISP COMMENT',
  'crew-briefing': '승무원 브리핑',
};

/** 브리핑 상태 매핑 */
const STATUS_MAP: Record<string, 'pending' | 'in-progress' | 'success' | 'info'> = {
  draft: 'pending',
  'pending-review': 'in-progress',
  approved: 'success',
  distributed: 'info',
};

/**
 * 날짜 포맷
 * @param iso
 */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  } catch {
    return iso;
  }
}

/**
 * 브리핑 테이블을 렌더링한다
 *
 * @param props - 테이블 데이터
 * @param props.briefings - Briefing 배열
 * @param props.totalCount - 전체 브리핑 수
 * @param props.isLoading - 로딩 상태
 * @returns Table 컴포넌트
 */
export default function BriefingTable({ briefings, totalCount, isLoading }: BriefingTableProps) {
  const { items, collectionProps, filterProps, paginationProps } = useCollection(briefings, {
    filtering: {
      empty: (
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>브리핑이 없습니다</b>
        </Box>
      ),
      noMatch: (
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>일치하는 브리핑이 없습니다</b>
        </Box>
      ),
    },
    sorting: {},
    pagination: { pageSize: 20 },
  });

  return (
    <Table
      {...collectionProps}
      items={items}
      loading={isLoading}
      loadingText="브리핑을 불러오는 중..."
      enableKeyboardNavigation={true}
      stickyHeader={true}
      variant="full-page"
      header={
        <Header variant="awsui-h1-sticky" counter={`(${totalCount})`}>
          브리핑 문서
        </Header>
      }
      filter={<TextFilter {...filterProps} filteringPlaceholder="브리핑 검색" />}
      pagination={<Pagination {...paginationProps} />}
      columnDefinitions={[
        {
          id: 'id',
          header: 'ID',
          cell: (item) => <Link href={`/briefings/${item.id}`}>{item.id.substring(0, 8)}...</Link>,
          isRowHeader: true,
        },
        {
          id: 'type',
          header: '유형',
          cell: (item) => TYPE_LABELS[item.type] ?? item.type,
          sortingField: 'type',
        },
        {
          id: 'flightId',
          header: '운항편',
          cell: (item) => (
            <Link href={`/flights/${item.flightId}`}>{item.flightNumber ?? item.flightId}</Link>
          ),
        },
        {
          id: 'status',
          header: '상태',
          cell: (item) => (
            <StatusIndicator type={STATUS_MAP[item.status] ?? 'pending'}>
              {item.status}
            </StatusIndicator>
          ),
        },
        {
          id: 'generatedAt',
          header: '생성일',
          cell: (item) => formatDate(item.generatedAt),
          sortingField: 'generatedAt',
        },
        {
          id: 'approvedBy',
          header: '승인자',
          cell: (item) => item.approvedBy ?? '-',
        },
      ]}
      empty={
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>브리핑이 없습니다</b>
        </Box>
      }
    />
  );
}
