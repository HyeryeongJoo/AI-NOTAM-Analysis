/**
 * 대시보드 요약 카드 컴포넌트
 *
 * 6열 레이아웃으로 핵심 KPI를 표시한다.
 *
 * @requirements FR-006, FR-005
 */

'use client';

import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { DashboardSummary } from '@/types/dashboard';

interface DashboardSummaryCardsProps {
  summary: DashboardSummary;
}

/**
 * 대시보드 요약 카드를 렌더링한다
 *
 * @param props - 대시보드 요약 데이터
 * @param props.summary - DashboardSummary 객체
 * @returns 6열 KPI 카드 레이아웃
 */
export default function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  return (
    <Container header={<Header variant="h2">운항 현황 요약</Header>}>
      <ColumnLayout columns={6} variant="text-grid">
        <SpaceBetween size="xxxs">
          <Box variant="awsui-key-label">활성 NOTAM</Box>
          <Box variant="awsui-value-large">{summary.totalActiveNotams}</Box>
        </SpaceBetween>

        <SpaceBetween size="xxxs">
          <Box variant="awsui-key-label">위험 NOTAM</Box>
          <Box variant="awsui-value-large" color="text-status-error">
            {summary.criticalCount}
          </Box>
        </SpaceBetween>

        <SpaceBetween size="xxxs">
          <Box variant="awsui-key-label">높은 중요도</Box>
          <Box variant="awsui-value-large" color="text-status-warning">
            {summary.highCount}
          </Box>
        </SpaceBetween>

        <SpaceBetween size="xxxs">
          <Box variant="awsui-key-label">영향받는 항로</Box>
          <Box variant="awsui-value-large">{summary.affectedRoutesCount}</Box>
        </SpaceBetween>

        <SpaceBetween size="xxxs">
          <Box variant="awsui-key-label">영향받는 운항편</Box>
          <Box variant="awsui-value-large">{summary.affectedFlightsCount}</Box>
        </SpaceBetween>

        <SpaceBetween size="xxxs">
          <Box variant="awsui-key-label">필터링 비율</Box>
          <Box variant="awsui-value-large">
            {Math.round(summary.filteredVsTotalRatio * 100)}%
          </Box>
        </SpaceBetween>
      </ColumnLayout>
    </Container>
  );
}
