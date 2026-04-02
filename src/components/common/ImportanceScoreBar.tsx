/**
 * 중요도 점수 바 컴포넌트
 *
 * 중요도 점수(0.0~1.0)를 ProgressBar로 시각화한다.
 *
 * @requirements FR-001
 */

'use client';

import ProgressBar from '@cloudscape-design/components/progress-bar';

interface ImportanceScoreBarProps {
  score: number;
  showLabel?: boolean;
}

/**
 * 중요도 점수 바를 렌더링한다
 *
 * status를 항상 in-progress로 설정하여 바 형태를 유지한다.
 * 중요도 등급은 별도 ImportanceBadge 컴포넌트가 표시한다.
 *
 * @param props - 점수와 라벨 표시 여부
 * @param props.score - 0.0~1.0 점수
 * @param props.showLabel - 라벨 표시 여부 (기본값 true)
 * @returns ProgressBar 컴포넌트
 */
export default function ImportanceScoreBar({ score, showLabel = true }: ImportanceScoreBarProps) {
  const percentage = Math.round(score * 100);

  return (
    <ProgressBar
      value={percentage}
      status="in-progress"
      label={showLabel ? '중요도 점수' : undefined}
      additionalInfo={showLabel ? `${percentage}점 / 100점` : undefined}
    />
  );
}
