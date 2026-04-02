/**
 * 운항편 항로 지도 컴포넌트
 *
 * 항로, NOTAM 영향 범위, 대체 항로를 지도에 표시한다.
 *
 * @requirements FR-009
 */

'use client';

import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import LeafletMapWrapper from '@/components/common/LeafletMapWrapper';
import type { Notam } from '@/types/notam';
import type { Route } from '@/types/route';

interface FlightRouteMapProps {
  route: Route;
  affectedNotams: Notam[];
  alternativeRoute: Route | null;
}

/**
 * 운항편 항로 지도를 렌더링한다
 *
 * @param props - 항로 및 NOTAM 데이터
 * @param props.route - 원본 항로
 * @param props.affectedNotams - 영향 NOTAM 목록
 * @param props.alternativeRoute - 대체 항로 (선택적)
 * @returns 지도 컨테이너
 */
export default function FlightRouteMap({ route, affectedNotams, alternativeRoute }: FlightRouteMapProps) {
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
        <FlightRouteMapLayers
          route={route}
          affectedNotams={affectedNotams}
          alternativeRoute={alternativeRoute}
        />
      </LeafletMapWrapper>
    </Container>
  );
}

/**
 * 항로 지도 레이어 컴포넌트
 *
 * @param props - 지도 데이터
 * @param props.route - 원본 항로
 * @param props.affectedNotams - 영향 NOTAM 목록
 * @param props.alternativeRoute - 대체 항로
 * @returns react-leaflet 레이어
 */
function FlightRouteMapLayers({
  route,
  affectedNotams,
  alternativeRoute,
}: FlightRouteMapProps) {
  if (typeof window === 'undefined') return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rl = require('react-leaflet') as {
    Circle: React.ComponentType<{
      center: [number, number];
      radius: number;
      pathOptions: Record<string, unknown>;
      children?: React.ReactNode;
    }>;
    Polyline: React.ComponentType<{ positions: [number, number][]; pathOptions: Record<string, unknown> }>;
    Marker: React.ComponentType<{ position: [number, number] }>;
    Popup: React.ComponentType<{ children?: React.ReactNode }>;
  };

  /** 중요도 한국어 라벨 */
  const importanceLabel: Record<string, string> = {
    critical: '긴급',
    high: '높음',
    medium: '보통',
    low: '낮음',
  };

  /** 중요도별 색상 */
  const importanceColor: Record<string, string> = {
    critical: '#d13212',
    high: '#ff9900',
    medium: '#0972d3',
    low: '#0972d3',
  };

  const routePositions = route.waypoints
    .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
    .map((wp): [number, number] => [wp.latitude, wp.longitude]);

  const altPositions = alternativeRoute
    ? alternativeRoute.waypoints
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
        .map((wp): [number, number] => [wp.latitude, wp.longitude])
    : [];

  return (
    <>
      {/* 원본 항로 */}
      <rl.Polyline positions={routePositions} pathOptions={{ color: '#0972d3', weight: 3 }} />

      {/* 대체 항로 */}
      {altPositions.length > 0 && (
        <rl.Polyline positions={altPositions} pathOptions={{ color: '#037f0c', weight: 2, dashArray: '5 10' }} />
      )}

      {/* NOTAM 영향 범위 */}
      {affectedNotams.map((notam) => {
        const color = importanceColor[notam.importanceLevel] ?? '#0972d3';
        const fillOpacity =
          notam.importanceLevel === 'critical' ? 0.3 : notam.importanceLevel === 'high' ? 0.25 : 0.2;

        return (
          <rl.Circle
            key={`notam-${notam.id}`}
            center={[notam.latitude, notam.longitude]}
            radius={notam.radius * 1852}
            pathOptions={{ color, fillOpacity }}
          >
            <rl.Popup>
              <div style={{ minWidth: 180, fontSize: 13 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {notam.locationIndicator} — {notam.qCode}
                </div>
                <div style={{ marginBottom: 4, color: '#555' }}>
                  중요도: <span style={{ color, fontWeight: 600 }}>{importanceLabel[notam.importanceLevel] ?? notam.importanceLevel}</span>
                  {' · '}반경 {notam.radius} NM
                </div>
                <div style={{ marginBottom: 6, fontSize: 12, lineHeight: '1.4' }}>
                  {(notam.aiSummary ?? notam.body).substring(0, 80)}
                  {(notam.aiSummary ?? notam.body).length > 80 ? '...' : ''}
                </div>
                <a
                  href={`/notams/${notam.id}`}
                  style={{ color: '#0972d3', textDecoration: 'none', fontWeight: 600, fontSize: 12 }}
                >
                  상세 보기 →
                </a>
              </div>
            </rl.Popup>
          </rl.Circle>
        );
      })}

      {/* 출발/도착 공항 마커 */}
      {routePositions.length > 0 && (
        <>
          <rl.Marker position={routePositions[0]} />
          <rl.Marker position={routePositions[routePositions.length - 1]} />
        </>
      )}
    </>
  );
}
