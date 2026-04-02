/**
 * 운항편 정보 컴포넌트
 *
 * KeyValuePairs로 운항편 메타데이터를 표시한다.
 *
 * @requirements FR-013
 */

'use client';

import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import type { Flight } from '@/types/flight';
import type { Route } from '@/types/route';

interface FlightInfoProps {
  flight: Flight & { route: Route };
}

/**
 * 날짜 포맷
 * @param iso
 */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  } catch {
    return iso;
  }
}

/**
 * 운항편 정보를 렌더링한다
 *
 * @param props - 운항편 데이터
 * @param props.flight - Flight & Route 객체
 * @returns KeyValuePairs 컨테이너
 */
export default function FlightInfo({ flight }: FlightInfoProps) {
  const statusMap: Record<string, 'pending' | 'in-progress' | 'success' | 'error' | 'warning'> = {
    scheduled: 'pending',
    dispatched: 'in-progress',
    'in-flight': 'in-progress',
    arrived: 'success',
    cancelled: 'error',
    diverted: 'warning',
  };

  return (
    <Container header={<Header variant="h2">운항편 정보</Header>}>
      <KeyValuePairs
        columns={3}
        items={[
          { label: '편명', value: flight.flightNumber },
          { label: '출발 공항', value: flight.departureAirport },
          { label: '도착 공항', value: flight.arrivalAirport },
          { label: '출발 시간', value: formatDate(flight.scheduledDeparture) },
          { label: '도착 시간', value: formatDate(flight.scheduledArrival) },
          { label: '기종', value: flight.aircraftType },
          {
            label: '상태',
            value: (
              <StatusIndicator type={statusMap[flight.status] ?? 'pending'}>
                {flight.status}
              </StatusIndicator>
            ),
          },
          { label: '항로명', value: flight.route.routeName },
          { label: '비행 거리', value: `${flight.route.distance} NM` },
        ]}
      />
    </Container>
  );
}
