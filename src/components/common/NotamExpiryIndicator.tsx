/**
 * NOTAM 만료 시간 표시 컴포넌트
 *
 * NOTAM 만료까지 남은 시간을 StatusIndicator 색상으로 시각화한다.
 *
 * @requirements FR-019
 */

'use client';

import StatusIndicator from '@cloudscape-design/components/status-indicator';
import type { NotamStatus } from '@/types/notam';

interface NotamExpiryIndicatorProps {
  effectiveTo: string;
  status: NotamStatus;
}

/**
 * NOTAM 만료 상태를 표시한다
 *
 * @param props - 만료 시각과 NOTAM 상태
 * @param props.effectiveTo - 만료 시각 (ISO-8601 또는 'PERM')
 * @param props.status - NOTAM 상태
 * @returns StatusIndicator 컴포넌트
 */
export default function NotamExpiryIndicator({ effectiveTo, status }: NotamExpiryIndicatorProps) {
  if (effectiveTo === 'PERM') {
    return <StatusIndicator type="info">영구 적용</StatusIndicator>;
  }

  if (status === 'expired' || status === 'cancelled') {
    return <StatusIndicator type="stopped">만료됨</StatusIndicator>;
  }

  const now = new Date();
  const expiry = new Date(effectiveTo);
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs <= 0) {
    return <StatusIndicator type="stopped">만료됨</StatusIndicator>;
  }

  const diffHours = diffMs / (1000 * 60 * 60);
  const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);

  if (diffHours < 6) {
    return (
      <StatusIndicator type="error">
        {Math.floor(diffHours)}시간 {diffMinutes}분 남음
      </StatusIndicator>
    );
  }

  if (diffHours < 24) {
    return (
      <StatusIndicator type="warning">{Math.floor(diffHours)}시간 남음</StatusIndicator>
    );
  }

  const diffDays = Math.floor(diffHours / 24);
  return <StatusIndicator type="success">{diffDays}일 남음</StatusIndicator>;
}
