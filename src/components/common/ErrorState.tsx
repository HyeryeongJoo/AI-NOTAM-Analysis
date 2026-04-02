/**
 * 에러 상태 컴포넌트
 *
 * 에러 발생 시 Alert와 선택적 재시도 버튼을 표시한다.
 */

'use client';

import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
}

/**
 * 에러 상태를 표시한다
 *
 * @param props - 에러 객체와 재시도 콜백
 * @param props.error - 에러 객체 또는 메시지
 * @param props.onRetry - 재시도 콜백 (선택적)
 * @returns Alert 컴포넌트
 */
export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const message = typeof error === 'string' ? error : error.message;

  return (
    <Box padding={{ vertical: 'l' }}>
      <Alert
        type="error"
        header="오류가 발생했습니다"
        action={onRetry ? <Button onClick={onRetry}>재시도</Button> : undefined}
      >
        {message}
      </Alert>
    </Box>
  );
}
