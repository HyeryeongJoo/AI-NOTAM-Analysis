/**
 * 영향받는 운항편 요약 컴포넌트
 *
 * NOTAM 영향이 있는 운항편만 테이블로 표시한다.
 *
 * @requirements FR-006
 */

'use client';

import { useMemo } from 'react';
import { useCollection } from '@cloudscape-design/collection-hooks';
import Box from '@cloudscape-design/components/box';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import ImportanceBadge from '@/components/common/ImportanceBadge';
import type { Flight } from '@/types/flight';

interface AffectedFlightsSummaryProps {
  flights: Flight[];
}

/**
 * 영향받는 운항편 요약을 렌더링한다
 *
 * @param props - 운항편 목록
 * @param props.flights - Flight 배열
 * @returns Table 컴포넌트
 */
export default function AffectedFlightsSummary({ flights }: AffectedFlightsSummaryProps) {
  const affectedFlights = useMemo(
    () => flights.filter((f) => f.notamImpactCount > 0),
    [flights],
  );

  const { items, collectionProps } = useCollection(affectedFlights, {
    sorting: {
      defaultState: { sortingColumn: { sortingField: 'notamImpactCount' }, isDescending: true },
    },
  });

  return (
    <Table
      {...collectionProps}
      variant="embedded"
      items={items}
      enableKeyboardNavigation={true}
      header={
        <Header variant="h2" counter={`(${affectedFlights.length})`}>
          영향받는 운항편
        </Header>
      }
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
        },
        {
          id: 'arrivalAirport',
          header: '도착',
          cell: (item) => item.arrivalAirport,
        },
        {
          id: 'status',
          header: '상태',
          cell: (item) => {
            const statusMap: Record<string, 'pending' | 'in-progress' | 'success' | 'error' | 'warning'> = {
              scheduled: 'pending',
              dispatched: 'in-progress',
              'in-flight': 'in-progress',
              arrived: 'success',
              cancelled: 'error',
              diverted: 'warning',
            };
            return <StatusIndicator type={statusMap[item.status] ?? 'pending'}>{item.status}</StatusIndicator>;
          },
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
          <b>영향받는 운항편이 없습니다</b>
        </Box>
      }
    />
  );
}
