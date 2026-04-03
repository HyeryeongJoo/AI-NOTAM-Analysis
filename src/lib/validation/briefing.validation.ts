/**
 * 브리핑 요청 검증 스키마
 *
 * @requirements FR-007, FR-008, FR-014
 */

import { z } from 'zod';

/** 브리핑 생성 요청 검증 */
export const generateBriefingSchema = z.object({
  flightId: z.string().min(1),
  type: z.enum(['dispatcher-summary', 'company-notam', 'disp-comment', 'crew-briefing']),
});

/** 승무원 브리핑 생성 요청 검증 */
export const generateCrewBriefingSchema = z.object({
  flightId: z.string().min(1),
});

/** 브리핑 수정 요청 검증 */
export const updateBriefingSchema = z.object({
  content: z.string().min(1).optional(),
  status: z.enum(['draft', 'pending-review', 'approved', 'distributed']).optional(),
  approvedBy: z.string().optional(),
});

/** 교대 인수인계 보고서 요청 검증 */
export const shiftHandoverSchema = z.object({
  shiftStartTime: z.string().datetime(),
  shiftEndTime: z.string().datetime(),
});
