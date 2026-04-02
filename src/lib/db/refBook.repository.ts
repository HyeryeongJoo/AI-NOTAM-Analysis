/**
 * REF BOOK 데이터 접근 레이어
 *
 * 인메모리 스토어 기반 REF BOOK CRUD.
 *
 * @requirements FR-011
 */

import { getStore } from './store';
import type { RefBookEntry, RefBookStatus, UpdateRefBookEntryRequest } from '@/types/refBook';

/** REF BOOK 목록 필터 파라미터 */
interface RefBookQueryParams {
  status?: RefBookStatus;
  sortBy?: string;
  order?: string;
  page: number;
  pageSize: number;
}

/** 타입 안전한 정렬 필드 접근자 */
const SORTABLE_FIELDS: Record<string, (item: RefBookEntry) => string | number> = {
  registeredAt: (i) => i.registeredAt,
  impactLevel: (i) => i.impactLevel,
  expiresAt: (i) => i.expiresAt,
};

/**
 * 필터, 정렬, 페이지네이션을 적용한 REF BOOK 목록을 반환한다.
 *
 * @param params - 필터 조건 및 페이지 정보
 * @returns 페이지네이션된 REF BOOK 목록
 */
export function findAll(params: RefBookQueryParams): { items: RefBookEntry[]; total: number } {
  const store = getStore();
  let items = Array.from(store.refBookEntries.values());

  if (params.status) {
    items = items.filter((r) => r.status === params.status);
  }

  const sortBy = params.sortBy ?? 'registeredAt';
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

  return { items: paged, total };
}

/**
 * ID로 REF BOOK 항목을 조회한다.
 *
 * @param id - REF BOOK 항목 ID
 * @returns 항목 또는 undefined
 */
export function findById(id: string): RefBookEntry | undefined {
  return getStore().refBookEntries.get(id);
}

/**
 * REF BOOK 항목을 생성한다.
 *
 * @param data - 생성 데이터 (registeredBy 포함)
 * @returns 생성된 항목
 */
export function create(data: Omit<RefBookEntry, 'id'>): RefBookEntry {
  const store = getStore();
  const entry: RefBookEntry = {
    id: `refbook-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...data,
  };
  store.refBookEntries.set(entry.id, entry);
  return entry;
}

/**
 * REF BOOK 항목을 수정한다.
 *
 * @param id - REF BOOK 항목 ID
 * @param data - 업데이트할 필드
 * @returns 수정된 항목 또는 undefined
 */
export function update(id: string, data: UpdateRefBookEntryRequest): RefBookEntry | undefined {
  const store = getStore();
  const existing = store.refBookEntries.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...data };
  store.refBookEntries.set(id, updated);
  return updated;
}

/**
 * REF BOOK 항목을 삭제한다.
 *
 * @param id - REF BOOK 항목 ID
 * @returns 삭제 성공 여부
 */
export function remove(id: string): boolean {
  return getStore().refBookEntries.delete(id);
}
