/**
 * 항로 영향 지도 컴포넌트
 *
 * 항로 NOTAM 영향을 Leaflet 지도에 시각화한다.
 *
 * @requirements FR-006
 */

'use client';

import { useMemo, useState } from 'react';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Popover from '@cloudscape-design/components/popover';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import LeafletMapWrapper from '@/components/common/LeafletMapWrapper';
import type { RouteImpactMapData } from '@/types/dashboard';
import type { Notam } from '@/types/notam';
import type { SelectProps } from '@cloudscape-design/components/select';

interface RouteImpactMapProps {
  routeImpacts: RouteImpactMapData[];
  criticalNotams: Notam[];
}

/** 한국 중심 기본 좌표 */
const KOREA_CENTER: [number, number] = [36.5, 127.5];
const DEFAULT_ZOOM = 6;

/**
 * 항로 영향 지도를 렌더링한다
 *
 * @param props - 항로 영향 및 NOTAM 데이터
 * @param props.routeImpacts - 항로별 영향 데이터
 * @param props.criticalNotams - 긴급 NOTAM 목록
 * @returns 지도 컨테이너
 */
export default function RouteImpactMap({
  routeImpacts,
  criticalNotams: _criticalNotams,
}: RouteImpactMapProps) {
  const ALL_OPTION: SelectProps.Option = { label: '전체', value: '__all__' };
  const [selectedOption, setSelectedOption] = useState<SelectProps.Option>(ALL_OPTION);

  const routeOptions: SelectProps.Option[] = useMemo(
    () => [
      ALL_OPTION,
      ...routeImpacts.map((ri) => ({
        label: ri.route.routeName,
        value: ri.route.id,
      })),
    ],
    [routeImpacts],
  );

  // 필터링 적용 — 선택된 항로만 또는 전체
  const filteredImpacts = useMemo(() => {
    if (selectedOption.value === '__all__') return routeImpacts;
    return routeImpacts.filter((ri) => ri.route.id === selectedOption.value);
  }, [routeImpacts, selectedOption]);

  // 항로 영향 데이터에 포함된 모든 NOTAM을 중복 제거하여 지도에 표시
  const allMapNotams = useMemo(() => {
    const notamMap = new Map<string, Notam>();
    for (const ri of filteredImpacts) {
      for (const notam of ri.notams) {
        notamMap.set(notam.id, notam);
      }
    }
    return Array.from(notamMap.values());
  }, [filteredImpacts]);

  return (
    <Container
      header={
        <Header
          variant="h2"
          info={
            <Popover
              header="항로 NOTAM 영향 지도 안내"
              content={
                <SpaceBetween size="xs">
                  <Box variant="p">
                    운항 중인 항로와 해당 항로에 영향을 미치는 NOTAM을 지도 위에 시각화합니다.
                  </Box>
                  <Box variant="p">
                    <strong>파란색 선</strong> — 등록된 항로의 경유지(waypoint)를 연결한 경로입니다.
                  </Box>
                  <Box variant="p">
                    <strong>원형 영역</strong> — NOTAM의 적용 범위(반경)를 나타냅니다. 색상은
                    중요도를 의미합니다:
                  </Box>
                  <Box variant="small">
                    • <strong style={{ color: '#d13212' }}>빨간색</strong> — Critical (긴급)
                    <br />• <strong style={{ color: '#ff9900' }}>주황색</strong> — High (높음)
                    <br />• <strong style={{ color: '#0972d3' }}>파란색</strong> — 기타
                  </Box>
                  <Box variant="p">항로 선택 드롭다운으로 특정 항로만 필터링할 수 있습니다.</Box>
                </SpaceBetween>
              }
              triggerType="custom"
              size="large"
            >
              <Link variant="info">정보</Link>
            </Popover>
          }
          actions={
            <Select
              selectedOption={selectedOption}
              onChange={({ detail }) => setSelectedOption(detail.selectedOption)}
              options={routeOptions}
              placeholder="항로 선택"
              selectedAriaLabel="선택됨"
            />
          }
        >
          항로 NOTAM 영향 지도
        </Header>
      }
    >
      <div style={{ position: 'relative' }}>
        <LeafletMapWrapper center={KOREA_CENTER} zoom={DEFAULT_ZOOM} height="500px">
          <RouteImpactMapLayers impacts={filteredImpacts} mapNotams={allMapNotams} />
        </LeafletMapWrapper>
        <MapLegend />
      </div>
    </Container>
  );
}

/**
 * 지도 레이어를 렌더링하는 내부 컴포넌트
 *
 * react-leaflet은 LeafletMapWrapper(dynamic import, ssr:false) 내부에서만 렌더링되므로
 * 직접 import가 안전하다. 별도 파일로 분리하여 dynamic import 컨텍스트에서 사용한다.
 *
 * @param props - 지도 레이어 데이터
 * @param props.impacts - 항로 영향 데이터
 * @param props.criticalNotams - 긴급 NOTAM 목록
 * @returns react-leaflet 레이어 (클라이언트 전용)
 */
/** 범례 아이템 데이터 */
const LEGEND_ITEMS = [
  { color: '#d13212', label: 'Critical NOTAM' },
  { color: '#ff9900', label: 'High NOTAM' },
  { color: '#0972d3', label: '기타 NOTAM' },
  { color: '#0972d3', label: '항로', type: 'line' as const },
];

/**
 * 지도 범례 오버레이
 *
 * @returns 범례 HTML 요소
 */
function MapLegend() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 4,
        padding: '8px 12px',
        fontSize: 12,
        lineHeight: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        pointerEvents: 'none',
      }}
    >
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {item.type === 'line' ? (
            <span
              style={{
                display: 'inline-block',
                width: 16,
                height: 3,
                backgroundColor: item.color,
                borderRadius: 1,
              }}
            />
          ) : (
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: item.color,
                opacity: 0.5,
                border: `2px solid ${item.color}`,
              }}
            />
          )}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 *
 * @param root0
 * @param root0.impacts
 * @param root0.mapNotams
 */
function RouteImpactMapLayers({
  impacts,
  mapNotams,
}: {
  impacts: RouteImpactMapData[];
  mapNotams: Notam[];
}) {
  if (typeof window === 'undefined') return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rl = require('react-leaflet') as {
    Circle: React.ComponentType<{
      center: [number, number];
      radius: number;
      pathOptions: Record<string, unknown>;
      eventHandlers?: Record<string, () => void>;
      children?: React.ReactNode;
    }>;
    Polyline: React.ComponentType<{
      positions: [number, number][];
      pathOptions: Record<string, unknown>;
    }>;
    Popup: React.ComponentType<{ children?: React.ReactNode }>;
  };

  /** 중요도 한국어 라벨 */
  const importanceLabel: Record<string, string> = {
    critical: '긴급',
    high: '높음',
    medium: '보통',
    low: '낮음',
  };

  return (
    <>
      {mapNotams.map((notam) => {
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
                  중요도:{' '}
                  <span style={{ color, fontWeight: 600 }}>
                    {importanceLabel[notam.importanceLevel] ?? notam.importanceLevel}
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

      {impacts.map((ri) => {
        const positions = ri.route.waypoints
          .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
          .map((wp): [number, number] => [wp.latitude, wp.longitude]);

        return (
          <rl.Polyline
            key={`route-${ri.route.id}`}
            positions={positions}
            pathOptions={{ color: '#0972d3', weight: 2 }}
          />
        );
      })}
    </>
  );
}
