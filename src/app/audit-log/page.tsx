/**
 * 감사 로그 페이지
 *
 * 운항관리사 행위 기록을 표시한다.
 *
 * @route /audit-log
 * @requirements FR-017
 */

'use client';

import AuditLogTable from '@/components/audit-log/AuditLogTable';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import { useAuditLog } from '@/hooks/useAuditLog';

/**
 * 감사 로그 페이지 컴포넌트
 *
 * @returns 감사 로그 레이아웃
 */
export default function AuditLogPage() {
  const { data, error, isLoading } = useAuditLog();

  if (isLoading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <AuditLogTable
      logs={data?.items ?? []}
      totalCount={data?.total ?? 0}
      isLoading={isLoading}
    />
  );
}
