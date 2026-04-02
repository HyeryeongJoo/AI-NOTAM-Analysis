/**
 * 공항 타입 정의
 *
 * ICAO/IATA 코드 기반 공항 시설 정보.
 *
 * @requirements FR-003, FR-006
 */

/** 공항 엔티티 -- ICAO/IATA 코드, 시설 정보 포함 */
export interface Airport {
  icaoCode: string;
  iataCode: string;
  name: string;
  /** 한국어 공항명 */
  nameKo: string;
  latitude: number;
  longitude: number;
  runwayCount: number;
  fir: string;
  country: string;
  timezone: string;
}
