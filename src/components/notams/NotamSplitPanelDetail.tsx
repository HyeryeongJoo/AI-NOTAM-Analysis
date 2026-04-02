/**
 * NOTAM SplitPanel 상세 컴포넌트
 *
 * NOTAM 목록에서 선택 시 SplitPanel에 표시되는 요약 정보.
 *
 * @requirements FR-001, FR-002
 */

'use client';

import Box from '@cloudscape-design/components/box';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import Link from '@cloudscape-design/components/link';
import SplitPanel from '@cloudscape-design/components/split-panel';
import ImportanceBadge from '@/components/common/ImportanceBadge';
import ImportanceScoreBar from '@/components/common/ImportanceScoreBar';
import type { Notam } from '@/types/notam';

interface NotamSplitPanelDetailProps {
  notam: Notam | null;
}

/**
 * NOTAM SplitPanel 상세를 렌더링한다
 *
 * @param props - 선택된 NOTAM
 * @param props.notam - NOTAM 객체 또는 null
 * @returns SplitPanel 컴포넌트
 */
export default function NotamSplitPanelDetail({ notam }: NotamSplitPanelDetailProps) {
  if (!notam) {
    return (
      <SplitPanel header="NOTAM 선택" closeBehavior="hide">
        <Box textAlign="center" padding="l">
          테이블에서 NOTAM을 선택하세요.
        </Box>
      </SplitPanel>
    );
  }

  return (
    <SplitPanel header={`${notam.locationIndicator} - ${notam.qCode}`} closeBehavior="hide">
      <KeyValuePairs
        columns={2}
        items={[
          { label: '공항', value: notam.locationIndicator },
          { label: 'Q-Code', value: notam.qCode },
          { label: '중요도 점수', value: <ImportanceScoreBar score={notam.importanceScore} /> },
          { label: '중요도', value: <ImportanceBadge level={notam.importanceLevel} /> },
          { label: '유효 기간', value: `${notam.effectiveFrom} ~ ${notam.effectiveTo}` },
          { label: 'AI 요약', value: notam.aiSummary ?? '분석 대기 중' },
        ]}
      />
      <Box padding={{ top: 'l' }}>
        <Link href={`/notams/${notam.id}`}>전체 상세 보기</Link>
      </Box>
    </SplitPanel>
  );
}
