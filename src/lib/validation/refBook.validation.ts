/**
 * REF BOOK 요청 검증 스키마
 *
 * @requirements FR-011
 */

import { z } from 'zod';

/** REF BOOK 생성 요청 검증 */
export const createRefBookEntrySchema = z.object({
  notamId: z.string().min(1),
  summary: z.string().min(1).max(2000),
  impactLevel: z.enum(['critical', 'high', 'medium', 'low', 'routine']),
  affectedAirports: z.array(z.string().length(4)).min(1),
  affectedRoutes: z.array(z.string()).optional().default([]),
  remarks: z.string().max(1000).optional().default(''),
  expiresAt: z.string().datetime(),
});

/** REF BOOK 수정 요청 검증 */
export const updateRefBookEntrySchema = z.object({
  summary: z.string().min(1).max(2000).optional(),
  impactLevel: z.enum(['critical', 'high', 'medium', 'low', 'routine']).optional(),
  affectedAirports: z.array(z.string().length(4)).optional(),
  affectedRoutes: z.array(z.string()).optional(),
  remarks: z.string().max(1000).optional(),
  status: z.enum(['active', 'expired', 'superseded']).optional(),
  expiresAt: z.string().datetime().optional(),
});
