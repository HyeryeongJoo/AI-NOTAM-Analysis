/**
 * 운항편 브리핑 생성 액션 컴포넌트
 *
 * BriefingType을 선택하고 브리핑 생성을 트리거한다.
 * 생성 완료 후 미리보기와 다운로드 기능을 제공한다.
 *
 * @requirements FR-007, FR-008
 */

'use client';

import { useCallback, useState } from 'react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Header from '@cloudscape-design/components/header';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import { useNotification } from '@/contexts/NotificationContext';
import { useApiMutation } from '@/hooks/useApiMutation';
import { useGenerateBriefing } from '@/hooks/useGenerateBriefing';
import type { Briefing, BriefingType } from '@/types/briefing';
import type { SelectProps } from '@cloudscape-design/components/select';

interface FlightBriefingActionsProps {
  flightId: string;
  onBriefingGenerated: (briefing: Briefing) => void;
}

const BRIEFING_TYPE_OPTIONS: SelectProps.Option[] = [
  { label: '운항관리사 요약', value: 'dispatcher-summary' },
  { label: 'Company NOTAM', value: 'company-notam' },
  { label: 'DISP COMMENT', value: 'disp-comment' },
  { label: '승무원 브리핑', value: 'crew-briefing' },
];

/** 브리핑 유형별 파일명 */
const BRIEFING_FILENAME: Record<BriefingType, string> = {
  'dispatcher-summary': '운항관리사_요약',
  'company-notam': 'Company_NOTAM',
  'disp-comment': 'DISP_COMMENT',
  'crew-briefing': '승무원_브리핑',
};

/**
 * 마크다운 텍스트를 간단한 HTML로 변환한다
 *
 * @param md - 마크다운 문자열
 * @returns HTML 문자열
 */
function simpleMarkdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h4 style="margin:12px 0 4px">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="margin:16px 0 8px">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="margin:20px 0 8px">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul style="margin:4px 0;padding-left:20px">$&</ul>')
    .replace(/^---$/gm, '<hr style="margin:12px 0;border:none;border-top:1px solid #e9ebed"/>')
    .replace(/\n\n/g, '<br/>')
    .replace(/⚠️/g, '&#9888;&#65039;')
    .replace(/🚨/g, '&#128680;')
    .replace(/📋/g, '&#128203;');
}

/**
 * 브리핑 생성 액션을 렌더링한다
 *
 * @param props - 운항편 ID와 생성 완료 콜백
 * @param props.flightId - 대상 운항편 ID
 * @param props.onBriefingGenerated - 브리핑 생성 완료 콜백
 * @returns 브리핑 생성 컨테이너
 */
export default function FlightBriefingActions({ flightId, onBriefingGenerated }: FlightBriefingActionsProps) {
  const [selectedType, setSelectedType] = useState<SelectProps.Option | null>(null);
  const [generatedBriefing, setGeneratedBriefing] = useState<Briefing | null>(null);
  const { trigger, isMutating } = useGenerateBriefing();
  const { addNotification } = useNotification();
  const { execute: generateCrewPackage, loading: crewLoading } = useApiMutation<{ flightId: string }, Briefing>(
    '/api/briefings/generate-crew',
    'POST',
  );

  /**
   * 브리핑 파일을 다운로드한다
   */
  const handleDownload = useCallback(() => {
    if (!generatedBriefing) return;
    const typeName = BRIEFING_FILENAME[generatedBriefing.type] ?? generatedBriefing.type;
    const filename = `${typeName}_${flightId}_${new Date().toISOString().slice(0, 10)}.md`;
    const blob = new Blob([generatedBriefing.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedBriefing, flightId]);

  /**
   * 브리핑 생성을 처리한다
   */
  async function handleGenerate() {
    if (!selectedType?.value) return;
    try {
      const briefing = await trigger({
        flightId,
        type: selectedType.value as BriefingType,
      });
      setGeneratedBriefing(briefing);
      onBriefingGenerated(briefing);
      addNotification({
        type: 'success',
        content: '브리핑이 성공적으로 생성되었습니다.',
      });
    } catch {
      addNotification({
        type: 'error',
        content: '브리핑 생성에 실패했습니다.',
      });
    }
  }

  /**
   * 전체 승무원 패키지 생성을 처리한다
   */
  async function handleCrewPackage() {
    try {
      const briefing = await generateCrewPackage({ flightId });
      setGeneratedBriefing(briefing);
      onBriefingGenerated(briefing);
      addNotification({
        type: 'success',
        content: '승무원 패키지가 성공적으로 생성되었습니다.',
      });
    } catch {
      addNotification({
        type: 'error',
        content: '승무원 패키지 생성에 실패했습니다.',
      });
    }
  }

  return (
    <Container header={<Header variant="h2">브리핑 생성</Header>}>
      <SpaceBetween size="l">
        <SpaceBetween size="s" direction="horizontal">
          <Select
            selectedOption={selectedType}
            onChange={({ detail }) => setSelectedType(detail.selectedOption)}
            options={BRIEFING_TYPE_OPTIONS}
            placeholder="브리핑 유형 선택"
            selectedAriaLabel="선택됨"
          />
          <Button
            variant="primary"
            loading={isMutating}
            disabled={!selectedType}
            onClick={handleGenerate}
          >
            브리핑 생성
          </Button>
        </SpaceBetween>
        <Button variant="normal" loading={crewLoading} onClick={handleCrewPackage}>
          전체 승무원 패키지 생성
        </Button>

        {generatedBriefing && (
          <SpaceBetween size="m">
            <SpaceBetween size="xs" direction="horizontal" alignItems="center">
              <StatusIndicator type="success">생성 완료</StatusIndicator>
              <Box variant="small" color="text-body-secondary">
                {new Date(generatedBriefing.generatedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
              </Box>
              <Button iconName="download" variant="primary" onClick={handleDownload}>
                다운로드
              </Button>
            </SpaceBetween>

            <ExpandableSection
              headerText="브리핑 미리보기"
              defaultExpanded={true}
              variant="footer"
            >
              <Box padding="s">
                <div
                  style={{
                    maxHeight: '500px',
                    overflow: 'auto',
                    fontSize: '14px',
                    lineHeight: '1.6',
                  }}
                  dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(generatedBriefing.content) }}
                />
              </Box>
            </ExpandableSection>
          </SpaceBetween>
        )}
      </SpaceBetween>
    </Container>
  );
}
