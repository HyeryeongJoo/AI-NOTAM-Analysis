/**
 * 운항편 NOTAM 영향 테이블 컴포넌트
 *
 * 운항편에 영향을 미치는 NOTAM 목록을 표시한다.
 *
 * @requirements FR-004
 */

'use client';

import { useCollection } from '@cloudscape-design/collection-hooks';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Table from '@cloudscape-design/components/table';
import ImportanceBadge from '@/components/common/ImportanceBadge';
import type { Notam } from '@/types/notam';

interface FlightNotamImpactProps {
  affectedNotams: Notam[];
}

/**
 * 날짜 포맷
 * @param iso
 */
function formatDate(iso: string): string {
  if (iso === 'PERM') return '영구 적용';
  try {
    return new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  } catch {
    return iso;
  }
}

/**
 * 운항편 영향 NOTAM 테이블을 렌더링한다
 *
 * @param props - 영향 NOTAM 목록
 * @param props.affectedNotams - NOTAM 배열
 * @returns Table 컨테이너
 */
export default function FlightNotamImpact({ affectedNotams }: FlightNotamImpactProps) {
  const { items, collectionProps } = useCollection(affectedNotams, {
    sorting: {},
  });

  return (
    <Container
      header={<Header variant="h2" counter={`(${affectedNotams.length})`}>영향 NOTAM</Header>}
    >
      <Table
        {...collectionProps}
        items={items}
        enableKeyboardNavigation={true}
        columnDefinitions={[
          {
            id: 'locationIndicator',
            header: '공항',
            cell: (item) => <Link href={`/notams/${item.id}`}>{item.locationIndicator}</Link>,
            isRowHeader: true,
          },
          { id: 'qCode', header: 'Q-Code', cell: (item) => item.qCode },
          {
            id: 'importanceLevel',
            header: '중요도',
            cell: (item) => <ImportanceBadge level={item.importanceLevel} />,
          },
          {
            id: 'body',
            header: '내용',
            cell: (item) => (item.body.length > 80 ? `${item.body.substring(0, 80)}...` : item.body),
          },
          { id: 'effectiveFrom', header: '시작', cell: (item) => formatDate(item.effectiveFrom) },
          { id: 'effectiveTo', header: '종료', cell: (item) => formatDate(item.effectiveTo) },
        ]}
        empty={
          <Box textAlign="center" padding={{ bottom: 's' }}>
            <b>영향 NOTAM이 없습니다</b>
          </Box>
        }
      />
    </Container>
  );
}
