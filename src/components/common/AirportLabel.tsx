/**
 * 공항 라벨 컴포넌트
 *
 * ICAO 코드를 볼드체로 표시하고 Popover로 공항명을 보여준다.
 */

'use client';

import Box from '@cloudscape-design/components/box';
import Popover from '@cloudscape-design/components/popover';

interface AirportLabelProps {
  icaoCode: string;
  airportName?: string;
  airportNameKo?: string;
}

/**
 * 공항 ICAO 코드 라벨을 렌더링한다
 *
 * @param props - 공항 코드 및 이름 정보
 * @param props.icaoCode - ICAO 4글자 코드
 * @param props.airportName - 영문 공항명
 * @param props.airportNameKo - 한국어 공항명
 * @returns Popover 포함 공항 라벨
 */
export default function AirportLabel({ icaoCode, airportName, airportNameKo }: AirportLabelProps) {
  if (!airportName && !airportNameKo) {
    return <Box fontWeight="bold">{icaoCode}</Box>;
  }

  const popoverContent = airportNameKo
    ? `${airportNameKo} (${airportName ?? icaoCode})`
    : airportName ?? icaoCode;

  return (
    <Popover content={popoverContent} triggerType="text" size="small">
      <Box fontWeight="bold">{icaoCode}</Box>
    </Popover>
  );
}
