/**
 * 항로 NOTAM 영향 테이블 컴포넌트
 *
 * 항로에 영향을 미치는 NOTAM 목록을 표시한다.
 *
 * @requirements FR-010
 */

'use client';

import { useCollection } from '@cloudscape-design/collection-hooks';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import type { NotamRouteImpact } from '@/types/impact';

interface RouteNotamImpactsProps {
  impacts: NotamRouteImpact[];
}

/**
 * 항로 NOTAM 영향 테이블을 렌더링한다
 *
 * @param props - 영향 기록 목록
 * @param props.impacts - NotamRouteImpact 배열
 * @returns Table 컨테이너
 */
export default function RouteNotamImpacts({ impacts }: RouteNotamImpactsProps) {
  const { items, collectionProps } = useCollection(impacts, {
    sorting: {},
  });

  return (
    <Container
      header={<Header variant="h2" counter={`(${impacts.length})`}>NOTAM 영향</Header>}
    >
      <Table
        {...collectionProps}
        items={items}
        enableKeyboardNavigation={true}
        columnDefinitions={[
          {
            id: 'notamId',
            header: 'NOTAM',
            cell: (item) => <Link href={`/notams/${item.notamId}`}>{item.notamId.substring(0, 8)}...</Link>,
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
            <b>NOTAM 영향이 없습니다</b>
          </Box>
        }
      />
    </Container>
  );
}
