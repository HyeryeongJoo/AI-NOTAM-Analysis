/**
 * Leaflet 지도 래퍼 컴포넌트
 *
 * dynamic import로 SSR을 방지하고 MapContainer를 렌더링한다.
 *
 * @requirements FR-006
 */

'use client';

import dynamic from 'next/dynamic';
import Box from '@cloudscape-design/components/box';
import Spinner from '@cloudscape-design/components/spinner';

const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <Box textAlign="center" padding="xxl">
      <Spinner size="large" />
    </Box>
  ),
});

interface LeafletMapWrapperProps {
  center: [number, number];
  zoom: number;
  height?: string;
  children?: React.ReactNode;
}

/**
 * SSR-safe Leaflet 지도 래퍼
 *
 * @param props - 지도 설정
 * @param props.center - 지도 중심 좌표
 * @param props.zoom - 줌 레벨
 * @param props.height - 지도 높이 (기본값 '500px')
 * @param props.children - react-leaflet 레이어 컴포넌트
 * @returns 동적 로드된 지도 컴포넌트
 */
export default function LeafletMapWrapper({
  center,
  zoom,
  height = '500px',
  children,
}: LeafletMapWrapperProps) {
  return (
    <LeafletMapInner center={center} zoom={zoom} height={height}>
      {children}
    </LeafletMapInner>
  );
}
