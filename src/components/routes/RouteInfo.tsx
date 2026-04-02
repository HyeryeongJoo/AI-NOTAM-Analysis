/**
 * 항로 정보 컴포넌트
 *
 * KeyValuePairs로 항로 메타데이터를 표시한다.
 *
 * @requirements FR-010
 */

'use client';

import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import type { Route } from '@/types/route';

interface RouteInfoProps {
  route: Route;
}

/**
 * 항로 정보를 렌더링한다
 *
 * @param props - 항로 데이터
 * @param props.route - Route 객체
 * @returns KeyValuePairs 컨테이너
 */
export default function RouteInfo({ route }: RouteInfoProps) {
  const statusMap: Record<string, 'success' | 'error' | 'info'> = {
    active: 'success',
    suspended: 'error',
    alternate: 'info',
  };

  return (
    <Container header={<Header variant="h2">항로 정보</Header>}>
      <KeyValuePairs
        columns={3}
        items={[
          { label: '항로명', value: route.routeName },
          { label: '출발 공항', value: route.departureAirport },
          { label: '도착 공항', value: route.arrivalAirport },
          { label: '거리', value: `${route.distance} NM` },
          { label: '비행고도', value: route.flightLevel },
          {
            label: '상태',
            value: (
              <StatusIndicator type={statusMap[route.status] ?? 'info'}>
                {route.status}
              </StatusIndicator>
            ),
          },
          { label: '항로 경유점', value: route.waypoints.map((wp) => wp.name).join(' → ') },
          { label: '항공로', value: route.airways.join(', ') || 'N/A' },
          { label: '대체 항로', value: route.alternateRouteIds.length > 0 ? route.alternateRouteIds.join(', ') : '없음' },
        ]}
      />
    </Container>
  );
}
