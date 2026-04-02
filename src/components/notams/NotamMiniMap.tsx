/**
 * NOTAM 미니맵 컴포넌트
 *
 * NOTAM 위치를 소형 지도에 표시한다.
 *
 * @requirements FR-012
 */

'use client';

import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import LeafletMapWrapper from '@/components/common/LeafletMapWrapper';

interface NotamMiniMapProps {
  latitude: number;
  longitude: number;
  radius: number;
  locationIndicator: string;
}

/**
 * NOTAM 위치 미니맵을 렌더링한다
 *
 * @param props - NOTAM 위치 정보
 * @param props.latitude - 위도
 * @param props.longitude - 경도
 * @param props.radius - 반경 (해리)
 * @param props.locationIndicator - 공항 코드
 * @returns 미니맵 컨테이너
 */
export default function NotamMiniMap({ latitude, longitude, radius, locationIndicator }: NotamMiniMapProps) {
  // 줌 레벨 계산: 반경이 클수록 줌 아웃
  const zoom = radius > 100 ? 6 : radius > 50 ? 7 : radius > 20 ? 8 : 10;

  return (
    <Container header={<Header variant="h2">{`NOTAM 위치 — ${locationIndicator}`}</Header>}>
      <LeafletMapWrapper center={[latitude, longitude]} zoom={zoom} height="300px">
        <MiniMapLayers latitude={latitude} longitude={longitude} radius={radius} />
      </LeafletMapWrapper>
    </Container>
  );
}

/**
 * 미니맵 레이어 컴포넌트
 *
 * @param props - 위치 정보
 * @param props.latitude - 위도
 * @param props.longitude - 경도
 * @param props.radius - 반경 (해리)
 * @returns react-leaflet 레이어
 */
function MiniMapLayers({ latitude, longitude, radius }: { latitude: number; longitude: number; radius: number }) {
  if (typeof window === 'undefined') return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rl = require('react-leaflet') as {
    Circle: React.ComponentType<{ center: [number, number]; radius: number; pathOptions: Record<string, unknown> }>;
    Marker: React.ComponentType<{ position: [number, number]; children?: React.ReactNode }>;
    Popup: React.ComponentType<{ children?: React.ReactNode }>;
  };

  return (
    <>
      <rl.Circle
        center={[latitude, longitude]}
        radius={radius * 1852}
        pathOptions={{ color: '#d13212', fillOpacity: 0.2 }}
      />
      <rl.Marker position={[latitude, longitude]}>
        <rl.Popup>
          좌표: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          <br />
          반경: {radius} NM
        </rl.Popup>
      </rl.Marker>
    </>
  );
}
