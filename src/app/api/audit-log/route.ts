/**
 * 감사 로그 API
 *
 * @requirements FR-017
 */

import { NextResponse } from 'next/server';
import * as auditLogRepo from '@/lib/db/auditLog.repository';
import { auditLogQuerySchema, createAuditLogSchema } from '@/lib/validation/auditLog.validation';
import type { NextRequest } from 'next/server';

/**
 * 감사 로그 목록을 조회한다.
 *
 * @param request - HTTP 요청
 * @returns 페이지네이션된 감사 로그
 */
export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = auditLogQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters', message: parsed.error.message, statusCode: 400 }, { status: 400 });
  }

  const result = auditLogRepo.findAll(parsed.data);
  return NextResponse.json(result);
}

/**
 * 감사 로그를 추가한다.
 *
 * @param request - HTTP 요청
 * @returns 생성된 감사 로그
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createAuditLogSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation Error', message: parsed.error.message, statusCode: 400 }, { status: 400 });
  }

  const log = auditLogRepo.create(parsed.data);
  return NextResponse.json(log, { status: 201 });
}
