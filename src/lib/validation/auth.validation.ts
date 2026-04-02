/**
 * 인증 요청 검증 스키마
 *
 * @requirements NFR-001
 */

import { z } from 'zod';

/** 로그인 요청 검증 */
export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
