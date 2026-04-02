/**
 * 대시보드 페이지
 *
 * 항로 영향도 지도, 요약 위젯, 긴급 알림을 표시하는 메인 대시보드.
 *
 * @route /
 * @requirements FR-006, FR-005, FR-016
 */

'use client';

import { useEffect } from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Grid from '@cloudscape-design/components/grid';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import AffectedFlightsSummary from '@/components/dashboard/AffectedFlightsSummary';
import CriticalAlertBanner from '@/components/dashboard/CriticalAlertBanner';
import DashboardSummaryCards from '@/components/dashboard/DashboardSummaryCards';
import RecentCriticalNotams from '@/components/dashboard/RecentCriticalNotams';
import RouteImpactMap from '@/components/dashboard/RouteImpactMap';
import { useAlert } from '@/contexts/AlertContext';
import { useDashboard } from '@/hooks/useDashboard';
import type { Flight } from '@/types/flight';

/**
 * 대시보드 페이지 컴포넌트
 *
 * @returns 대시보드 레이아웃
 */
export default function DashboardPage() {
  const { data, error, isLoading, mutate } = useDashboard();
  const { setCriticalAlerts } = useAlert();

  // Critical NOTAM 알림 컨텍스트 동기화
  useEffect(() => {
    if (data?.criticalNotams) {
      setCriticalAlerts(data.criticalNotams);
    }
  }, [data?.criticalNotams, setCriticalAlerts]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={() => mutate()} />;
  if (!data) return <LoadingState />;

  // routeImpacts에서 관련 flight 정보 추출 (간략 표시)
  const affectedFlights: Flight[] = [];
  // 대시보드 API에서 flights를 직접 제공하지 않으므로 빈 배열 사용
  // 실제로는 routeImpacts를 통해 간접적으로 파악

  return (
    <ContentLayout header={<Header variant="h1">운항 현황 대시보드</Header>}>
      <SpaceBetween size="l">
        <CriticalAlertBanner />
        <DashboardSummaryCards summary={data.summary} />
        <Grid
          gridDefinition={[
            { colspan: { default: 12, l: 8 } },
            { colspan: { default: 12, l: 4 } },
          ]}
        >
          <RouteImpactMap routeImpacts={data.routeImpacts} criticalNotams={data.criticalNotams} />
          <RecentCriticalNotams criticalNotams={data.criticalNotams} />
        </Grid>
        <AffectedFlightsSummary flights={affectedFlights} />
      </SpaceBetween>
    </ContentLayout>
  );
}
