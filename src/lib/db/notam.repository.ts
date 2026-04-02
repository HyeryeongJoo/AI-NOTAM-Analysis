/**
 * NOTAM 데이터 접근 레이어
 *
 * 인메모리 스토어 기반 NOTAM CRUD 및 필터링/정렬/페이지네이션.
 * DynamoDB로 교체 시 이 파일만 수정하면 된다.
 *
 * @requirements FR-001, FR-002, FR-005, FR-012, FR-016, FR-018, FR-019
 */

import { getStore } from './store';
import type { ImportanceLevel, Notam, NotamStats, NotamStatus } from '@/types/notam';

/** 24시간 밀리초 상수 */
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/** NOTAM 목록 필터 파라미터 */
interface NotamQueryParams {
  importance?: ImportanceLevel;
  status?: NotamStatus;
  airport?: string;
  qCode?: string;
  expiryStatus?: string;
  sortBy?: string;
  order?: string;
  page: number;
  pageSize: number;
}

/** 타입 안전한 정렬 필드 접근자 */
const SORTABLE_FIELDS: Record<string, (item: Notam) => string | number> = {
  importanceScore: (i) => i.importanceScore,
  effectiveFrom: (i) => i.effectiveFrom,
  effectiveTo: (i) => i.effectiveTo,
  locationIndicator: (i) => i.locationIndicator,
  createdAt: (i) => i.createdAt,
};

/**
 * 필터, 정렬, 페이지네이션을 적용한 NOTAM 목록을 반환한다.
 *
 * @param params - 필터 조건 및 페이지 정보
 * @returns 페이지네이션된 NOTAM 목록과 통계
 */
export function findAll(params: NotamQueryParams): { items: Notam[]; total: number; stats: NotamStats } {
  const store = getStore();
  let items = Array.from(store.notams.values());

  // 필터링
  if (params.importance) {
    items = items.filter((n) => n.importanceLevel === params.importance);
  }
  if (params.status) {
    items = items.filter((n) => n.status === params.status);
  }
  if (params.airport) {
    items = items.filter((n) => n.locationIndicator === params.airport);
  }
  if (params.qCode) {
    items = items.filter((n) => n.qCode === params.qCode);
  }
  if (params.expiryStatus) {
    const now = new Date();
    if (params.expiryStatus === 'expiring-soon') {
      items = items.filter((n) => {
        if (n.effectiveTo === 'PERM') return false;
        const diff = new Date(n.effectiveTo).getTime() - now.getTime();
        return diff > 0 && diff < TWENTY_FOUR_HOURS_MS;
      });
    } else if (params.expiryStatus === 'expired') {
      items = items.filter((n) => n.effectiveTo !== 'PERM' && new Date(n.effectiveTo).getTime() < now.getTime());
    } else if (params.expiryStatus === 'active') {
      items = items.filter((n) => n.effectiveTo === 'PERM' || new Date(n.effectiveTo).getTime() >= now.getTime());
    }
  }

  // 통계 집계 (필터 적용 전 전체 데이터 기반)
  const stats = getStats();

  // 정렬
  const sortBy = params.sortBy ?? 'createdAt';
  const accessor = SORTABLE_FIELDS[sortBy];
  if (accessor) {
    const direction = params.order === 'asc' ? 1 : -1;
    items.sort((a, b) => {
      const aVal = accessor(a);
      const bVal = accessor(b);
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * direction;
      }
      return String(aVal).localeCompare(String(bVal)) * direction;
    });
  }

  const total = items.length;
  const start = (params.page - 1) * params.pageSize;
  const paged = items.slice(start, start + params.pageSize);

  return { items: paged, total, stats };
}

/**
 * ID로 NOTAM을 조회한다.
 *
 * @param id - NOTAM 고유 ID
 * @returns NOTAM 또는 undefined
 */
export function findById(id: string): Notam | undefined {
  return getStore().notams.get(id);
}

/**
 * NOTAM 필드를 업데이트한다.
 *
 * @param id - NOTAM ID
 * @param data - 업데이트할 필드
 * @returns 업데이트된 NOTAM 또는 undefined
 */
export function update(id: string, data: Partial<Notam>): Notam | undefined {
  const store = getStore();
  const existing = store.notams.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...data };
  store.notams.set(id, updated);
  return updated;
}

/**
 * 긴급 알림 대상 NOTAM을 반환한다.
 * critical 중요도 + new/active 상태인 NOTAM.
 *
 * @returns 긴급 NOTAM 배열 (createdAt 내림차순)
 */
export function findAlerts(): Notam[] {
  const store = getStore();
  return Array.from(store.notams.values())
    .filter((n) => (n.importanceLevel === 'critical' || n.importanceLevel === 'high') && (n.status === 'new' || n.status === 'active'))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * 전체 NOTAM 통계를 반환한다.
 *
 * @returns 중요도/상태별 카운트 및 만료 임박 수
 */
export function getStats(): NotamStats {
  const store = getStore();
  const all = Array.from(store.notams.values());
  const now = new Date();

  const bySeverity: Record<ImportanceLevel, number> = { critical: 0, high: 0, medium: 0, low: 0, routine: 0 };
  const byStatus: Record<NotamStatus, number> = {
    new: 0,
    active: 0,
    analyzed: 0,
    'ref-book-registered': 0,
    expired: 0,
    cancelled: 0,
    replaced: 0,
  };
  let expiringSoon = 0;

  for (const n of all) {
    bySeverity[n.importanceLevel]++;
    byStatus[n.status]++;
    if (n.effectiveTo !== 'PERM') {
      const diff = new Date(n.effectiveTo).getTime() - now.getTime();
      if (diff > 0 && diff < TWENTY_FOUR_HOURS_MS) {
        expiringSoon++;
      }
    }
  }

  return { total: all.length, bySeverity, byStatus, expiringSoon };
}

/**
 * 대체 대상 NOTAM을 찾는다 (NOTAMR diff 뷰).
 *
 * @param replacesNotamId - 대체된 원래 NOTAM ID
 * @returns 대체 NOTAM 또는 undefined
 */
export function findByReplacesId(replacesNotamId: string): Notam | undefined {
  const store = getStore();
  return Array.from(store.notams.values()).find((n) => n.replacesNotamId === replacesNotamId);
}
