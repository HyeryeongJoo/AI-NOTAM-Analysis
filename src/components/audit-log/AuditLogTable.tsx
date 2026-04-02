/**
 * 감사 로그 테이블 컴포넌트
 *
 * useCollection 기반 감사 로그 목록 테이블.
 *
 * @requirements FR-017
 */

'use client';

import { useCollection } from '@cloudscape-design/collection-hooks';
import Box from '@cloudscape-design/components/box';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Pagination from '@cloudscape-design/components/pagination';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import type { AuditLog } from '@/types/auditLog';

interface AuditLogTableProps {
  logs: AuditLog[];
  totalCount: number;
  isLoading: boolean;
}

/** 액션 한국어 매핑 */
const ACTION_LABELS: Record<string, string> = {
  view: '조회',
  analyze: '분석',
  approve: '승인',
  reject: '반려',
  'register-ref-book': 'REF BOOK 등록',
  'generate-briefing': '브리핑 생성',
  'acknowledge-alert': '알림 확인',
};

/** targetType에 따른 링크 경로 매핑 */
const TARGET_LINKS: Record<string, string> = {
  notam: '/notams',
  flight: '/flights',
  route: '/routes',
  briefing: '/briefings',
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
 * 감사 로그 테이블을 렌더링한다
 *
 * @param props - 테이블 데이터
 * @param props.logs - AuditLog 배열
 * @param props.totalCount - 전체 로그 수
 * @param props.isLoading - 로딩 상태
 * @returns Table 컴포넌트
 */
export default function AuditLogTable({ logs, totalCount, isLoading }: AuditLogTableProps) {
  const { items, collectionProps, filterProps, paginationProps } = useCollection(logs, {
    filtering: {
      empty: (
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>감사 로그가 없습니다</b>
        </Box>
      ),
      noMatch: (
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>일치하는 로그가 없습니다</b>
        </Box>
      ),
    },
    sorting: {
      defaultState: { sortingColumn: { sortingField: 'timestamp' }, isDescending: true },
    },
    pagination: { pageSize: 20 },
  });

  return (
    <Table
      {...collectionProps}
      items={items}
      loading={isLoading}
      loadingText="감사 로그를 불러오는 중..."
      enableKeyboardNavigation={true}
      stickyHeader={true}
      variant="full-page"
      header={
        <Header variant="awsui-h1-sticky" counter={`(${totalCount})`}>
          감사 로그
        </Header>
      }
      filter={<TextFilter {...filterProps} filteringPlaceholder="감사 로그 검색" />}
      pagination={<Pagination {...paginationProps} />}
      columnDefinitions={[
        {
          id: 'timestamp',
          header: '시각',
          cell: (item) => formatDate(item.timestamp),
          sortingField: 'timestamp',
          isRowHeader: true,
        },
        {
          id: 'userId',
          header: '사용자',
          cell: (item) => item.userId,
        },
        {
          id: 'action',
          header: '액션',
          cell: (item) => ACTION_LABELS[item.action] ?? item.action,
          sortingField: 'action',
        },
        {
          id: 'targetType',
          header: '대상 유형',
          cell: (item) => item.targetType,
        },
        {
          id: 'targetId',
          header: '대상 ID',
          cell: (item) => {
            const basePath = TARGET_LINKS[item.targetType];
            if (basePath) {
              return <Link href={`${basePath}/${item.targetId}`}>{item.targetId.substring(0, 8)}...</Link>;
            }
            return item.targetId.substring(0, 8) + '...';
          },
        },
        {
          id: 'details',
          header: '상세',
          cell: (item) => item.details,
        },
      ]}
      empty={
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>감사 로그가 없습니다</b>
        </Box>
      }
    />
  );
}
