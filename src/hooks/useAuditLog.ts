/**
 * 감사 로그 조회 훅
 *
 * SWR 기반으로 감사 로그 목록을 조회한다.
 *
 * @requirements FR-017
 */

'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { AuditLog } from '@/types/auditLog';

interface UseAuditLogParams {
  userId?: string;
  action?: string;
  targetType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

interface AuditLogResponse {
  items: AuditLog[];
  total: number;
}

/**
 * 감사 로그를 조회한다
 *
 * @param params - 필터링, 페이지네이션 파라미터
 * @returns 감사 로그 데이터, 로딩 상태, 에러
 */
export function useAuditLog(params: UseAuditLogParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  const url = `/api/audit-log${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading } = useSWR<AuditLogResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return { data, error, isLoading };
}
