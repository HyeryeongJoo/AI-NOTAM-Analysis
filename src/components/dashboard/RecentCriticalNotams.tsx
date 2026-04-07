/**
 * 최근 긴급 NOTAM 테이블 컴포넌트
 *
 * 최근 critical/high NOTAM 10개를 Table로 표시한다.
 *
 * @requirements FR-005, FR-016
 */

'use client';

import { useCollection } from '@cloudscape-design/collection-hooks';
import Box from '@cloudscape-design/components/box';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Popover from '@cloudscape-design/components/popover';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import ImportanceBadge from '@/components/common/ImportanceBadge';
import type { Notam } from '@/types/notam';

interface RecentCriticalNotamsProps {
  criticalNotams: Notam[];
}

/**
 * 최근 긴급 NOTAM 목록을 렌더링한다
 *
 * @param props - 긴급 NOTAM 목록
 * @param props.criticalNotams - NOTAM 배열
 * @returns Table 컴포넌트
 */
export default function RecentCriticalNotams({ criticalNotams }: RecentCriticalNotamsProps) {
  const recentItems = criticalNotams.slice(0, 10);

  const { items, collectionProps } = useCollection(recentItems, {
    sorting: {
      defaultState: { sortingColumn: { sortingField: 'createdAt' }, isDescending: true },
    },
  });

  return (
    <Table
      {...collectionProps}
      variant="embedded"
      items={items}
      enableKeyboardNavigation={true}
      header={
        <Header
          variant="h2"
          info={
            <Popover
              header="NOTAM 중요도 등급 기준"
              content={
                <SpaceBetween size="xs">
                  <Box variant="p">
                    Amazon Bedrock Claude AI가 NOTAM 원문을 분석하여 0~100점 중요도 점수를
                    산출합니다. 아래 기준에 따라 등급이 결정됩니다.
                  </Box>
                  <Box variant="small">
                    <strong>평가 항목:</strong>
                    <br />• <strong>Q-Code 분류</strong> — NOTAM 유형별 기본 위험도
                    <br />• <strong>시설 영향</strong> — 활주로, 항행장비(VOR/ILS), 레이더 등 핵심
                    시설
                    <br />• <strong>공간 범위</strong> — 영향 반경, 고도, 항로 인접도
                    <br />• <strong>시간 범위</strong> — 유효 기간, 운항 시간대 중첩 여부
                    <br />• <strong>운항 제한</strong> — 비행 금지, 우회, 대체 절차 필요 여부
                  </Box>
                  <Box variant="small">
                    <strong>등급 기준:</strong>
                    <br />• <strong>80점 이상</strong> — 위험 (Critical): 즉각 조치 필요
                    <br />• <strong>60~79점</strong> — 높음 (High): 운항 영향 주의
                    <br />• <strong>40~59점</strong> — 보통 (Medium): 모니터링 권장
                    <br />• <strong>20~39점</strong> — 낮음 (Low): 참고 사항
                    <br />• <strong>20점 미만</strong> — 참고 (Routine): 일반 정보
                  </Box>
                </SpaceBetween>
              }
              triggerType="custom"
              size="large"
            >
              <Link variant="info">기준 안내</Link>
            </Popover>
          }
        >
          긴급 NOTAM
        </Header>
      }
      columnDefinitions={[
        {
          id: 'locationIndicator',
          header: '공항',
          cell: (item) => <Link href={`/notams/${item.id}`}>{item.locationIndicator}</Link>,
          sortingField: 'locationIndicator',
          isRowHeader: true,
        },
        {
          id: 'qCode',
          header: 'Q-Code',
          cell: (item) => item.qCode,
        },
        {
          id: 'importanceLevel',
          header: '중요도',
          cell: (item) => <ImportanceBadge level={item.importanceLevel} />,
        },
        {
          id: 'body',
          header: '내용',
          cell: (item) => (item.aiSummary ?? item.body).substring(0, 60) + '...',
        },
      ]}
      empty={
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>긴급 NOTAM이 없습니다</b>
        </Box>
      }
    />
  );
}
