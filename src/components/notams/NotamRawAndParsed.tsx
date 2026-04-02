/**
 * NOTAM 원문 및 파싱 컴포넌트
 *
 * NOTAM 원문과 파싱된 필드를 2열로 비교 표시한다.
 *
 * @requirements FR-002, FR-012
 */

'use client';

import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import type { Notam } from '@/types/notam';

interface NotamRawAndParsedProps {
  notam: Notam;
}

/**
 * NOTAM 원문 및 파싱된 필드를 렌더링한다
 *
 * @param props - NOTAM 데이터
 * @param props.notam - NOTAM 객체
 * @returns 2열 레이아웃
 */
export default function NotamRawAndParsed({ notam }: NotamRawAndParsedProps) {
  return (
    <Container header={<Header variant="h2">NOTAM 원문 및 파싱</Header>}>
      <ColumnLayout columns={2}>
        <Box>
          <Header variant="h3">원문</Header>
          <Box variant="code" padding="s">
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{notam.rawText}</pre>
          </Box>
        </Box>

        <Box>
          <Header variant="h3">파싱된 필드</Header>
          <KeyValuePairs
            columns={1}
            items={[
              { label: 'Q-Code', value: `${notam.qCode} (${notam.qCodeSubject} / ${notam.qCodeCondition})` },
              { label: 'FIR', value: notam.fir },
              { label: '교통 유형', value: notam.trafficType },
              { label: '범위', value: notam.scope },
              { label: '하한 고도', value: notam.lowerLimit },
              { label: '상한 고도', value: notam.upperLimit },
              { label: '좌표', value: `${notam.latitude.toFixed(4)}, ${notam.longitude.toFixed(4)}` },
              { label: '반경', value: `${notam.radius} NM` },
              { label: '스케줄', value: notam.schedule ?? 'N/A' },
            ]}
          />
        </Box>
      </ColumnLayout>
    </Container>
  );
}
