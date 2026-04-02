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
 * 점수에 따른 ProgressBar 상태를 반환한다
 *
 * @param score - 0.0~1.0 점수
 * @returns ProgressBar status 값
 */
function getStatus(score: number): 'error' | 'in-progress' | 'success' {
  if (score >= 0.8) return 'error';
  if (score >= 0.6) return 'in-progress';
  return 'success';
}

/**
 * 중요도 점수 바를 렌더링한다
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
      status={getStatus(score)}
      additionalInfo={showLabel ? `${percentage}%` : undefined}
    />
  );
}
