/**
 * Next.js 미들웨어 — 보안 헤더
 *
 * 모든 라우트에 보안 HTTP 헤더를 추가한다.
 * CSP, XSS 보호, CORS 관련 헤더 포함.
 *
 * @requirements NFR-002
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 보안 헤더를 추가하는 미들웨어.
 *
 * @param request - 수신 요청
 * @returns 보안 헤더가 추가된 응답
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.tile.openstreetmap.org; connect-src 'self'; font-src 'self'",
  );

  // CORS: API 라우트에 대해 허용
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}

/** 미들웨어 적용 경로 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
