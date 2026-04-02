/**
 * 감사 로그 데이터 접근 레이어
 *
 * 인메모리 스토어 기반 Append-only 감사 로그.
 *
 * @requirements FR-017
 */

import { getStore } from './store';
import type { AuditAction, AuditLog, CreateAuditLogRequest } from '@/types/auditLog';

/** 감사 로그 목록 필터 파라미터 */
interface AuditLogQueryParams {
  userId?: string;
  action?: AuditAction;
  targetType?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

/**
 * 필터, 페이지네이션을 적용한 감사 로그 목록을 반환한다.
 *
 * @param params - 필터 조건 및 페이지 정보
 * @returns 페이지네이션된 감사 로그 목록
 */
export function findAll(params: AuditLogQueryParams): { items: AuditLog[]; total: number } {
  const store = getStore();
  let items = [...store.auditLogs];

  if (params.userId) {
    items = items.filter((l) => l.userId === params.userId);
  }
  if (params.action) {
    items = items.filter((l) => l.action === params.action);
  }
  if (params.targetType) {
    items = items.filter((l) => l.targetType === params.targetType);
  }
  if (params.startDate) {
    const start = new Date(params.startDate).getTime();
    items = items.filter((l) => new Date(l.timestamp).getTime() >= start);
  }
  if (params.endDate) {
    const end = new Date(params.endDate).getTime();
    items = items.filter((l) => new Date(l.timestamp).getTime() <= end);
  }

  // 최신 순 정렬
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const total = items.length;
  const start = (params.page - 1) * params.pageSize;
  const paged = items.slice(start, start + params.pageSize);

  return { items: paged, total };
}

/**
 * 감사 로그를 추가한다.
 *
 * @param data - 로그 생성 데이터
 * @returns 생성된 감사 로그
 */
export function create(data: CreateAuditLogRequest): AuditLog {
  const store = getStore();
  const log: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...data,
    timestamp: new Date().toISOString(),
  };
  store.auditLogs.push(log);
  return log;
}
