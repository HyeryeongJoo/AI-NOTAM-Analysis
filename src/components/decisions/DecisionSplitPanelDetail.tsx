/**
 * 의사결정 상세 SplitPanel 컴포넌트
 *
 * 선택된 의사결정 기록의 전체 TIFRS 분석(T/I/F/R/S),
 * 운항관리사 결정 근거, AI 사전 분석 내용을 표시한다.
 *
 * @requirements FR-020
 */

'use client';

import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import SplitPanel from '@cloudscape-design/components/split-panel';
import DecisionTypeBadge from '@/components/common/DecisionTypeBadge';
import type { DecisionRecord } from '@/types/decision';

interface DecisionSplitPanelDetailProps {
  decision: DecisionRecord | null;
}

/**
 * 키-값 쌍을 렌더링하는 내부 컴포넌트
 *
 * @param props - 라벨과 값
 * @param props.label - 항목 라벨
 * @param props.children - 항목 값
 * @returns 키-값 박스
 */
function ValueWithLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Box variant="awsui-key-label">{label}</Box>
      <div>{children}</div>
    </div>
  );
}

/**
 * 의사결정 상세 정보를 SplitPanel로 렌더링한다
 *
 * @param props - 선택된 의사결정 기록
 * @param props.decision - DecisionRecord 또는 null
 * @returns SplitPanel 컴포넌트
 */
export default function DecisionSplitPanelDetail({ decision }: DecisionSplitPanelDetailProps) {
  if (!decision) {
    return (
      <SplitPanel header="의사결정 상세" hidePreferencesButton={true}>
        <Box textAlign="center" color="text-body-secondary" padding="l">
          테이블에서 의사결정 기록을 선택하면 상세 정보가 표시됩니다.
        </Box>
      </SplitPanel>
    );
  }

  return (
    <SplitPanel
      header={`의사결정 상세 — ${decision.notamId.substring(0, 12)}`}
      hidePreferencesButton={true}
    >
      <SpaceBetween size="l">
        {/* 기본 정보 */}
        <ColumnLayout columns={4} variant="text-grid">
          <ValueWithLabel label="결정 유형">
            <DecisionTypeBadge type={decision.overallDecision} />
          </ValueWithLabel>
          <ValueWithLabel label="기록자">{decision.decidedBy}</ValueWithLabel>
          <ValueWithLabel label="기록 시각">
            {new Date(decision.decidedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
          </ValueWithLabel>
          <ValueWithLabel label="AI 제안">
            <DecisionTypeBadge type={decision.aiSuggestedDecision} />
          </ValueWithLabel>
        </ColumnLayout>

        {/* TIFRS 분석 */}
        <Container header={<Header variant="h3">TIFRS 분석</Header>}>
          <SpaceBetween size="m">
            <ValueWithLabel label="T — Time (시간적 영향)">
              {decision.tifrsTime || '-'}
            </ValueWithLabel>
            <ValueWithLabel label="I — Impact (운영 영향)">
              {decision.tifrsImpact || '-'}
            </ValueWithLabel>
            <ValueWithLabel label="F — Facilities (시설/장비)">
              {decision.tifrsFacilities || '-'}
            </ValueWithLabel>
            <ValueWithLabel label="R — Route (항로)">{decision.tifrsRoute || '-'}</ValueWithLabel>
            <ValueWithLabel label="S — Schedule (스케줄)">
              {decision.tifrsSchedule || '-'}
            </ValueWithLabel>
          </SpaceBetween>
        </Container>

        {/* 결정 근거 */}
        <Container header={<Header variant="h3">운항관리사 결정 근거</Header>}>
          <Box>{decision.rationale || '-'}</Box>
        </Container>

        {/* AI 사전 분석 */}
        <Container header={<Header variant="h3">AI 사전 분석</Header>}>
          <Box>{decision.aiRationale || '-'}</Box>
        </Container>
      </SpaceBetween>
    </SplitPanel>
  );
}
