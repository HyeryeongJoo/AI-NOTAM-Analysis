/**
 * Critical NOTAM 알림 배너 컴포넌트
 *
 * 미확인 critical NOTAM을 Flashbar로 표시한다.
 *
 * @requirements FR-016
 */

'use client';

import { useMemo } from 'react';
import Flashbar from '@cloudscape-design/components/flashbar';
import Link from '@cloudscape-design/components/link';
import { useAlert } from '@/contexts/AlertContext';
import type { FlashbarProps } from '@cloudscape-design/components/flashbar';

/**
 * Critical NOTAM 알림 배너를 렌더링한다
 *
 * @returns Flashbar 또는 null
 */
export default function CriticalAlertBanner() {
  const { getUnacknowledgedAlerts, acknowledgeAlert } = useAlert();
  const unacknowledged = getUnacknowledgedAlerts();

  const items: FlashbarProps.MessageDefinition[] = useMemo(
    () =>
      unacknowledged.map((notam) => ({
        type: 'error' as const,
        header: `[위험] ${notam.locationIndicator} - ${notam.qCode}`,
        content: notam.aiSummary ?? notam.body.substring(0, 100),
        id: notam.id,
        dismissible: true,
        onDismiss: () => acknowledgeAlert(notam.id),
        action: <Link href={`/notams/${notam.id}`}>상세 보기</Link>,
      })),
    [unacknowledged, acknowledgeAlert],
  );

  if (items.length === 0) return null;

  return <Flashbar items={items} stackItems={true} />;
}
