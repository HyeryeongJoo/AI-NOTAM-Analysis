/**
 * 대체 항로 목록 컴포넌트
 *
 * AI가 제안한 대체 항로를 테이블로 표시한다.
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

interface RouteAlternativesProps {
  routeId: string;
  activeNotams: Notam[];
}

/**
 * 대체 항로 목록을 렌더링한다
 *
 * @param props - 항로 ID와 활성 NOTAM
 * @param props.routeId - 대상 항로 ID
 * @param props.activeNotams - 활성 NOTAM 목록
 * @returns 대체 항로 컨테이너
 */
export default function RouteAlternatives({ routeId, activeNotams }: RouteAlternativesProps) {
  const { trigger, isMutating } = useRouteAlternatives(routeId);
  const [alternatives, setAlternatives] = useState<RouteAlternative[]>([]);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);

  const criticalNotams = activeNotams.filter(
    (n) => n.importanceLevel === 'critical' || n.importanceLevel === 'high',
  );

  /**
   * 대체 항로 분석을 실행한다
   *
   * @returns void
   */
  async function handleAnalyze() {
    if (criticalNotams.length === 0) return;
    const highestImpact = criticalNotams.sort((a, b) => b.importanceScore - a.importanceScore)[0];
    try {
      const result = await trigger(highestImpact.id);
      setAlternatives(result.alternatives);
      setReasoning(result.reasoning);
      setAnalyzed(true);
    } catch {
      // 에러 처리
    }
  }

  return (
    <Container
      header={
        <Header
          variant="h2"
          actions={
            criticalNotams.length > 0 && !analyzed ? (
              <Button loading={isMutating} onClick={handleAnalyze}>
                대체 항로 분석
              </Button>
            ) : undefined
          }
        >
          대체 항로
        </Header>
      }
    >
      <SpaceBetween size="l">
        {criticalNotams.length === 0 && (
          <Box>중대한 NOTAM 영향이 없어 대체 항로 분석이 필요하지 않습니다.</Box>
        )}

        {analyzed && alternatives.length === 0 && (
          <Alert type="success">현재 항로를 유지하는 것이 최선입니다.</Alert>
        )}

        {alternatives.length > 0 && (
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
              { id: 'reason', header: '사유', cell: (item) => item.reason },
            ]}
          />
        )}

        {reasoning && <Alert type="info">{reasoning}</Alert>}
      </SpaceBetween>
    </Container>
  );
}
