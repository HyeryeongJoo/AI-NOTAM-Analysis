/**
 * 로딩 상태 컴포넌트
 *
 * 데이터 로딩 중 Spinner와 텍스트를 중앙 정렬로 표시한다.
 */

'use client';

import Box from '@cloudscape-design/components/box';
import Spinner from '@cloudscape-design/components/spinner';

interface LoadingStateProps {
  text?: string;
}

/**
 * 로딩 상태를 표시한다
 *
 * @param props - 로딩 텍스트
 * @param props.text - 표시할 텍스트 (기본값: '데이터를 불러오는 중...')
 * @returns Spinner와 텍스트
 */
export default function LoadingState({ text = '데이터를 불러오는 중...' }: LoadingStateProps) {
  return (
    <Box textAlign="center" padding={{ vertical: 'xxl' }}>
      <Spinner size="large" />
      <Box variant="p" padding={{ top: 's' }}>
        {text}
      </Box>
    </Box>
  );
}
