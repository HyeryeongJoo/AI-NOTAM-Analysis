/**
 * 운항편 요청 검증 스키마
 *
 * @requirements FR-013
 */

import { z } from 'zod';

/** 운항편 목록 쿼리 검증 */
export const flightQuerySchema = z.object({
  airport: z.string().length(4).optional(),
  route: z.string().optional(),
  date: z.string().optional(),
  impactStatus: z.enum(['affected', 'clear', 'all']).optional(),
  sortBy: z.enum(['flightNumber', 'scheduledDeparture', 'departureAirport', 'notamImpactCount']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});
