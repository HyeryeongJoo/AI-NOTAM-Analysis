/**
 * Q-Code 목록 API
 *
 * @requirements FR-002
 */

import { NextResponse } from 'next/server';
import * as qCodeRepo from '@/lib/db/qCode.repository';

/**
 * 전체 Q-Code 목록을 반환한다.
 *
 * @returns Q-Code 배열
 */
export async function GET() {
  const codes = qCodeRepo.findAll();
  return NextResponse.json(codes);
}
