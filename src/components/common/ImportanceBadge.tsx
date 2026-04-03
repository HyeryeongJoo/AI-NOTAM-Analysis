/**
 * 중요도 배지 컴포넌트
 *
 * ImportanceLevel에 따라 색상 코딩된 Badge를 표시한다.
 *
 * @requirements FR-001
 */

'use client';

import Badge from '@cloudscape-design/components/badge';
import type { ImportanceLevel } from '@/types/notam';

interface ImportanceBadgeProps {
  level: ImportanceLevel;
}

/** 중요도별 배지 색상 매핑 */
const COLOR_MAP: Record<ImportanceLevel, 'red' | 'blue' | 'grey'> = {
  critical: 'red',
  high: 'red',
  medium: 'blue',
  low: 'grey',
  routine: 'grey',
};

/** 중요도별 한국어 라벨 매핑 */
const LABEL_MAP: Record<ImportanceLevel, string> = {
  critical: '위험',
  high: '높음',
  medium: '보통',
  low: '낮음',
  routine: '참고',
};

/**
 * 중요도 배지를 렌더링한다
 *
 * @param props - 중요도 레벨
 * @param props.level - ImportanceLevel 값
 * @returns 색상 코딩된 Badge
 */
export default function ImportanceBadge({ level }: ImportanceBadgeProps) {
  return <Badge color={COLOR_MAP[level]}>{LABEL_MAP[level]}</Badge>;
}
