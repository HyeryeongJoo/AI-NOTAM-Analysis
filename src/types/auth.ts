/**
 * 인증 타입 정의
 *
 * 프로토타입용 목 인증 운항관리사 엔티티.
 *
 * @requirements NFR-001
 */

/** 운항관리사 (목 인증용) */
export interface Dispatcher {
  id: string;
  name: string;
  employeeId: string;
  role: string;
}
