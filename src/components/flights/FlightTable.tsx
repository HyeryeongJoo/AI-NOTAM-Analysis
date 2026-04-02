/**
 * 운항편 테이블 컴포넌트
 *
 * 필터, 정렬, 페이지네이션을 포함한 운항편 목록 테이블.
 *
 * @requirements FR-004, FR-013
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
import ImportanceBadge from '@/components/common/ImportanceBadge';
import type { Flight } from '@/types/flight';

interface FlightTableProps {
  flights: Flight[];
  totalCount: number;
  isLoading: boolean;
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

/** 운항편 상태 매핑 */
const STATUS_MAP: Record<string, 'pending' | 'in-progress' | 'success' | 'error' | 'warning'> = {
  scheduled: 'pending',
  dispatched: 'in-progress',
  'in-flight': 'in-progress',
  arrived: 'success',
  cancelled: 'error',
  diverted: 'warning',
};

/**
 * 운항편 테이블을 렌더링한다
 *
 * @param props - 테이블 데이터
 * @param props.flights - Flight 배열
 * @param props.totalCount - 전체 운항편 수
 * @param props.isLoading - 로딩 상태
 * @returns Table 컴포넌트
 */
export default function FlightTable({ flights, totalCount, isLoading }: FlightTableProps) {
  const { items, collectionProps, filterProps, paginationProps } = useCollection(flights, {
    filtering: {
      empty: (
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>운항편이 없습니다</b>
        </Box>
      ),
      noMatch: (
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>일치하는 운항편이 없습니다</b>
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
      loadingText="운항편을 불러오는 중..."
      enableKeyboardNavigation={true}
      stickyHeader={true}
      variant="full-page"
      header={
        <Header variant="awsui-h1-sticky" counter={`(${totalCount})`}>
          운항편
        </Header>
      }
      filter={
        <TextFilter {...filterProps} filteringPlaceholder="운항편 검색" />
      }
      pagination={<Pagination {...paginationProps} />}
      columnDefinitions={[
        {
          id: 'flightNumber',
          header: '편명',
          cell: (item) => <Link href={`/flights/${item.id}`}>{item.flightNumber}</Link>,
          sortingField: 'flightNumber',
          isRowHeader: true,
        },
        {
          id: 'departureAirport',
          header: '출발',
          cell: (item) => item.departureAirport,
          sortingField: 'departureAirport',
        },
        {
          id: 'arrivalAirport',
          header: '도착',
          cell: (item) => item.arrivalAirport,
        },
        {
          id: 'scheduledDeparture',
          header: '출발 시간',
          cell: (item) => formatDate(item.scheduledDeparture),
          sortingField: 'scheduledDeparture',
        },
        {
          id: 'scheduledArrival',
          header: '도착 시간',
          cell: (item) => formatDate(item.scheduledArrival),
        },
        {
          id: 'aircraftType',
          header: '기종',
          cell: (item) => item.aircraftType,
        },
        {
          id: 'status',
          header: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              상태
              <Popover
                header="운항편 상태 안내"
                content={
                  <SpaceBetween size="xs">
                    <Box>
                      <StatusIndicator type="pending">scheduled</StatusIndicator> — 출발 예정 (배편 미완료)
                    </Box>
                    <Box>
                      <StatusIndicator type="in-progress">dispatched</StatusIndicator> — 운항 배편 완료
                    </Box>
                    <Box>
                      <StatusIndicator type="in-progress">in-flight</StatusIndicator> — 비행 중
                    </Box>
                    <Box>
                      <StatusIndicator type="success">arrived</StatusIndicator> — 도착 완료
                    </Box>
                    <Box>
                      <StatusIndicator type="error">cancelled</StatusIndicator> — 결항
                    </Box>
                    <Box>
                      <StatusIndicator type="warning">diverted</StatusIndicator> — 회항 (목적지 변경)
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
            <StatusIndicator type={STATUS_MAP[item.status] ?? 'pending'}>
              {item.status}
            </StatusIndicator>
          ),
        },
        {
          id: 'notamImpactCount',
          header: '영향 NOTAM',
          cell: (item) => item.notamImpactCount,
          sortingField: 'notamImpactCount',
        },
        {
          id: 'notamMaxSeverity',
          header: '최고 중요도',
          cell: (item) => <ImportanceBadge level={item.notamMaxSeverity} />,
        },
      ]}
      empty={
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>운항편이 없습니다</b>
        </Box>
      }
    />
  );
}
