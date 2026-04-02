/**
 * 인증 로그인 API (프로토타입)
 *
 * 목 인증: 운항관리사 이름으로 로그인, 비밀번호는 비어있지 않으면 통과.
 *
 * @requirements NFR-001
 */

import { NextResponse } from 'next/server';
import { getStore } from '@/lib/db/store';
import { loginSchema } from '@/lib/validation/auth.validation';
import type { NextRequest } from 'next/server';

/**
 * 목 로그인을 수행한다.
 *
 * @param request - HTTP 요청
 * @returns 목 토큰 + 사용자 정보
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation Error', message: parsed.error.message, statusCode: 400 }, { status: 400 });
  }

  const store = getStore();

  // 이름 또는 employeeId로 조회
  const dispatcher = Array.from(store.dispatchers.values()).find(
    (d) => d.name === parsed.data.username || d.employeeId === parsed.data.username,
  );

  if (!dispatcher) {
    return NextResponse.json({ error: 'Unauthorized', message: 'Invalid credentials', statusCode: 401 }, { status: 401 });
  }

  // 목 JWT: base64 인코딩된 JSON
  const payload = { sub: dispatcher.id, name: dispatcher.name, role: dispatcher.role, iat: Date.now() };
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');

  return NextResponse.json({ token, user: dispatcher });
}
