/**
 * 항로 지도 시각화 컴포넌트
 *
 * 항로와 NOTAM 영향을 지도에 표시한다.
 *
 * @requirements FR-010
 */

'use client';

import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import LeafletMapWrapper from '@/components/common/LeafletMapWrapper';
import type { NotamRouteImpact } from '@/types/impact';
import type { Notam } from '@/types/notam';
import type { Route } from '@/types/route';

interface RouteMapVisualizationProps {
  route: Route;
  impacts: NotamRouteImpact[];
  activeNotams: Notam[];
}

/**
 * 항로 지도 시각화를 렌더링한다
 *
 * @param props - 항로 및 영향 데이터
 * @param props.route - Route 객체
 * @param props.impacts - 영향 기록 목록
 * @param props.activeNotams - 활성 NOTAM 목록
 * @returns 지도 컨테이너
 */
export default function RouteMapVisualization({ route, impacts: _impacts, activeNotams }: RouteMapVisualizationProps) {
  const waypoints = route.waypoints.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  const center: [number, number] = waypoints.length > 0
    ? [
        waypoints.reduce((sum, wp) => sum + wp.latitude, 0) / waypoints.length,
        waypoints.reduce((sum, wp) => sum + wp.longitude, 0) / waypoints.length,
      ]
    : [36.5, 127.5];

  return (
    <Container header={<Header variant="h2">항로 지도</Header>}>
      <LeafletMapWrapper center={center} zoom={6} height="400px">
        <RouteMapLayers route={route} activeNotams={activeNotams} />
      </LeafletMapWrapper>
    </Container>
  );
}

/**
 * 항로 지도 레이어 컴포넌트
 *
 * @param props - 지도 데이터
 * @param props.route - Route 객체
 * @param props.activeNotams - 활성 NOTAM 목록
 * @returns react-leaflet 레이어
 */
function RouteMapLayers({ route, activeNotams }: { route: Route; activeNotams: Notam[] }) {
  if (typeof window === 'undefined') return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rl = require('react-leaflet') as {
    Circle: React.ComponentType<{ center: [number, number]; radius: number; pathOptions: Record<string, unknown> }>;
    Polyline: React.ComponentType<{ positions: [number, number][]; pathOptions: Record<string, unknown> }>;
    Marker: React.ComponentType<{ position: [number, number] }>;
  };

  const positions = route.waypoints
    .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
    .map((wp): [number, number] => [wp.latitude, wp.longitude]);

  return (
    <>
      <rl.Polyline positions={positions} pathOptions={{ color: '#0972d3', weight: 3 }} />
      {activeNotams.map((notam) => (
        <rl.Circle
          key={notam.id}
          center={[notam.latitude, notam.longitude]}
          radius={notam.radius * 1852}
          pathOptions={{ color: '#d13212', fillOpacity: 0.2 }}
        />
      ))}
      {positions.length > 0 && (
        <>
          <rl.Marker position={positions[0]} />
          <rl.Marker position={positions[positions.length - 1]} />
        </>
      )}
    </>
  );
}
