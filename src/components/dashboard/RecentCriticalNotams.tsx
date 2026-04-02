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
      header={<Header variant="h2">긴급 NOTAM</Header>}
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
