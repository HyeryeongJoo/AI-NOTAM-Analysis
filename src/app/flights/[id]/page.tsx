/**
 * 운항편 상세 페이지
 *
 * 운항편 정보, NOTAM 영향, 항로 지도, 브리핑 생성을 표시한다.
 *
 * @route /flights/[id]
 * @requirements FR-004, FR-009, FR-013
 */

'use client';

import { useParams } from 'next/navigation';
import { useCallback } from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import FlightBriefingActions from '@/components/flights/FlightBriefingActions';
import FlightInfo from '@/components/flights/FlightInfo';
import FlightNotamImpact from '@/components/flights/FlightNotamImpact';
import FlightRouteMap from '@/components/flights/FlightRouteMap';
import RouteDeviationGuidance from '@/components/flights/RouteDeviationGuidance';
import { useFlight } from '@/hooks/useFlight';
import type { Briefing } from '@/types/briefing';

/**
 * 운항편 상세 페이지 컴포넌트
 *
 * @returns 운항편 상세 레이아웃
 */
export default function FlightDetailPage() {
  const params = useParams();
  const flightId = params.id as string;
  const { data: flight, error, isLoading } = useFlight(flightId);

  const handleBriefingGenerated = useCallback((_briefing: Briefing) => {
    // 브리핑 생성 후 추가 동작 (예: 알림)은 FlightBriefingActions에서 처리
  }, []);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!flight) return <LoadingState />;

  return (
    <ContentLayout
      header={<Header variant="h1">{`운항편 상세 — ${flight.flightNumber}`}</Header>}
    >
      <SpaceBetween size="l">
        <FlightInfo flight={flight} />
        <FlightNotamImpact affectedNotams={flight.affectedNotams} />
        <FlightRouteMap
          route={flight.route}
          affectedNotams={flight.affectedNotams}
          alternativeRoute={null}
        />
        <FlightBriefingActions flightId={flightId} onBriefingGenerated={handleBriefingGenerated} />
        <RouteDeviationGuidance routeId={flight.routeId} affectedNotams={flight.affectedNotams} />
      </SpaceBetween>
    </ContentLayout>
  );
}
