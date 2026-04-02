/**
 * NOTAM AI 분석 컴포넌트
 *
 * AI 생성 중요도 점수, 요약, 영향 분석을 표시한다.
 *
 * @requirements FR-001, FR-003, FR-015
 */

'use client';

import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import ImportanceBadge from '@/components/common/ImportanceBadge';
import ImportanceScoreBar from '@/components/common/ImportanceScoreBar';
import type { Notam } from '@/types/notam';

interface NotamAiAnalysisProps {
  notam: Notam;
  onReanalyze: () => void;
  isAnalyzing: boolean;
}

/**
 * NOTAM AI 분석 결과를 렌더링한다
 *
 * @param props - NOTAM 데이터와 재분석 핸들러
 * @param props.notam - NOTAM 객체
 * @param props.onReanalyze - 재분석 트리거 함수
 * @param props.isAnalyzing - 분석 진행 중 여부
 * @returns AI 분석 컨테이너
 */
export default function NotamAiAnalysis({ notam, onReanalyze, isAnalyzing }: NotamAiAnalysisProps) {
  return (
    <Container
      header={
        <Header
          variant="h2"
          actions={
            <Button onClick={onReanalyze} loading={isAnalyzing} variant="normal">
              재분석
            </Button>
          }
        >
          AI 분석
        </Header>
      }
    >
      <SpaceBetween size="l">
        <SpaceBetween size="s" direction="horizontal">
          <ImportanceScoreBar score={notam.importanceScore} />
          <ImportanceBadge level={notam.importanceLevel} />
        </SpaceBetween>

        <ExpandableSection headerText="AI 한국어 요약" defaultExpanded={true}>
          {notam.aiSummary ? (
            notam.aiSummary
          ) : (
            <StatusIndicator type="pending">분석 대기 중</StatusIndicator>
          )}
        </ExpandableSection>

        <ExpandableSection headerText="영향 분석" defaultExpanded={false}>
          {notam.aiAnalysis ? (
            notam.aiAnalysis
          ) : (
            <StatusIndicator type="pending">분석 대기 중</StatusIndicator>
          )}
        </ExpandableSection>
      </SpaceBetween>
    </Container>
  );
}
