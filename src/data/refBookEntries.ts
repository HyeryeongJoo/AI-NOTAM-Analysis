/**
 * REF BOOK 등재 시드 데이터
 *
 * 운항관리사가 중요 NOTAM을 등재한 기록 8건.
 *
 * @requirements FR-011
 */

import type { RefBookEntry } from '@/types/refBook';

/**
 * 상대 날짜를 생성한다.
 *
 * @param daysOffset - 일 오프셋
 * @returns ISO-8601 문자열
 */
function relDate(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** 시드 REF BOOK 데이터 (8건) */
export const SEED_REF_BOOK_ENTRIES: RefBookEntry[] = [
  {
    id: 'refbook-001',
    notamId: 'notam-001',
    registeredBy: 'dispatcher-001',
    registeredAt: relDate(-1),
    summary: '인천공항 활주로 15L/33R 재포장 공사 폐쇄. 4개 활주로 중 1개 사용 불가로 용량 감소.',
    impactLevel: 'critical',
    affectedAirports: ['RKSI'],
    affectedRoutes: ['route-001', 'route-003', 'route-005', 'route-008'],
    remarks: '피크 시간대 지상 대기 시간 증가 예상. OFP에 추가 연료 반영 필요.',
    status: 'active',
    expiresAt: relDate(3),
  },
  {
    id: 'refbook-002',
    notamId: 'notam-004',
    registeredBy: 'dispatcher-001',
    registeredAt: relDate(0),
    summary: '한국 중부 상공 군사 훈련 임시 제한 구역. FL450까지 30NM 반경.',
    impactLevel: 'critical',
    affectedAirports: ['RKSI', 'RKPK'],
    affectedRoutes: ['route-008', 'route-009'],
    remarks: '해당 시간대 ICN-PUS/CJU 항로 우회 필요. 대체 항로 사전 준비.',
    status: 'active',
    expiresAt: relDate(1),
  },
  {
    id: 'refbook-003',
    notamId: 'notam-005',
    registeredBy: 'dispatcher-001',
    registeredAt: relDate(-1),
    summary: '제주공항 VOR/DME 장비 고장. RNAV 비장착 항공기 접근 제한.',
    impactLevel: 'high',
    affectedAirports: ['RKPC'],
    affectedRoutes: ['route-008', 'route-010'],
    remarks: 'B737-800 RNAV 장비 정상 확인 필수. 백업 항법 절차 준비.',
    status: 'active',
    expiresAt: relDate(4),
  },
  {
    id: 'refbook-004',
    notamId: 'notam-011',
    registeredBy: 'dispatcher-002',
    registeredAt: relDate(-1),
    summary: '나리타공항 활주로 16R/34L 야간 정비 폐쇄.',
    impactLevel: 'critical',
    affectedAirports: ['RJAA'],
    affectedRoutes: ['route-001', 'route-002'],
    remarks: '야간 NRT 도착편 단일 활주로 운영. 지연 시 연료 여유 확인.',
    status: 'active',
    expiresAt: relDate(1),
  },
  {
    id: 'refbook-005',
    notamId: 'notam-016',
    registeredBy: 'dispatcher-002',
    registeredAt: relDate(0),
    summary: '수완나품공항 활주로 19L/01R 야간 정비 폐쇄.',
    impactLevel: 'critical',
    affectedAirports: ['VTBS'],
    affectedRoutes: ['route-005', 'route-006'],
    remarks: 'BKK 야간 도착편 단일 활주로. 다이버트 대비 VTBD 정보 사전 확보.',
    status: 'active',
    expiresAt: relDate(1),
  },
  {
    id: 'refbook-006',
    notamId: 'notam-015',
    registeredBy: 'dispatcher-001',
    registeredAt: relDate(0),
    summary: '후쿠오카 레이더 장비 고장. 절차적 관제 시행.',
    impactLevel: 'high',
    affectedAirports: ['RJFF'],
    affectedRoutes: ['route-001', 'route-003'],
    remarks: 'FUK FIR 통과 시 간격 증대로 지연 예상. 연료 마진 확인.',
    status: 'active',
    expiresAt: relDate(0),
  },
  {
    id: 'refbook-007',
    notamId: 'notam-033',
    registeredBy: 'dispatcher-003',
    registeredAt: relDate(-7),
    summary: '김해공항 활주로 18R/36L FOD 점검 폐쇄. (만료)',
    impactLevel: 'critical',
    affectedAirports: ['RKPK'],
    affectedRoutes: ['route-009'],
    remarks: '점검 완료 후 재개방 확인됨.',
    status: 'expired',
    expiresAt: relDate(-2),
  },
  {
    id: 'refbook-008',
    notamId: 'notam-002',
    registeredBy: 'dispatcher-001',
    registeredAt: relDate(-2),
    summary: '인천공항 활주로 33L ILS 정비 사용 불가. CAT II/III 운항 제한.',
    impactLevel: 'high',
    affectedAirports: ['RKSI'],
    affectedRoutes: ['route-001', 'route-003', 'route-008'],
    remarks: '33R ILS 정상 확인. 저시정 시 33R 우선 배정 요청.',
    status: 'active',
    expiresAt: relDate(2),
  },
];
