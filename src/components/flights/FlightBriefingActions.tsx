/**
 * 운항편 브리핑 생성 액션 컴포넌트
 *
 * BriefingType을 선택하고 브리핑 생성을 트리거한다.
 *
 * @requirements FR-007, FR-008
 */

'use client';

import { useState } from 'react';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
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
  const { trigger, isMutating } = useGenerateBriefing();
  const { addNotification } = useNotification();
  const { execute: generateCrewPackage, loading: crewLoading } = useApiMutation<{ flightId: string }, Briefing>(
    '/api/briefings/generate-crew',
    'POST',
  );

  /**
   * 브리핑 생성을 처리한다
   *
   * @returns void
   */
  async function handleGenerate() {
    if (!selectedType?.value) return;
    try {
      const briefing = await trigger({
        flightId,
        type: selectedType.value as BriefingType,
      });
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
   *
   * @returns void
   */
  async function handleCrewPackage() {
    try {
      const briefing = await generateCrewPackage({ flightId });
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
      </SpaceBetween>
    </Container>
  );
}
