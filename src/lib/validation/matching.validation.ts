/**
 * 매칭 요청 검증 스키마
 *
 * @requirements FR-010
 */

import { z } from 'zod';

/** 매칭 계산 요청 검증 */
export const matchingCalculateSchema = z.object({
  notamId: z.string().min(1).optional(),
});
