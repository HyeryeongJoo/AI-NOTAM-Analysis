/**
 * 대시보드 페이지
 *
 * 서버에서 데이터를 미리 조회하여 즉시 렌더링한다.
 * 클라이언트에서는 SWR로 30초마다 자동 갱신.
 *
 * @route /
 * @requirements FR-006, FR-005, FR-016
 */

import DashboardContent from '@/components/dashboard/DashboardContent';
import { getDashboardData } from '@/lib/dashboard.service';

/**
 * 대시보드 페이지 컴포넌트 (Server Component)
 *
 * @returns 대시보드 레이아웃
 */
export default function DashboardPage() {
  const initialData = getDashboardData();
  return <DashboardContent initialData={initialData} />;
}
