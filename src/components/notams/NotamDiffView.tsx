/**
 * NOTAM 변경 내역 컴포넌트
 *
 * NOTAMR 대체 시 원본과 대체 NOTAM의 차이를 시각화한다.
 *
 * @requirements FR-018
 */

'use client';

import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { DiffChange, Notam } from '@/types/notam';

interface NotamDiffViewProps {
  original: Notam;
  replacement: Notam;
  changes: DiffChange[];
}

/**
 * NOTAM 변경 내역을 렌더링한다
 *
 * @param props - 원본, 대체, 변경 사항
 * @param props.original - 원본 NOTAM
 * @param props.replacement - 대체 NOTAM
 * @param props.changes - 필드별 변경 사항
 * @returns 변경 내역 컨테이너
 */
export default function NotamDiffView({ original, replacement, changes }: NotamDiffViewProps) {
  return (
    <Container header={<Header variant="h2">NOTAM 변경 내역</Header>}>
      <ColumnLayout columns={2}>
        <SpaceBetween size="s">
          <Header variant="h3">원본 NOTAM</Header>
          <Box variant="code" padding="s">
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{original.rawText}</pre>
          </Box>
        </SpaceBetween>

        <SpaceBetween size="s">
          <Header variant="h3">대체 NOTAM</Header>
          <Box variant="code" padding="s">
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{replacement.rawText}</pre>
          </Box>
        </SpaceBetween>
      </ColumnLayout>

      {changes.length > 0 && (
        <Box padding={{ top: 'l' }}>
          <Header variant="h3">변경된 필드</Header>
          <SpaceBetween size="xs">
            {changes.map((change) => (
              <Box key={change.field} padding="xs">
                <Box fontWeight="bold">{change.field}</Box>
                <Box color="text-status-error">- {change.oldValue}</Box>
                <Box color="text-status-success">+ {change.newValue}</Box>
              </Box>
            ))}
          </SpaceBetween>
        </Box>
      )}
    </Container>
  );
}
