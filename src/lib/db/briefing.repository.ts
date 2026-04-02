/**
 * 브리핑 데이터 접근 레이어
 *
 * 인메모리 스토어 기반 브리핑 CRUD.
 *
 * @requirements FR-007, FR-008, FR-014
 */

import { getStore } from './store';
import type { Briefing, BriefingStatus, BriefingType, UpdateBriefingRequest } from '@/types/briefing';

/** 브리핑 목록 필터 파라미터 */
interface BriefingQueryParams {
  flightId?: string;
  type?: BriefingType;
  status?: BriefingStatus;
  sortBy?: string;
  order?: string;
  page: number;
  pageSize: number;
}

/** 타입 안전한 정렬 필드 접근자 */
const SORTABLE_FIELDS: Record<string, (item: Briefing) => string | number> = {
  generatedAt: (i) => i.generatedAt,
  type: (i) => i.type,
  status: (i) => i.status,
};

/**
 * 필터, 정렬, 페이지네이션을 적용한 브리핑 목록을 반환한다.
 *
 * @param params - 필터 조건 및 페이지 정보
 * @returns 페이지네이션된 브리핑 목록
 */
export function findAll(params: BriefingQueryParams): { items: Briefing[]; total: number } {
  const store = getStore();
  let items = Array.from(store.briefings.values());

  if (params.flightId) {
    items = items.filter((b) => b.flightId === params.flightId);
  }
  if (params.type) {
    items = items.filter((b) => b.type === params.type);
  }
  if (params.status) {
    items = items.filter((b) => b.status === params.status);
  }

  const sortBy = params.sortBy ?? 'generatedAt';
  const accessor = SORTABLE_FIELDS[sortBy];
  if (accessor) {
    const direction = params.order === 'asc' ? 1 : -1;
    items.sort((a, b) => String(accessor(a)).localeCompare(String(accessor(b))) * direction);
  }

  const total = items.length;
  const start = (params.page - 1) * params.pageSize;
  const paged = items.slice(start, start + params.pageSize);

  return { items: paged, total };
}

/**
 * ID로 브리핑을 조회한다.
 *
 * @param id - 브리핑 ID
 * @returns 브리핑 또는 undefined
 */
export function findById(id: string): Briefing | undefined {
  return getStore().briefings.get(id);
}

/**
 * 브리핑을 생성한다.
 *
 * @param data - 브리핑 데이터 (ID 제외)
 * @returns 생성된 브리핑
 */
export function create(data: Omit<Briefing, 'id'>): Briefing {
  const store = getStore();
  const briefing: Briefing = {
    id: `briefing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...data,
  };
  store.briefings.set(briefing.id, briefing);
  return briefing;
}

/**
 * 브리핑을 수정한다.
 *
 * @param id - 브리핑 ID
 * @param data - 업데이트할 필드
 * @returns 수정된 브리핑 또는 undefined
 */
export function update(id: string, data: UpdateBriefingRequest): Briefing | undefined {
  const store = getStore();
  const existing = store.briefings.get(id);
  if (!existing) return undefined;

  const updates: Partial<Briefing> = { ...data };

  // 승인 상태로 변경 시 승인 시각 설정
  if (data.status === 'approved' && data.approvedBy) {
    updates.approvedAt = new Date().toISOString();
  }

  const updated = { ...existing, ...updates };
  store.briefings.set(id, updated);
  return updated;
}
