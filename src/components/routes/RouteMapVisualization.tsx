/**
 * 항로 지도 시각화 컴포넌트
 *
 * 항로와 NOTAM 영향을 지도에 표시한다.
 * NOTAM 마커를 클릭하면 상세 정보 팝업을 표시한다.
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

/** 중요도별 한국어 라벨 */
const IMPORTANCE_LABEL: Record<string, string> = {
  critical: '긴급',
  high: '높음',
  medium: '보통',
  low: '낮음',
  routine: '일반',
};

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

  const positions = route.waypoints
    .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
    .map((wp): [number, number] => [wp.latitude, wp.longitude]);

  return (
    <>
      <rl.Polyline positions={positions} pathOptions={{ color: '#0972d3', weight: 3 }} />
      {activeNotams.map((notam) => {
        const color =
          notam.importanceLevel === 'critical'
            ? '#d13212'
            : notam.importanceLevel === 'high'
              ? '#ff9900'
              : '#0972d3';
        const fillOpacity =
          notam.importanceLevel === 'critical'
            ? 0.3
            : notam.importanceLevel === 'high'
              ? 0.25
              : 0.2;

        return (
          <rl.Circle
            key={notam.id}
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
                  중요도:{' '}
                  <span style={{ color, fontWeight: 600 }}>
                    {IMPORTANCE_LABEL[notam.importanceLevel] ?? notam.importanceLevel}
                  </span>
                  {' · '}반경 {notam.radius} NM
                </div>
                <div style={{ marginBottom: 6, fontSize: 12, lineHeight: '1.4' }}>
                  {(notam.aiSummary ?? notam.body).substring(0, 80)}
                  {(notam.aiSummary ?? notam.body).length > 80 ? '...' : ''}
                </div>
                <a
                  href={`/notams/${notam.id}`}
                  style={{
                    color: '#0972d3',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  상세 보기 →
                </a>
              </div>
            </rl.Popup>
          </rl.Circle>
        );
      })}
      {positions.length > 0 && (
        <>
          <rl.Marker position={positions[0]} />
          <rl.Marker position={positions[positions.length - 1]} />
        </>
      )}
    </>
  );
}
