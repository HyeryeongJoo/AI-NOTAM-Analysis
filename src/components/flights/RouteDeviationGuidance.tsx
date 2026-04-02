/**
 * 항로 우회 안내 컴포넌트
 *
 * Critical/high NOTAM이 있는 경우 대체 항로 분석을 제공한다.
 *
 * @requirements FR-009
 */

'use client';

import { useState } from 'react';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import { useRouteAlternatives } from '@/hooks/useRouteAlternatives';
import type { Notam } from '@/types/notam';
import type { RouteAlternative } from '@/types/route';

interface RouteDeviationGuidanceProps {
  routeId: string;
  affectedNotams: Notam[];
}

/**
 * 항로 우회 안내를 렌더링한다
 *
 * @param props - 항로 ID와 영향 NOTAM
 * @param props.routeId - 분석 대상 항로 ID
 * @param props.affectedNotams - 영향 NOTAM 목록
 * @returns 대체 항로 안내
 */
export default function RouteDeviationGuidance({ routeId, affectedNotams }: RouteDeviationGuidanceProps) {
  const { trigger, isMutating } = useRouteAlternatives(routeId);
  const [alternatives, setAlternatives] = useState<RouteAlternative[]>([]);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);

  const criticalHighNotams = affectedNotams.filter(
    (n) => n.importanceLevel === 'critical' || n.importanceLevel === 'high',
  );

  if (criticalHighNotams.length === 0) {
    return (
      <Container header={<Header variant="h2">항로 우회 안내</Header>}>
        <Box>이 항로에 대한 중대한 NOTAM 영향이 없습니다.</Box>
      </Container>
    );
  }

  /**
   * 대체 항로 분석을 실행한다
   *
   * @returns void
   */
  async function handleAnalyze() {
    const highestImpact = criticalHighNotams.sort(
      (a, b) => b.importanceScore - a.importanceScore,
    )[0];
    try {
      const result = await trigger(highestImpact.id);
      setAlternatives(result.alternatives);
      setReasoning(result.reasoning);
      setAnalyzed(true);
    } catch {
      // 에러는 알림으로 처리
    }
  }

  return (
    <Container header={<Header variant="h2">항로 우회 안내</Header>}>
      <SpaceBetween size="l">
        <Alert type="warning">
          {criticalHighNotams.length}개의 위험/높은 중요도 NOTAM이 이 항로에 영향을 미치고 있습니다.
        </Alert>

        {!analyzed && (
          <Button variant="primary" loading={isMutating} onClick={handleAnalyze}>
            대체 항로 분석
          </Button>
        )}

        {analyzed && alternatives.length === 0 && (
          <Alert type="success">현재 항로를 유지하는 것이 최선입니다.</Alert>
        )}

        {analyzed && alternatives.length > 0 && (
          <>
            <Table
              items={alternatives}
              enableKeyboardNavigation={true}
              columnDefinitions={[
                {
                  id: 'routeName',
                  header: '대체 항로',
                  cell: (item) => item.route.routeName,
                  isRowHeader: true,
                },
                {
                  id: 'distanceDifference',
                  header: '거리 차이',
                  cell: (item) => `${item.distanceDifference > 0 ? '+' : ''}${item.distanceDifference} NM`,
                },
                {
                  id: 'timeDifference',
                  header: '시간 차이',
                  cell: (item) => `${item.timeDifference > 0 ? '+' : ''}${item.timeDifference} min`,
                },
                {
                  id: 'avoidedNotams',
                  header: '회피 NOTAM',
                  cell: (item) => item.avoidedNotams.length,
                },
                {
                  id: 'reason',
                  header: '사유',
                  cell: (item) => item.reason,
                },
              ]}
            />
            {reasoning && <Alert type="info">{reasoning}</Alert>}
          </>
        )}
      </SpaceBetween>
    </Container>
  );
}
