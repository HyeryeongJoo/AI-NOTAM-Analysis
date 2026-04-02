/**
 * Leaflet 지도 내부 컴포넌트
 *
 * dynamic import로 SSR을 방지하기 위한 내부 구현.
 * LeafletMapWrapper에서만 import한다.
 */

'use client';

import L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/* Leaflet 기본 마커 아이콘 경로 수정 (webpack 환경 호환) */
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)['_getIconUrl'];
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LeafletMapInnerProps {
  center: [number, number];
  zoom: number;
  height: string;
  children?: React.ReactNode;
}

/**
 * Leaflet MapContainer 래퍼
 *
 * @param props - 지도 설정
 * @param props.center - 지도 중심 좌표
 * @param props.zoom - 줌 레벨
 * @param props.height - 지도 높이
 * @param props.children - react-leaflet 레이어 컴포넌트
 * @returns MapContainer 컴포넌트
 */
/**
 * 지도 크기 변경 시 타일을 다시 렌더링하는 컴포넌트
 *
 * 스크롤로 지도가 뷰포트에 진입하거나 컨테이너 크기가 바뀔 때
 * invalidateSize를 호출하여 타일 깨짐을 방지한다.
 */
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    /* 초기 렌더링 후 크기 보정 */
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    /* 컨테이너가 뷰포트에 보일 때마다 크기 보정 */
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);

    /* 스크롤로 지도가 뷰포트에 진입할 때 크기 보정 */
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          map.invalidateSize();
        }
      },
      { threshold: 0.1 },
    );
    intersectionObserver.observe(container);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      intersectionObserver.disconnect();
    };
  }, [map]);

  return null;
}

/**
 *
 * @param root0
 * @param root0.center
 * @param root0.zoom
 * @param root0.height
 * @param root0.children
 */
export default function LeafletMapInner({ center, zoom, height, children }: LeafletMapInnerProps) {
  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={false}
      >
        <MapResizeHandler />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {children}
      </MapContainer>
    </div>
  );
}
