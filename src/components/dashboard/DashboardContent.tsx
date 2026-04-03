/**
 * 대시보드 콘텐츠 클라이언트 컴포넌트
 *
 * 서버에서 받은 초기 데이터로 즉시 렌더링하고, SWR로 30초마다 갱신한다.
 *
 * @requirements FR-006, FR-005, FR-016
 */

'use client';

import { useEffect } from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Grid from '@cloudscape-design/components/grid';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ErrorState from '@/components/common/ErrorState';
import AffectedFlightsSummary from '@/components/dashboard/AffectedFlightsSummary';
import CriticalAlertBanner from '@/components/dashboard/CriticalAlertBanner';
import DashboardSummaryCards from '@/components/dashboard/DashboardSummaryCards';
import RecentCriticalNotams from '@/components/dashboard/RecentCriticalNotams';
import RouteImpactMap from '@/components/dashboard/RouteImpactMap';
import { useAlert } from '@/contexts/AlertContext';
import { useDashboard } from '@/hooks/useDashboard';
import type { DashboardData } from '@/lib/dashboard.service';

interface DashboardContentProps {
  initialData: DashboardData;
}

/**
 * 대시보드 콘텐츠를 렌더링한다
 *
 * @param props - 초기 데이터
 * @param props.initialData - 서버에서 조회한 대시보드 데이터
 * @returns 대시보드 레이아웃
 */
export default function DashboardContent({ initialData }: DashboardContentProps) {
  const { data, error, mutate } = useDashboard(undefined, initialData);
  const { setCriticalAlerts } = useAlert();

  const dashboardData = data ?? initialData;

  /* Critical NOTAM 알림 컨텍스트 동기화 */
  useEffect(() => {
    if (dashboardData.criticalNotams) {
      setCriticalAlerts(dashboardData.criticalNotams);
    }
  }, [dashboardData.criticalNotams, setCriticalAlerts]);

  if (error) return <ErrorState error={error} onRetry={() => mutate()} />;

  return (
    <ContentLayout header={<Header variant="h1">운항 현황 대시보드</Header>}>
      <SpaceBetween size="l">
        <CriticalAlertBanner />
        <DashboardSummaryCards summary={dashboardData.summary} />
        <Grid
          gridDefinition={[
            { colspan: { default: 12, l: 8 } },
            { colspan: { default: 12, l: 4 } },
          ]}
        >
          <RouteImpactMap routeImpacts={dashboardData.routeImpacts} criticalNotams={dashboardData.criticalNotams} />
          <RecentCriticalNotams criticalNotams={dashboardData.criticalNotams} />
        </Grid>
        <AffectedFlightsSummary flights={dashboardData.affectedFlights} />
      </SpaceBetween>
    </ContentLayout>
  );
}
