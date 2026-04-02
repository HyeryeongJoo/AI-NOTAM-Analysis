/**
 * NOTAM 영향 섹션 컴포넌트
 *
 * 영향받는 항로와 운항편을 Tabs로 표시한다.
 *
 * @requirements FR-003, FR-004
 */

'use client';

import { useCollection } from '@cloudscape-design/collection-hooks';
import Box from '@cloudscape-design/components/box';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import Tabs from '@cloudscape-design/components/tabs';
import type { NotamFlightImpact, NotamRouteImpact } from '@/types/impact';

interface NotamImpactSectionProps {
  notamId: string;
  affectedRoutes: NotamRouteImpact[];
  affectedFlights: NotamFlightImpact[];
}

/**
 * NOTAM 영향 섹션을 렌더링한다
 *
 * @param props - 영향 데이터
 * @param props.notamId - NOTAM ID
 * @param props.affectedRoutes - 영향받는 항로 목록
 * @param props.affectedFlights - 영향받는 운항편 목록
 * @returns Tabs 컴포넌트
 */
export default function NotamImpactSection({
  notamId: _notamId,
  affectedRoutes,
  affectedFlights,
}: NotamImpactSectionProps) {
  const { items: routeItems, collectionProps: routeCollectionProps } = useCollection(affectedRoutes, {
    sorting: {},
  });

  const { items: flightItems, collectionProps: flightCollectionProps } = useCollection(affectedFlights, {
    sorting: {},
  });

  return (
    <Tabs
      tabs={[
        {
          id: 'routes',
          label: `영향받는 항로 (${affectedRoutes.length})`,
          content: (
            <Table
              {...routeCollectionProps}
              items={routeItems}
              enableKeyboardNavigation={true}
              columnDefinitions={[
                {
                  id: 'routeId',
                  header: '항로',
                  cell: (item) => <Link href={`/routes/${item.routeId}`}>{item.routeId}</Link>,
                  isRowHeader: true,
                },
                { id: 'overlapType', header: '중첩 유형', cell: (item) => item.overlapType },
                { id: 'affectedSegment', header: '영향 구간', cell: (item) => item.affectedSegment },
                {
                  id: 'distanceThroughArea',
                  header: '영향 거리 (NM)',
                  cell: (item) => item.distanceThroughArea.toFixed(1),
                },
                {
                  id: 'altitudeConflict',
                  header: '고도 충돌',
                  cell: (item) => (
                    <StatusIndicator type={item.altitudeConflict ? 'error' : 'success'}>
                      {item.altitudeConflict ? '충돌' : '안전'}
                    </StatusIndicator>
                  ),
                },
              ]}
              empty={
                <Box textAlign="center" padding={{ bottom: 's' }}>
                  <b>영향받는 항로가 없습니다</b>
                </Box>
              }
            />
          ),
        },
        {
          id: 'flights',
          label: `영향받는 운항편 (${affectedFlights.length})`,
          content: (
            <Table
              {...flightCollectionProps}
              items={flightItems}
              enableKeyboardNavigation={true}
              columnDefinitions={[
                {
                  id: 'flightId',
                  header: '운항편',
                  cell: (item) => <Link href={`/flights/${item.flightId}`}>{item.flightId}</Link>,
                  isRowHeader: true,
                },
                {
                  id: 'temporalOverlap',
                  header: '시간 중첩',
                  cell: (item) => (
                    <StatusIndicator type={item.temporalOverlap ? 'warning' : 'success'}>
                      {item.temporalOverlap ? '중첩' : '안전'}
                    </StatusIndicator>
                  ),
                },
                {
                  id: 'spatialOverlap',
                  header: '공간 중첩',
                  cell: (item) => (
                    <StatusIndicator type={item.spatialOverlap ? 'warning' : 'success'}>
                      {item.spatialOverlap ? '중첩' : '안전'}
                    </StatusIndicator>
                  ),
                },
                { id: 'impactSummary', header: '영향 요약', cell: (item) => item.impactSummary },
              ]}
              empty={
                <Box textAlign="center" padding={{ bottom: 's' }}>
                  <b>영향받는 운항편이 없습니다</b>
                </Box>
              }
            />
          ),
        },
      ]}
    />
  );
}
