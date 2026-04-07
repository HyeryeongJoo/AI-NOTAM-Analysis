/**
 * NOTAM 목록 페이지
 *
 * 서버에서 데이터를 미리 조회하여 즉시 렌더링한다.
 *
 * @route /notams
 * @requirements FR-001, FR-002, FR-005, FR-019
 */

import NotamListContent from '@/components/notams/NotamListContent';
import * as notamRepo from '@/lib/db/notam.repository';

/**
 * NOTAM 목록 페이지 컴포넌트 (Server Component)
 *
 * @returns NOTAM 목록 레이아웃
 */
export default function NotamListPage() {
  const initialData = notamRepo.findAll({ page: 1, pageSize: 20 });
  return <NotamListContent initialData={initialData} />;
}
