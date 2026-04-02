/**
 * REF BOOK 테이블 컴포넌트
 *
 * useCollection 기반 REF BOOK 항목 목록 테이블.
 *
 * @requirements FR-011
 */

'use client';

import { useCollection } from '@cloudscape-design/collection-hooks';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import ImportanceBadge from '@/components/common/ImportanceBadge';
import type { RefBookEntry } from '@/types/refBook';

interface RefBookTableProps {
  entries: RefBookEntry[];
  totalCount: number;
  isLoading: boolean;
  onRegisterNew: () => void;
  onDelete: (id: string) => void;
}

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
 * REF BOOK 테이블을 렌더링한다
 *
 * @param props - 테이블 데이터와 이벤트
 * @param props.entries - RefBookEntry 배열
 * @param props.totalCount - 전체 항목 수
 * @param props.isLoading - 로딩 상태
 * @param props.onRegisterNew - 신규 등록 콜백
 * @param props.onDelete - 삭제 콜백
 * @returns Table 컴포넌트
 */
export default function RefBookTable({
  entries,
  totalCount,
  isLoading,
  onRegisterNew,
  onDelete,
}: RefBookTableProps) {
  const { items, collectionProps, filterProps, paginationProps } = useCollection(entries, {
    filtering: {
      empty: (
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>REF BOOK 항목이 없습니다</b>
        </Box>
      ),
      noMatch: (
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>일치하는 항목이 없습니다</b>
        </Box>
      ),
    },
    sorting: {},
    pagination: { pageSize: 20 },
    selection: { trackBy: 'id' },
  });

  return (
    <Table
      {...collectionProps}
      items={items}
      loading={isLoading}
      loadingText="REF BOOK을 불러오는 중..."
      selectionType="single"
      enableKeyboardNavigation={true}
      stickyHeader={true}
      variant="full-page"
      header={
        <Header
          variant="awsui-h1-sticky"
          counter={`(${totalCount})`}
          actions={
            <Button variant="primary" onClick={onRegisterNew}>
              신규 등록
            </Button>
          }
        >
          REF BOOK
        </Header>
      }
      filter={<TextFilter {...filterProps} filteringPlaceholder="REF BOOK 검색" />}
      pagination={<Pagination {...paginationProps} />}
      columnDefinitions={[
        {
          id: 'notamId',
          header: 'NOTAM ID',
          cell: (item) => item.notamId.substring(0, 8) + '...',
          isRowHeader: true,
        },
        { id: 'summary', header: '요약', cell: (item) => item.summary },
        {
          id: 'impactLevel',
          header: '영향도',
          cell: (item) => <ImportanceBadge level={item.impactLevel} />,
        },
        {
          id: 'affectedAirports',
          header: '영향 공항',
          cell: (item) => item.affectedAirports.join(', '),
        },
        {
          id: 'status',
          header: '상태',
          cell: (item) => {
            const map: Record<string, 'success' | 'stopped' | 'warning'> = {
              active: 'success',
              expired: 'stopped',
              superseded: 'warning',
            };
            return <StatusIndicator type={map[item.status] ?? 'info'}>{item.status}</StatusIndicator>;
          },
        },
        {
          id: 'registeredBy',
          header: '등록자',
          cell: (item) => item.registeredBy,
        },
        {
          id: 'registeredAt',
          header: '등록일',
          cell: (item) => formatDate(item.registeredAt),
        },
        {
          id: 'actions',
          header: '관리',
          cell: (item) => (
            <SpaceBetween size="xs" direction="horizontal">
              <Button variant="icon" iconName="remove" onClick={() => onDelete(item.id)} ariaLabel="삭제" />
            </SpaceBetween>
          ),
        },
      ]}
      empty={
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>REF BOOK 항목이 없습니다</b>
          <Box variant="p">신규 등록 버튼을 눌러 항목을 추가하세요.</Box>
        </Box>
      }
    />
  );
}
