/**
 * 운항관리사 시드 데이터
 *
 * 프로토타입용 목 운항관리사 3명. 조/중/석 교대 근무.
 *
 * @requirements NFR-001
 */

import type { Dispatcher } from '@/types/auth';

/** 시드 운항관리사 데이터 (3명) */
export const SEED_DISPATCHERS: Dispatcher[] = [
  {
    id: 'dispatcher-001',
    name: '김운항',
    employeeId: 'JJA-D001',
    role: 'senior-dispatcher',
  },
  {
    id: 'dispatcher-002',
    name: '이관제',
    employeeId: 'JJA-D002',
    role: 'dispatcher',
  },
  {
    id: 'dispatcher-003',
    name: '박항로',
    employeeId: 'JJA-D003',
    role: 'dispatcher',
  },
];
