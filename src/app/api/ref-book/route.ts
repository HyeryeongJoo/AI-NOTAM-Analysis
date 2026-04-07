/**
 * REF BOOK 목록/생성 API
 *
 * @requirements FR-011
 */

import { NextResponse } from 'next/server';
import * as auditLogRepo from '@/lib/db/auditLog.repository';
import * as notamRepo from '@/lib/db/notam.repository';
import * as refBookRepo from '@/lib/db/refBook.repository';
import { createRefBookEntrySchema } from '@/lib/validation/refBook.validation';
import type { NextRequest } from 'next/server';

/**
 * REF BOOK 목록을 조회한다.
 *
 * @param request - HTTP 요청
 * @returns 페이지네이션된 REF BOOK 목록
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const status = sp.get('status') as 'active' | 'expired' | 'superseded' | undefined;
  const sortBy = sp.get('sortBy') ?? undefined;
  const order = sp.get('order') ?? undefined;
  const page = parseInt(sp.get('page') ?? '1', 10);
  const pageSize = parseInt(sp.get('pageSize') ?? '20', 10);

  const result = refBookRepo.findAll({
    status: status || undefined,
    sortBy,
    order,
    page,
    pageSize,
  });
  const enrichedItems = result.items.map((entry) => {
    const notam = notamRepo.findById(entry.notamId);
    const notamCode = notam
      ? `${notam.fir} ${notam.series}${notam.number}/${String(notam.year).slice(-2)}`
      : entry.notamId;
    return { ...entry, notamCode };
  });
  return NextResponse.json({ ...result, items: enrichedItems });
}

/**
 * REF BOOK 항목을 생성한다.
 *
 * @param request - HTTP 요청
 * @returns 생성된 항목
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createRefBookEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation Error', message: parsed.error.message, statusCode: 400 },
      { status: 400 },
    );
  }

  // 프로토타입: 기본 운항관리사 사용
  const registeredBy = 'dispatcher-001';

  const entry = refBookRepo.create({
    ...parsed.data,
    registeredBy,
    registeredAt: new Date().toISOString(),
    status: 'active',
  });

  // NOTAM 상태 업데이트
  notamRepo.update(parsed.data.notamId, { status: 'ref-book-registered' });

  // 감사 로그
  auditLogRepo.create({
    userId: registeredBy,
    action: 'register-ref-book',
    targetType: 'refBook',
    targetId: entry.id,
    details: `NOTAM ${parsed.data.notamId} REF BOOK 등재`,
  });

  return NextResponse.json(entry, { status: 201 });
}
