/**
 * NOTAM 테이블 컴포넌트
 *
 * PropertyFilter, 정렬, 페이지네이션을 포함한 NOTAM 목록 테이블.
 *
 * @requirements FR-001, FR-002, FR-005, FR-019
 */

'use client';

import { useCollection } from '@cloudscape-design/collection-hooks';
import Box from '@cloudscape-design/components/box';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Pagination from '@cloudscape-design/components/pagination';
import PropertyFilter from '@cloudscape-design/components/property-filter';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import AirportLabel from '@/components/common/AirportLabel';
import ImportanceBadge from '@/components/common/ImportanceBadge';
import ImportanceScoreBar from '@/components/common/ImportanceScoreBar';
import NotamExpiryIndicator from '@/components/common/NotamExpiryIndicator';
import type { Notam, NotamStats } from '@/types/notam';

interface NotamTableProps {
  notams: Notam[];
  totalCount: number;
  stats?: NotamStats;
  isLoading: boolean;
}

/**
 * NOTAM 식별자를 ICAO 형식으로 포맷한다 (예: RKRR A1234/2026)
 *
 * @param notam - NOTAM 객체
 * @returns ICAO 형식 NOTAM 식별자
 */
function formatNotamCode(notam: Notam): string {
  return `${notam.fir} ${notam.series}${notam.number}/${String(notam.year).slice(-2)}`;
}

/**
 * 날짜 포맷 (한국 표준시)
 * @param iso
 */
function formatDate(iso: string): string {
  if (!iso || iso === 'PERM') return iso;
  try {
    return new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  } catch {
    return iso;
  }
}

/**
 * NOTAM 테이블을 렌더링한다
 *
 * @param props - 테이블 데이터와 이벤트 핸들러
 * @param props.notams - NOTAM 배열
 * @param props.totalCount - 전체 NOTAM 수
 * @param props.stats - NOTAM 통계 (선택적)
 * @param props.isLoading - 로딩 상태
 * @returns Table 컴포넌트
 */
export default function NotamTable({ notams, totalCount, stats, isLoading }: NotamTableProps) {
  const { items, collectionProps, propertyFilterProps, paginationProps } = useCollection(notams, {
    propertyFiltering: {
      filteringProperties: [
        {
          key: 'importanceLevel',
          operators: ['=', '!='],
          propertyLabel: '중요도',
          groupValuesLabel: '중요도 값',
        },
        {
          key: 'status',
          operators: ['=', '!='],
          propertyLabel: '상태',
          groupValuesLabel: '상태 값',
        },
        {
          key: 'locationIndicator',
          operators: ['=', ':'],
          propertyLabel: '공항',
          groupValuesLabel: '공항 코드',
        },
        {
          key: 'qCode',
          operators: ['=', ':'],
          propertyLabel: 'Q-Code',
          groupValuesLabel: 'Q-Code 값',
        },
        { key: 'fir', operators: ['='], propertyLabel: 'FIR', groupValuesLabel: 'FIR 값' },
        { key: 'type', operators: ['='], propertyLabel: '유형', groupValuesLabel: 'NOTAM 유형' },
      ],
      empty: (
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>NOTAM이 없습니다</b>
          <Box variant="p">필터 조건을 변경해 보세요.</Box>
        </Box>
      ),
      noMatch: (
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>일치하는 NOTAM이 없습니다</b>
          <Box variant="p">필터 조건을 변경해 보세요.</Box>
        </Box>
      ),
    },
    sorting: {},
    pagination: { pageSize: 20 },
  });

  const statsDescription = stats
    ? `위험 ${stats.bySeverity.critical} | 높음 ${stats.bySeverity.high} | 보통 ${stats.bySeverity.medium} | 낮음 ${stats.bySeverity.low} | 참고 ${stats.bySeverity.routine} | 만료임박 ${stats.expiringSoon}`
    : undefined;

  return (
    <Table
      {...collectionProps}
      items={items}
      loading={isLoading}
      loadingText="NOTAM을 불러오는 중..."
      trackBy="id"
      enableKeyboardNavigation={true}
      stickyHeader={true}
      variant="full-page"
      header={
        <Header
          variant="awsui-h1-sticky"
          counter={`(${totalCount})`}
          description={statsDescription}
        >
          NOTAM 목록
        </Header>
      }
      filter={
        <PropertyFilter
          {...propertyFilterProps}
          i18nStrings={{
            filteringAriaLabel: 'NOTAM 필터',
            filteringPlaceholder: 'NOTAM 검색',
            groupValuesText: '값',
            groupPropertiesText: '속성',
            operatorsText: '연산자',
            operationAndText: '그리고',
            operationOrText: '또는',
            clearFiltersText: '필터 초기화',
            applyActionText: '적용',
            cancelActionText: '취소',
            enteredTextLabel: (text: string) => `사용: "${text}"`,
            removeTokenButtonAriaLabel: () => '토큰 제거',
          }}
        />
      }
      pagination={<Pagination {...paginationProps} />}
      columnDefinitions={[
        {
          id: 'notamId',
          header: 'NOTAM',
          cell: (item) => <Link href={`/notams/${item.id}`}>{formatNotamCode(item)}</Link>,
          sortingField: 'number',
          width: 160,
          isRowHeader: true,
        },
        {
          id: 'locationIndicator',
          header: '공항',
          cell: (item) => <AirportLabel icaoCode={item.locationIndicator} />,
          sortingField: 'locationIndicator',
          width: 80,
        },
        {
          id: 'qCode',
          header: 'Q-Code',
          cell: (item) => item.qCode,
          sortingField: 'qCode',
          width: 100,
        },
        {
          id: 'importanceScore',
          header: '점수',
          cell: (item) => <ImportanceScoreBar score={item.importanceScore} showLabel={false} />,
          sortingField: 'importanceScore',
          width: 80,
        },
        {
          id: 'importanceLevel',
          header: '중요도',
          cell: (item) => <ImportanceBadge level={item.importanceLevel} />,
          sortingField: 'importanceLevel',
          width: 90,
        },
        {
          id: 'body',
          header: '내용',
          cell: (item) =>
            item.body.length > 100 ? `${item.body.substring(0, 100)}...` : item.body,
          width: 300,
        },
        {
          id: 'type',
          header: '유형',
          cell: (item) => item.type,
          width: 90,
        },
        {
          id: 'effectiveFrom',
          header: '시작일시',
          cell: (item) => formatDate(item.effectiveFrom),
          sortingField: 'effectiveFrom',
          width: 140,
        },
        {
          id: 'effectiveTo',
          header: '종료일시',
          cell: (item) => (
            <NotamExpiryIndicator effectiveTo={item.effectiveTo} status={item.status} />
          ),
          sortingField: 'effectiveTo',
          width: 140,
        },
        {
          id: 'status',
          header: '상태',
          cell: (item) => {
            const statusMap: Record<
              string,
              'success' | 'info' | 'stopped' | 'error' | 'pending' | 'warning'
            > = {
              new: 'pending',
              active: 'success',
              analyzed: 'info',
              'ref-book-registered': 'info',
              expired: 'stopped',
              cancelled: 'error',
              replaced: 'warning',
            };
            return (
              <StatusIndicator type={statusMap[item.status] ?? 'pending'}>
                {item.status}
              </StatusIndicator>
            );
          },
          width: 100,
        },
      ]}
      empty={
        <Box textAlign="center" padding={{ bottom: 's' }}>
          <b>NOTAM이 없습니다</b>
          <Box variant="p">필터 조건을 변경해 보세요.</Box>
        </Box>
      }
    />
  );
}
