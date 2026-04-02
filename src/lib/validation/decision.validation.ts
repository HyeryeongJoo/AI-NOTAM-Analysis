/**
 * TIFRS 의사결정 요청 검증 스키마
 *
 * @requirements FR-020
 */

import { z } from 'zod';

/** 의사결정 유형 열거 값 */
const DECISION_TYPES = [
  'no-action',
  'monitor',
  'route-change',
  'schedule-change',
  'cancel-flight',
  'divert',
] as const;

/** 의사결정 기록 생성 요청 검증 */
export const createDecisionRecordSchema = z.object({
  notamId: z.string().min(1),
  tifrsTime: z.string().min(1).max(1000),
  tifrsImpact: z.string().min(1).max(1000),
  tifrsFacilities: z.string().min(1).max(1000),
  tifrsRoute: z.string().min(1).max(1000),
  tifrsSchedule: z.string().min(1).max(1000),
  overallDecision: z.enum(DECISION_TYPES),
  rationale: z.string().min(1).max(2000),
});

/** 의사결정 목록 조회 쿼리 검증 */
export const decisionQuerySchema = z.object({
  decisionType: z.enum(DECISION_TYPES).optional(),
  decidedBy: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['decidedAt', 'overallDecision', 'notamId']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});
