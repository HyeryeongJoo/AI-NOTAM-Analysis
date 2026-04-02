/**
 * 감사 로그 요청 검증 스키마
 *
 * @requirements FR-017
 */

import { z } from 'zod';

/** 감사 로그 조회 쿼리 검증 */
export const auditLogQuerySchema = z.object({
  userId: z.string().optional(),
  action: z
    .enum([
      'view',
      'analyze',
      'approve',
      'reject',
      'register-ref-book',
      'generate-briefing',
      'acknowledge-alert',
      'record-decision',
    ])
    .optional(),
  targetType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});

/** 감사 로그 생성 요청 검증 */
export const createAuditLogSchema = z.object({
  userId: z.string().min(1),
  action: z.enum([
    'view',
    'analyze',
    'approve',
    'reject',
    'register-ref-book',
    'generate-briefing',
    'acknowledge-alert',
    'record-decision',
  ]),
  targetType: z.string().min(1),
  targetId: z.string().min(1),
  details: z.string().max(2000).optional().default(''),
});
