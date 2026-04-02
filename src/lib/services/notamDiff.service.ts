/**
 * NOTAM 변경 비교 서비스
 *
 * NOTAMR(대체)의 원본과 대체 NOTAM 간 필드별 차이를 산출.
 *
 * @requirements FR-018
 */

import type { DiffChange, Notam } from '@/types/notam';

/** 비교 대상 필드 목록 */
const DIFF_FIELDS: (keyof Notam)[] = [
  'body',
  'effectiveFrom',
  'effectiveTo',
  'lowerLimit',
  'upperLimit',
  'latitude',
  'longitude',
  'radius',
  'schedule',
  'qCode',
  'locationIndicator',
];

/**
 * 원본 NOTAM과 대체 NOTAM의 필드별 차이를 계산한다.
 *
 * @param original - 원본 NOTAM
 * @param replacement - 대체 NOTAM
 * @returns 변경된 필드 목록
 */
export function calculateDiff(original: Notam, replacement: Notam): DiffChange[] {
  const changes: DiffChange[] = [];

  for (const field of DIFF_FIELDS) {
    const oldValue = String(original[field] ?? '');
    const newValue = String(replacement[field] ?? '');
    if (oldValue !== newValue) {
      changes.push({ field, oldValue, newValue });
    }
  }

  return changes;
}
