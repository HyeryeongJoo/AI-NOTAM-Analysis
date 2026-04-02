/**
 * 운항편 타입 정의
 *
 * 제주항공 운항 스케줄 데이터 구조.
 *
 * @requirements FR-004, FR-013
 */

import type { ImportanceLevel } from './notam';

/** 운항편 상태 */
export type FlightStatus =
  | 'scheduled'
  | 'dispatched'
  | 'in-flight'
  | 'arrived'
  | 'cancelled'
  | 'diverted';

/** 운항편 엔티티 */
export interface Flight {
  id: string;
  /** 7C 접두사 편명 (예: 7C101) */
  flightNumber: string;
  /** ICAO 출발 공항 코드 */
  departureAirport: string;
  /** ICAO 도착 공항 코드 */
  arrivalAirport: string;
  /** ISO-8601 출발 예정 시각 */
  scheduledDeparture: string;
  /** ISO-8601 도착 예정 시각 */
  scheduledArrival: string;
  routeId: string;
  /** 기종 (예: B737-800) */
  aircraftType: string;
  status: FlightStatus;
  notamImpactCount: number;
  notamMaxSeverity: ImportanceLevel;
}
