/**
 * 항로 상세 페이지
 *
 * 항로 정보, 지도, NOTAM 영향, 대체 항로를 표시한다.
 *
 * @route /routes/[id]
 * @requirements FR-009, FR-010
 */

'use client';

import { useParams } from 'next/navigation';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import RouteAlternatives from '@/components/routes/RouteAlternatives';
import RouteInfo from '@/components/routes/RouteInfo';
import RouteMapVisualization from '@/components/routes/RouteMapVisualization';
import RouteNotamImpacts from '@/components/routes/RouteNotamImpacts';
import { useRoute } from '@/hooks/useRoute';

/**
 * 항로 상세 페이지 컴포넌트
 *
 * @returns 항로 상세 레이아웃
 */
export default function RouteDetailPage() {
  const params = useParams();
  const routeId = params.id as string;
  const { data: route, error, isLoading } = useRoute(routeId);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!route) return <LoadingState />;

  return (
    <ContentLayout header={<Header variant="h1">{`항로 상세 — ${route.routeName}`}</Header>}>
      <SpaceBetween size="l">
        <RouteInfo route={route} />
        <RouteMapVisualization route={route} impacts={route.impacts} activeNotams={route.activeNotams} />
        <RouteNotamImpacts impacts={route.impacts} activeNotams={route.activeNotams} />
        <RouteAlternatives routeId={routeId} activeNotams={route.activeNotams} />
      </SpaceBetween>
    </ContentLayout>
  );
}
