/**
 * 항로 타입 정의
 *
 * NAVBLUE 항로 데이터 기반의 제주항공 운항 항로 구조.
 *
 * @requirements FR-006, FR-009, FR-010
 */

/** 항로 상태 */
export type RouteStatus = 'active' | 'suspended' | 'alternate';

/** 웨이포인트 -- 항로 경유점 */
export interface Waypoint {
  id: string;
  /** 5글자 ICAO 코드 */
  name: string;
  latitude: number;
  longitude: number;
  sequenceOrder: number;
}

/** 항로 엔티티 -- NAVBLUE 항로 데이터 기반 */
export interface Route {
  id: string;
  routeName: string;
  /** ICAO 출발 공항 코드 */
  departureAirport: string;
  /** ICAO 도착 공항 코드 */
  arrivalAirport: string;
  waypoints: Waypoint[];
  airways: string[];
  /** 해리 단위 거리 */
  distance: number;
  /** 예: FL350 */
  flightLevel: string;
  status: RouteStatus;
  alternateRouteIds: string[];
}

/** 대체 항로 제안 -- AI가 생성하는 우회 항로 비교 정보 */
export interface RouteAlternative {
  route: Route;
  reason: string;
  /** 원래 항로 대비 거리 차이 (해리) */
  distanceDifference: number;
  /** 원래 항로 대비 시간 차이 (분) */
  timeDifference: number;
  /** 회피 가능한 NOTAM ID 목록 */
  avoidedNotams: string[];
}
