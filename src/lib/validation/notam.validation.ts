/**
 * NOTAM 요청 검증 스키마
 *
 * NOTAM 관련 API 엔드포인트의 입력 검증을 위한 zod 스키마.
 *
 * @requirements FR-001, FR-005
 */

import { z } from 'zod';

/** NOTAM 분석 요청 검증 */
export const analyzeNotamSchema = z.object({
  notamId: z.string().uuid(),
});

/** NOTAM 목록 쿼리 검증 */
export const notamQuerySchema = z.object({
  importance: z.enum(['critical', 'high', 'medium', 'low', 'routine']).optional(),
  status: z.enum(['new', 'active', 'analyzed', 'ref-book-registered', 'expired', 'cancelled', 'replaced']).optional(),
  airport: z.string().length(4).optional(),
  qCode: z.string().optional(),
  expiryStatus: z.enum(['expiring-soon', 'expired', 'active']).optional(),
  sortBy: z.enum(['importanceScore', 'effectiveFrom', 'effectiveTo', 'locationIndicator', 'createdAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});
