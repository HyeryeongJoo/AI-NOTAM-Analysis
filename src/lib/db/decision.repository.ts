/**
 * TIFRS 의사결정 데이터 접근 레이어
 *
 * 인메모리 스토어 기반. NOTAM별 의사결정 기록의 CRUD와
 * 필터링/정렬/페이지네이션을 지원한다.
 *
 * @requirements FR-020
 */

import { getStore } from './store';
import type { CreateDecisionRecordRequest, DecisionRecord, DecisionType } from '@/types/decision';

/** 의사결정 목록 쿼리 파라미터 */
interface DecisionQueryParams {
  decisionType?: DecisionType;
  decidedBy?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  order?: string;
  page: number;
  pageSize: number;
}

/** 정렬 가능 필드에 대한 타입 안전한 접근자 */
const SORTABLE_FIELDS: Record<string, (item: DecisionRecord) => string | number> = {
  decidedAt: (i) => i.decidedAt,
  overallDecision: (i) => i.overallDecision,
  notamId: (i) => i.notamId,
};

/**
 * 의사결정 목록을 필터링, 정렬, 페이지네이션하여 조회한다.
 *
 * @param params - 필터 조건 및 페이지 정보
 * @returns 페이지네이션된 의사결정 목록과 전체 건수
 */
export function findAll(params: DecisionQueryParams): { items: DecisionRecord[]; total: number } {
  const store = getStore();
  let items = Array.from(store.decisions.values());

  // 필터링
  if (params.decisionType) {
    items = items.filter((d) => d.overallDecision === params.decisionType);
  }
  if (params.decidedBy) {
    items = items.filter((d) => d.decidedBy === params.decidedBy);
  }
  if (params.startDate) {
    items = items.filter((d) => d.decidedAt >= params.startDate!);
  }
  if (params.endDate) {
    items = items.filter((d) => d.decidedAt <= params.endDate!);
  }

  // 정렬
  const sortBy = params.sortBy ?? 'decidedAt';
  const order = params.order ?? 'desc';
  const accessor = SORTABLE_FIELDS[sortBy];
  if (accessor) {
    items.sort((a, b) => {
      const valA = String(accessor(a));
      const valB = String(accessor(b));
      return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }

  const total = items.length;

  // 페이지네이션
  const start = (params.page - 1) * params.pageSize;
  items = items.slice(start, start + params.pageSize);

  return { items, total };
}

/**
 * ID로 의사결정 기록을 조회한다.
 *
 * @param id - 의사결정 기록 ID
 * @returns 의사결정 기록 또는 undefined
 */
export function findById(id: string): DecisionRecord | undefined {
  return getStore().decisions.get(id);
}

/**
 * NOTAM ID로 의사결정 기록을 조회한다.
 * NOTAM당 하나의 의사결정만 존재.
 *
 * @param notamId - 대상 NOTAM ID
 * @returns 의사결정 기록 또는 undefined
 */
export function findByNotamId(notamId: string): DecisionRecord | undefined {
  const store = getStore();
  for (const decision of store.decisions.values()) {
    if (decision.notamId === notamId) {
      return decision;
    }
  }
  return undefined;
}

/**
 * 새 의사결정 기록을 생성한다.
 *
 * @param data - 운항관리사 입력 + AI 제안 데이터
 * @returns 생성된 의사결정 기록
 */
export function create(
  data: CreateDecisionRecordRequest & {
    decidedBy: string;
    aiSuggestedDecision: DecisionType;
    aiRationale: string;
  },
): DecisionRecord {
  const store = getStore();
  const record: DecisionRecord = {
    id: `decision-${String(store.decisions.size + 1).padStart(3, '0')}`,
    notamId: data.notamId,
    decidedBy: data.decidedBy,
    decidedAt: new Date().toISOString(),
    tifrsTime: data.tifrsTime,
    tifrsImpact: data.tifrsImpact,
    tifrsFacilities: data.tifrsFacilities,
    tifrsRoute: data.tifrsRoute,
    tifrsSchedule: data.tifrsSchedule,
    overallDecision: data.overallDecision,
    rationale: data.rationale,
    aiSuggestedDecision: data.aiSuggestedDecision,
    aiRationale: data.aiRationale,
  };
  store.decisions.set(record.id, record);
  return record;
}

/**
 * 기존 의사결정 기록을 수정한다.
 *
 * @param id - 의사결정 기록 ID
 * @param data - 수정할 필드
 * @returns 수정된 의사결정 기록 또는 undefined
 */
export function update(id: string, data: Partial<DecisionRecord>): DecisionRecord | undefined {
  const store = getStore();
  const existing = store.decisions.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...data };
  store.decisions.set(id, updated);
  return updated;
}
