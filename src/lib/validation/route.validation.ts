/**
 * 항로 요청 검증 스키마
 *
 * @requirements FR-009, FR-010
 */

import { z } from 'zod';

/** 대체 항로 요청 검증 */
export const routeAlternativesSchema = z.object({
  notamId: z.string().uuid(),
});

/** 항로 목록 쿼리 검증 */
export const routeQuerySchema = z.object({
  status: z.enum(['active', 'suspended', 'alternate']).optional(),
  sortBy: z.enum(['routeName', 'departureAirport', 'distance']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});
