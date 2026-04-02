/**
 * NOTAM AI 분석 컴포넌트
 *
 * AI 생성 중요도 점수, 요약, 영향 분석을 표시한다.
 *
 * @requirements FR-001, FR-003, FR-015
 */

'use client';

import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Popover from '@cloudscape-design/components/popover';
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
          info={
            <Popover
              header="AI 중요도 분석 안내"
              content={
                <SpaceBetween size="xs">
                  <Box variant="p">
                    Amazon Bedrock Claude가 NOTAM 원문을 분석하여 중요도 점수(0~100점)와 등급을
                    산출합니다.
                  </Box>
                  <Box variant="p">
                    <strong>평가 기준:</strong>
                  </Box>
                  <Box variant="small">
                    • <strong>Q-Code 분류</strong> — NOTAM 유형별 기본 위험도
                    <br />• <strong>시설 영향</strong> — 활주로, 항행장비, 레이더 등 핵심 시설 관련
                    여부
                    <br />• <strong>공간 범위</strong> — 반경, 고도, 항로 인접도
                    <br />• <strong>시간 범위</strong> — 유효 기간, 운항 시간대 중첩 여부
                    <br />• <strong>운항 제한</strong> — 비행 금지, 우회, 대체 절차 필요 여부
                  </Box>
                  <Box variant="p">
                    <strong>등급 기준:</strong>
                  </Box>
                  <Box variant="small">
                    • <strong>80점 이상</strong> — Critical (긴급)
                    <br />• <strong>60~79점</strong> — High (높음)
                    <br />• <strong>40~59점</strong> — Medium (보통)
                    <br />• <strong>40점 미만</strong> — Low / Routine
                  </Box>
                  <Box variant="p">
                    「재분석」 버튼으로 최신 컨텍스트를 반영한 재평가를 요청할 수 있습니다.
                  </Box>
                </SpaceBetween>
              }
              triggerType="custom"
              size="large"
            >
              <Link variant="info">정보</Link>
            </Popover>
          }
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
