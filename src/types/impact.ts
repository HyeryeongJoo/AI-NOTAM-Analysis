/**
 * 영향 분석 타입 정의
 *
 * NOTAM과 항로/운항편 간의 공간적, 시간적 중첩 분석 결과.
 *
 * @requirements FR-003, FR-004, FR-010
 */

/** NOTAM-항로 영향 기록 -- 공간적 중첩 분석 결과 */
export interface NotamRouteImpact {
  id: string;
  notamId: string;
  routeId: string;
  /** 'direct-crossing' | 'within-radius' | 'adjacent' */
  overlapType: string;
  /** 영향받는 구간 (예: 'OLMEN-AKETA') */
  affectedSegment: string;
  /** 영향 구간 거리 (해리) */
  distanceThroughArea: number;
  altitudeConflict: boolean;
}

/** NOTAM-운항편 영향 기록 -- 시공간 중첩 분석 결과 */
export interface NotamFlightImpact {
  id: string;
  notamId: string;
  flightId: string;
  /** API 응답 시 조인된 편명 (예: '7C103') */
  flightNumber?: string;
  routeId: string;
  temporalOverlap: boolean;
  spatialOverlap: boolean;
  impactSummary: string;
}
