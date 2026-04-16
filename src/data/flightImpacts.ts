/**
 * NOTAM-운항편 영향 시드 데이터
 *
 * 사전 계산된 NOTAM-운항편 시공간 중첩 기록 45건.
 *
 * @requirements FR-004, FR-010
 */

import type { NotamFlightImpact } from '@/types/impact';

/** 시드 운항편 영향 데이터 (45건) */
export const SEED_FLIGHT_IMPACTS: NotamFlightImpact[] = [
  // flight-001 (7C101, ICN→NRT, route-001)
  {
    id: 'fi-001',
    notamId: 'notam-001',
    flightId: 'flight-001',
    routeId: 'route-001',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'RKSI RWY 15L/33R 폐쇄로 출발 지연 가능',
  },
  {
    id: 'fi-002',
    notamId: 'notam-002',
    flightId: 'flight-001',
    routeId: 'route-001',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'RKSI ILS 33L 정비 시간대 출발',
  },
  {
    id: 'fi-003',
    notamId: 'notam-015',
    flightId: 'flight-001',
    routeId: 'route-001',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'FUK 레이더 고장으로 항로 지연',
  },
  // flight-002 (7C103, ICN→NRT)
  {
    id: 'fi-004',
    notamId: 'notam-001',
    flightId: 'flight-002',
    routeId: 'route-001',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'RKSI RWY 폐쇄 영향',
  },
  {
    id: 'fi-005',
    notamId: 'notam-023',
    flightId: 'flight-002',
    routeId: 'route-001',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '미사일 사격 구역 항로 직접 통과',
  },
  // flight-004 (7C201, ICN→KIX, route-003)
  {
    id: 'fi-006',
    notamId: 'notam-001',
    flightId: 'flight-004',
    routeId: 'route-003',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'RKSI RWY 폐쇄로 출발 지연',
  },
  {
    id: 'fi-007',
    notamId: 'notam-012',
    flightId: 'flight-004',
    routeId: 'route-003',
    temporalOverlap: false,
    spatialOverlap: true,
    impactSummary: 'VIP 제한 구역 인접 (시간 미중첩)',
  },
  // flight-006 (7C202, KIX→ICN, in-flight)
  {
    id: 'fi-008',
    notamId: 'notam-015',
    flightId: 'flight-006',
    routeId: 'route-003',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'FUK 레이더 고장 영향',
  },
  // flight-007 (7C301, ICN→BKK, route-005)
  {
    id: 'fi-009',
    notamId: 'notam-016',
    flightId: 'flight-007',
    routeId: 'route-005',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'BKK RWY 야간 폐쇄 도착 시간 영향',
  },
  {
    id: 'fi-010',
    notamId: 'notam-017',
    flightId: 'flight-007',
    routeId: 'route-005',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '태국 R-401 제한 구역 통과',
  },
  {
    id: 'fi-011',
    notamId: 'notam-036',
    flightId: 'flight-007',
    routeId: 'route-005',
    temporalOverlap: false,
    spatialOverlap: true,
    impactSummary: '서해 공중급유 구역 (시간 미중첩)',
  },
  {
    id: 'fi-012',
    notamId: 'notam-047',
    flightId: 'flight-007',
    routeId: 'route-005',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'BKK ILS CAT III 사용 불가',
  },
  // flight-009 (7C401, ICN→HAN, route-007)
  {
    id: 'fi-013',
    notamId: 'notam-019',
    flightId: 'flight-009',
    routeId: 'route-007',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '하노이 접근 레이더 사용 불가',
  },
  // flight-011 (7C501, ICN→CJU, route-008)
  {
    id: 'fi-014',
    notamId: 'notam-005',
    flightId: 'flight-011',
    routeId: 'route-008',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '제주 VOR/DME 사용 불가',
  },
  {
    id: 'fi-015',
    notamId: 'notam-038',
    flightId: 'flight-011',
    routeId: 'route-008',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '제주 ILS RWY 07 GP 사용 불가',
  },
  // flight-012 (7C503, ICN→CJU)
  {
    id: 'fi-016',
    notamId: 'notam-005',
    flightId: 'flight-012',
    routeId: 'route-008',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '제주 VOR/DME 사용 불가',
  },
  // flight-015 (7C601, ICN→PUS, route-009)
  {
    id: 'fi-017',
    notamId: 'notam-004',
    flightId: 'flight-015',
    routeId: 'route-009',
    temporalOverlap: false,
    spatialOverlap: true,
    impactSummary: '군사 훈련 구역 통과 (시간 미중첩)',
  },
  // flight-017 (7C701, GMP→CJU, route-010)
  {
    id: 'fi-018',
    notamId: 'notam-005',
    flightId: 'flight-017',
    routeId: 'route-010',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '제주 VOR/DME 사용 불가',
  },
  {
    id: 'fi-019',
    notamId: 'notam-008',
    flightId: 'flight-017',
    routeId: 'route-010',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '김포 ALS/PAPI RWY 14L 사용 불가',
  },
  // flight-019 (7C801, ICN→MNL, route-011)
  {
    id: 'fi-020',
    notamId: 'notam-001',
    flightId: 'flight-019',
    routeId: 'route-011',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'RKSI RWY 폐쇄 영향',
  },
  // flight-021 (7C901, ICN→SHA, route-012)
  {
    id: 'fi-021',
    notamId: 'notam-050',
    flightId: 'flight-021',
    routeId: 'route-012',
    temporalOverlap: false,
    spatialOverlap: true,
    impactSummary: '우주발사 제한 구역 (시간 미중첩)',
  },
  // flight-023 (7C105, ICN→NRT)
  {
    id: 'fi-022',
    notamId: 'notam-001',
    flightId: 'flight-023',
    routeId: 'route-001',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'RKSI RWY 폐쇄 영향',
  },
  {
    id: 'fi-023',
    notamId: 'notam-045',
    flightId: 'flight-023',
    routeId: 'route-001',
    temporalOverlap: false,
    spatialOverlap: true,
    impactSummary: '해군 사격 구역 PIMOL 인근 (시간 미중첩)',
  },
  // flight-025 (7C303, ICN→BKK)
  {
    id: 'fi-024',
    notamId: 'notam-016',
    flightId: 'flight-025',
    routeId: 'route-005',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'BKK RWY 야간 폐쇄 영향',
  },
  {
    id: 'fi-025',
    notamId: 'notam-017',
    flightId: 'flight-025',
    routeId: 'route-005',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '태국 R-401 제한 구역',
  },
  // flight-030 (7C960, ICN→HAN, route-007)
  {
    id: 'fi-026',
    notamId: 'notam-019',
    flightId: 'flight-030',
    routeId: 'route-007',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '하노이 접근 레이더 사용 불가',
  },
  {
    id: 'fi-027',
    notamId: 'notam-036',
    flightId: 'flight-030',
    routeId: 'route-007',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '서해 공중급유 구역 항로 직접 통과',
  },

  // ── 대한항공 (KE) ──
  // flight-031 (KE901, ICN→NRT, route-001)
  {
    id: 'fi-028',
    notamId: 'notam-001',
    flightId: 'flight-031',
    routeId: 'route-001',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'RKSI RWY 15L/33R 폐쇄로 출발 지연 가능',
  },
  {
    id: 'fi-029',
    notamId: 'notam-002',
    flightId: 'flight-031',
    routeId: 'route-001',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'RKSI ILS 33L 정비 시간대 출발',
  },
  {
    id: 'fi-030',
    notamId: 'notam-015',
    flightId: 'flight-031',
    routeId: 'route-001',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'FUK 레이더 고장으로 항로 지연',
  },
  // flight-032 (KE651, ICN→BKK, route-005)
  {
    id: 'fi-031',
    notamId: 'notam-016',
    flightId: 'flight-032',
    routeId: 'route-005',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'BKK RWY 야간 폐쇄 도착 시간 영향',
  },
  {
    id: 'fi-032',
    notamId: 'notam-017',
    flightId: 'flight-032',
    routeId: 'route-005',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '태국 R-401 제한 구역 통과',
  },
  {
    id: 'fi-033',
    notamId: 'notam-036',
    flightId: 'flight-032',
    routeId: 'route-005',
    temporalOverlap: false,
    spatialOverlap: true,
    impactSummary: '서해 공중급유 구역 (시간 미중첩)',
  },
  {
    id: 'fi-034',
    notamId: 'notam-047',
    flightId: 'flight-032',
    routeId: 'route-005',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'BKK ILS CAT III 사용 불가',
  },
  // flight-033 (KE1201, GMP→CJU, route-010)
  {
    id: 'fi-035',
    notamId: 'notam-005',
    flightId: 'flight-033',
    routeId: 'route-010',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '제주 VOR/DME 사용 불가',
  },
  {
    id: 'fi-036',
    notamId: 'notam-008',
    flightId: 'flight-033',
    routeId: 'route-010',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '김포 ALS/PAPI RWY 14L 사용 불가',
  },
  // flight-034 (KE631, ICN→HAN, route-007)
  {
    id: 'fi-037',
    notamId: 'notam-019',
    flightId: 'flight-034',
    routeId: 'route-007',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '하노이 접근 레이더 사용 불가',
  },

  // ── 아시아나항공 (OZ) ──
  // flight-035 (OZ101, ICN→NRT, route-001)
  {
    id: 'fi-038',
    notamId: 'notam-001',
    flightId: 'flight-035',
    routeId: 'route-001',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'RKSI RWY 15L/33R 폐쇄 영향',
  },
  {
    id: 'fi-039',
    notamId: 'notam-015',
    flightId: 'flight-035',
    routeId: 'route-001',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'FUK 레이더 고장으로 항로 지연',
  },
  // flight-036 (OZ741, ICN→MNL, route-011)
  {
    id: 'fi-040',
    notamId: 'notam-001',
    flightId: 'flight-036',
    routeId: 'route-011',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'RKSI RWY 폐쇄 영향',
  },
  // flight-037 (OZ8901, ICN→CJU, route-008)
  {
    id: 'fi-041',
    notamId: 'notam-005',
    flightId: 'flight-037',
    routeId: 'route-008',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '제주 VOR/DME 사용 불가',
  },

  // ── 티웨이항공 (TW) ──
  // flight-038 (TW901, ICN→KIX, route-003)
  {
    id: 'fi-042',
    notamId: 'notam-001',
    flightId: 'flight-038',
    routeId: 'route-003',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'RKSI RWY 폐쇄로 출발 지연',
  },
  {
    id: 'fi-043',
    notamId: 'notam-012',
    flightId: 'flight-038',
    routeId: 'route-003',
    temporalOverlap: false,
    spatialOverlap: true,
    impactSummary: 'VIP 제한 구역 인접 (시간 미중첩)',
  },
  // flight-039 (TW711, ICN→CJU, route-008)
  {
    id: 'fi-044',
    notamId: 'notam-005',
    flightId: 'flight-039',
    routeId: 'route-008',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '제주 VOR/DME 사용 불가',
  },
  // flight-040 (TW301, ICN→BKK, route-005)
  {
    id: 'fi-045',
    notamId: 'notam-016',
    flightId: 'flight-040',
    routeId: 'route-005',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'BKK RWY 야간 폐쇄 영향',
  },
  {
    id: 'fi-046',
    notamId: 'notam-017',
    flightId: 'flight-040',
    routeId: 'route-005',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '태국 R-401 제한 구역',
  },
  {
    id: 'fi-047',
    notamId: 'notam-047',
    flightId: 'flight-040',
    routeId: 'route-005',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'BKK ILS CAT III 사용 불가',
  },

  // ── 진에어 (LJ) ──
  // flight-041 (LJ201, ICN→NRT, route-001)
  {
    id: 'fi-048',
    notamId: 'notam-001',
    flightId: 'flight-041',
    routeId: 'route-001',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'RKSI RWY 폐쇄 영향',
  },
  {
    id: 'fi-049',
    notamId: 'notam-015',
    flightId: 'flight-041',
    routeId: 'route-001',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'FUK 레이더 고장으로 항로 지연',
  },
  // flight-043 (LJ511, ICN→CJU, route-008)
  {
    id: 'fi-050',
    notamId: 'notam-005',
    flightId: 'flight-043',
    routeId: 'route-008',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: '제주 VOR/DME 사용 불가',
  },

  // ── 에어부산 (BX) ──
  // flight-044 (BX8741, PUS→CJU, route-009)
  {
    id: 'fi-051',
    notamId: 'notam-004',
    flightId: 'flight-044',
    routeId: 'route-009',
    temporalOverlap: false,
    spatialOverlap: true,
    impactSummary: '군사 훈련 구역 통과 (시간 미중첩)',
  },
  // flight-045 (BX371, PUS→NRT, route-001)
  {
    id: 'fi-052',
    notamId: 'notam-015',
    flightId: 'flight-045',
    routeId: 'route-001',
    temporalOverlap: true,
    spatialOverlap: true,
    impactSummary: 'FUK 레이더 고장으로 항로 지연',
  },
];
