/**
 * NOTAM 상세 페이지
 *
 * AI 분석, 원문/파싱, 미니맵, 영향 섹션, diff 뷰를 표시한다.
 *
 * @route /notams/[id]
 * @requirements FR-002, FR-003, FR-012, FR-015, FR-018
 */

'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import NotamAiAnalysis from '@/components/notams/NotamAiAnalysis';
import NotamDiffView from '@/components/notams/NotamDiffView';
import NotamImpactSection from '@/components/notams/NotamImpactSection';
import NotamMiniMap from '@/components/notams/NotamMiniMap';
import NotamRawAndParsed from '@/components/notams/NotamRawAndParsed';
import { useNotam } from '@/hooks/useNotam';
import { useNotamAnalysis } from '@/hooks/useNotamAnalysis';
import type { NotamFlightImpact, NotamRouteImpact } from '@/types/impact';
import type { DiffChange, Notam } from '@/types/notam';

/**
 * NOTAM 상세 페이지 컴포넌트
 *
 * @returns NOTAM 상세 레이아웃
 */
export default function NotamDetailPage() {
  const params = useParams();
  const notamId = params.id as string;
  const { data: notam, error, isLoading } = useNotam(notamId);
  const { trigger: analyzeNotam, isMutating } = useNotamAnalysis();

  const [affectedRoutes, setAffectedRoutes] = useState<NotamRouteImpact[]>([]);
  const [affectedFlights, setAffectedFlights] = useState<NotamFlightImpact[]>([]);
  const [diffData, setDiffData] = useState<{ original: Notam; changes: DiffChange[] } | null>(null);

  // 영향 데이터 로드
  useEffect(() => {
    if (!notamId) return;

    fetch(`/api/notams/${notamId}/affected-routes`)
      .then((res) => res.json())
      .then((data) => setAffectedRoutes(data as NotamRouteImpact[]))
      .catch(() => {});

    fetch(`/api/notams/${notamId}/affected-flights`)
      .then((res) => res.json())
      .then((data) => setAffectedFlights(data as NotamFlightImpact[]))
      .catch(() => {});
  }, [notamId]);

  // NOTAMR인 경우 diff 데이터 로드
  useEffect(() => {
    if (!notam || notam.type !== 'NOTAMR' || !notam.replacesNotamId) return;

    fetch(`/api/notams/${notamId}/diff`)
      .then((res) => res.json())
      .then((data) => setDiffData(data as { original: Notam; changes: DiffChange[] }))
      .catch(() => {});
  }, [notam, notamId]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!notam) return <LoadingState />;

  const headerTitle = `NOTAM 상세 — ${notam.locationIndicator} ${notam.series}${notam.number}/${notam.year}`;

  /**
   * 재분석을 실행한다
   *
   * @returns void
   */
  async function handleReanalyze() {
    try {
      await analyzeNotam({ notamId });
    } catch {
      // 에러 처리는 알림으로
    }
  }

  return (
    <ContentLayout header={<Header variant="h1">{headerTitle}</Header>}>
      <SpaceBetween size="l">
        <NotamAiAnalysis notam={notam} onReanalyze={handleReanalyze} isAnalyzing={isMutating} />
        <NotamRawAndParsed notam={notam} />
        <NotamMiniMap
          latitude={notam.latitude}
          longitude={notam.longitude}
          radius={notam.radius}
          locationIndicator={notam.locationIndicator}
        />
        <NotamImpactSection
          notamId={notamId}
          affectedRoutes={affectedRoutes}
          affectedFlights={affectedFlights}
        />
        {diffData && (
          <NotamDiffView
            original={diffData.original}
            replacement={notam}
            changes={diffData.changes}
          />
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}
