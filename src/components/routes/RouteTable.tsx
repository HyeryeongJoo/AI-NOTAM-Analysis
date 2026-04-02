/**
 * 항로 테이블 컴포넌트
 *
 * 필터, 정렬, 페이지네이션을 포함한 항로 목록 테이블.
 *
 * @requirements FR-010, FR-006
 */

'use client';

import { useCollection } from '@cloudscape-design/collection-hooks';
import Box from '@cloudscape-design/components/box';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Pagination from '@cloudscape-design/components/pagination';
import Popover from '@cloudscape-design/components/popover';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import TextFilter from '@cloudscape-design/components/text-filter';
import type { Route } from '@/types/route';

interface RouteTableProps {
  routes: Route[];
  totalCount: number;
  isLoading: boolean;
}

/** 항로 상태 매핑 */
const STATUS_MAP: Record<string, 'success' | 'error' | 'info'> = {
  active: 'success',
  suspended: 'error',
  alternate: 'info',
};

/**
 * 항로 테이블을 렌더링한다
 *
 * @param props - 테이블 데이터
 * @param props.routes - Route 배열
 * @param props.totalCount - 전체 항로 수
 * @param props.isLoading - 로딩 상태
 * @returns Table 컴포넌트
 */
export default function RouteTable({ routes, totalCount, isLoading }: RouteTableProps) {
  const { items, collectionProps, filterProps, paginationProps } = useCollection(routes, {
    filtering: {
      empty: (
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>항로가 없습니다</b>
        </Box>
      ),
      noMatch: (
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>일치하는 항로가 없습니다</b>
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
      loadingText="항로를 불러오는 중..."
      enableKeyboardNavigation={true}
      stickyHeader={true}
      variant="full-page"
      header={
        <Header variant="awsui-h1-sticky" counter={`(${totalCount})`}>
          항로 목록
        </Header>
      }
      filter={<TextFilter {...filterProps} filteringPlaceholder="항로 검색" />}
      pagination={<Pagination {...paginationProps} />}
      columnDefinitions={[
        {
          id: 'routeName',
          header: '항로명',
          cell: (item) => <Link href={`/routes/${item.id}`}>{item.routeName}</Link>,
          sortingField: 'routeName',
          isRowHeader: true,
        },
        {
          id: 'departureAirport',
          header: '출발',
          cell: (item) => item.departureAirport,
        },
        {
          id: 'arrivalAirport',
          header: '도착',
          cell: (item) => item.arrivalAirport,
        },
        {
          id: 'distance',
          header: '거리 (NM)',
          cell: (item) => item.distance,
          sortingField: 'distance',
        },
        {
          id: 'flightLevel',
          header: '비행고도',
          cell: (item) => item.flightLevel,
        },
        {
          id: 'status',
          header: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              상태
              <Popover
                header="항로 상태 안내"
                content={
                  <SpaceBetween size="xs">
                    <Box>
                      <StatusIndicator type="success">active</StatusIndicator> — 현재 운항 중인 항로입니다.
                    </Box>
                    <Box>
                      <StatusIndicator type="error">suspended</StatusIndicator> — NOTAM 또는 기타 사유로 일시 중단된 항로입니다.
                    </Box>
                    <Box>
                      <StatusIndicator type="info">alternate</StatusIndicator> — 대체 항로로 지정된 경로입니다.
                    </Box>
                  </SpaceBetween>
                }
                triggerType="custom"
                size="medium"
              >
                <Link variant="info">정보</Link>
              </Popover>
            </span>
          ),
          cell: (item) => (
            <StatusIndicator type={STATUS_MAP[item.status] ?? 'info'}>
              {item.status}
            </StatusIndicator>
          ),
        },
        {
          id: 'waypoints',
          header: '경유점',
          cell: (item) => item.waypoints.length,
        },
      ]}
      empty={
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>항로가 없습니다</b>
        </Box>
      }
    />
  );
}
