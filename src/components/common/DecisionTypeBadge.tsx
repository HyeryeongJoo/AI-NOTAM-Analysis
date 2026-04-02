/**
 * 의사결정 유형 배지 컴포넌트
 *
 * DecisionType에 따라 색상 코딩된 Badge를 표시한다.
 *
 * @requirements FR-020
 */

'use client';

import Badge from '@cloudscape-design/components/badge';
import type { DecisionType } from '@/types/decision';

interface DecisionTypeBadgeProps {
  type: DecisionType;
}

/** 의사결정 유형별 배지 색상 매핑 */
const COLOR_MAP: Record<DecisionType, 'red' | 'blue' | 'grey' | 'green'> = {
  'no-action': 'green',
  monitor: 'blue',
  'route-change': 'red',
  'schedule-change': 'red',
  'cancel-flight': 'red',
  divert: 'red',
};

/** 의사결정 유형별 한국어 라벨 매핑 */
const LABEL_MAP: Record<DecisionType, string> = {
  'no-action': '조치 불필요',
  monitor: '모니터링',
  'route-change': '항로 변경',
  'schedule-change': '스케줄 변경',
  'cancel-flight': '운항 취소',
  divert: '회항',
};

/**
 * 의사결정 유형 배지를 렌더링한다
 *
 * @param props - 의사결정 유형
 * @param props.type - DecisionType 값
 * @returns 색상 코딩된 Badge
 */
export default function DecisionTypeBadge({ type }: DecisionTypeBadgeProps) {
  return <Badge color={COLOR_MAP[type]}>{LABEL_MAP[type]}</Badge>;
}
