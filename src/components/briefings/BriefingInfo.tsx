/**
 * 브리핑 정보 컴포넌트
 *
 * KeyValuePairs로 브리핑 메타데이터를 표시한다.
 *
 * @requirements FR-007, FR-008
 */

'use client';

import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import type { Briefing } from '@/types/briefing';

interface BriefingInfoProps {
  briefing: Briefing;
}

/** 브리핑 유형 한국어 매핑 */
const TYPE_LABELS: Record<string, string> = {
  'dispatcher-summary': '운항관리사 요약',
  'company-notam': 'Company NOTAM',
  'disp-comment': 'DISP COMMENT',
  'crew-briefing': '승무원 브리핑',
};

/**
 * 날짜 포맷
 * @param iso
 */
function formatDate(iso: string | null): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  } catch {
    return iso;
  }
}

/**
 * 브리핑 정보를 렌더링한다
 *
 * @param props - 브리핑 데이터
 * @param props.briefing - Briefing 객체
 * @returns KeyValuePairs 컨테이너
 */
export default function BriefingInfo({ briefing }: BriefingInfoProps) {
  const statusMap: Record<string, 'pending' | 'in-progress' | 'success' | 'info'> = {
    draft: 'pending',
    'pending-review': 'in-progress',
    approved: 'success',
    distributed: 'info',
  };

  return (
    <Container header={<Header variant="h2">브리핑 정보</Header>}>
      <KeyValuePairs
        columns={3}
        items={[
          { label: '유형', value: TYPE_LABELS[briefing.type] ?? briefing.type },
          { label: '운항편', value: briefing.flightId },
          { label: '생성일', value: formatDate(briefing.generatedAt) },
          {
            label: '상태',
            value: (
              <StatusIndicator type={statusMap[briefing.status] ?? 'pending'}>
                {briefing.status}
              </StatusIndicator>
            ),
          },
          { label: '승인자', value: briefing.approvedBy ?? '-' },
          { label: '승인일', value: formatDate(briefing.approvedAt) },
          { label: 'NOTAM 수', value: String(briefing.notamIds.length) },
        ]}
      />
    </Container>
  );
}
