/**
 * NOTAM-항로 영향 시드 데이터
 *
 * 사전 계산된 NOTAM-항로 공간 중첩 기록 20건.
 *
 * @requirements FR-003, FR-010
 */

import type { NotamRouteImpact } from '@/types/impact';

/** 시드 항로 영향 데이터 (20건) */
export const SEED_ROUTE_IMPACTS: NotamRouteImpact[] = [
  // notam-001 (RKSI RWY 폐쇄) → 인천 출발/도착 항로
  { id: 'ri-001', notamId: 'notam-001', routeId: 'route-001', overlapType: 'within-radius', affectedSegment: 'RKSI_-OLMEN', distanceThroughArea: 5, altitudeConflict: false },
  { id: 'ri-002', notamId: 'notam-001', routeId: 'route-003', overlapType: 'within-radius', affectedSegment: 'RKSI_-KARPA', distanceThroughArea: 5, altitudeConflict: false },
  { id: 'ri-003', notamId: 'notam-001', routeId: 'route-008', overlapType: 'within-radius', affectedSegment: 'RKSI_-REBIT', distanceThroughArea: 5, altitudeConflict: false },
  // notam-004 (군사 훈련 중부) → ICN-PUS, ICN-CJU
  { id: 'ri-004', notamId: 'notam-004', routeId: 'route-009', overlapType: 'direct-crossing', affectedSegment: 'OLMEN-GONMA', distanceThroughArea: 25, altitudeConflict: true },
  { id: 'ri-005', notamId: 'notam-004', routeId: 'route-008', overlapType: 'adjacent', affectedSegment: 'REBIT-OSPOT', distanceThroughArea: 0, altitudeConflict: true },
  // notam-005 (제주 VOR) → CJU 도착 항로
  { id: 'ri-006', notamId: 'notam-005', routeId: 'route-008', overlapType: 'within-radius', affectedSegment: 'SIBAL-RKPC_', distanceThroughArea: 10, altitudeConflict: false },
  { id: 'ri-007', notamId: 'notam-005', routeId: 'route-010', overlapType: 'within-radius', affectedSegment: 'MOPNE-RKPC_', distanceThroughArea: 10, altitudeConflict: false },
  // notam-011 (NRT RWY 폐쇄) → ICN-NRT 항로
  { id: 'ri-008', notamId: 'notam-011', routeId: 'route-001', overlapType: 'within-radius', affectedSegment: 'LALID-RJAA_', distanceThroughArea: 5, altitudeConflict: false },
  { id: 'ri-009', notamId: 'notam-011', routeId: 'route-002', overlapType: 'within-radius', affectedSegment: 'KARIN-RJAA_', distanceThroughArea: 5, altitudeConflict: false },
  // notam-012 (일본 VIP 제한) → ICN-KIX
  { id: 'ri-010', notamId: 'notam-012', routeId: 'route-003', overlapType: 'adjacent', affectedSegment: 'DENEB-MIKOT', distanceThroughArea: 0, altitudeConflict: true },
  // notam-015 (후쿠오카 레이더) → 일본 방면 항로
  { id: 'ri-011', notamId: 'notam-015', routeId: 'route-001', overlapType: 'within-radius', affectedSegment: 'PIMOL-SAZAN', distanceThroughArea: 35, altitudeConflict: false },
  { id: 'ri-012', notamId: 'notam-015', routeId: 'route-003', overlapType: 'within-radius', affectedSegment: 'NODAL-DENEB', distanceThroughArea: 30, altitudeConflict: false },
  // notam-016 (BKK RWY 폐쇄) → ICN-BKK
  { id: 'ri-013', notamId: 'notam-016', routeId: 'route-005', overlapType: 'within-radius', affectedSegment: 'MANAT-VTBS_', distanceThroughArea: 5, altitudeConflict: false },
  { id: 'ri-014', notamId: 'notam-016', routeId: 'route-006', overlapType: 'within-radius', affectedSegment: 'BUNTA-VTBS_', distanceThroughArea: 5, altitudeConflict: false },
  // notam-017 (태국 제한 구역) → ICN-BKK
  { id: 'ri-015', notamId: 'notam-017', routeId: 'route-005', overlapType: 'direct-crossing', affectedSegment: 'VIBOM-MANAT', distanceThroughArea: 20, altitudeConflict: true },
  // notam-023 (미사일 사격) → ICN-NRT
  { id: 'ri-016', notamId: 'notam-023', routeId: 'route-001', overlapType: 'direct-crossing', affectedSegment: 'AKETA-PIMOL', distanceThroughArea: 18, altitudeConflict: true },
  // notam-036 (서해 공중급유) → ICN-BKK/HAN/SHA
  { id: 'ri-017', notamId: 'notam-036', routeId: 'route-005', overlapType: 'direct-crossing', affectedSegment: 'RKSI_-GUKDO', distanceThroughArea: 22, altitudeConflict: true },
  { id: 'ri-018', notamId: 'notam-036', routeId: 'route-007', overlapType: 'direct-crossing', affectedSegment: 'RKSI_-GUKDO', distanceThroughArea: 22, altitudeConflict: true },
  { id: 'ri-019', notamId: 'notam-036', routeId: 'route-012', overlapType: 'direct-crossing', affectedSegment: 'RKSI_-GUKDO', distanceThroughArea: 22, altitudeConflict: true },
  // notam-050 (우주발사 제한) → ICN-SHA
  { id: 'ri-020', notamId: 'notam-050', routeId: 'route-012', overlapType: 'direct-crossing', affectedSegment: 'HANUL-ZSSS_', distanceThroughArea: 35, altitudeConflict: true },
];
