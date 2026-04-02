/**
 * 브리핑 콘텐츠 미리보기 컴포넌트
 *
 * 브리핑 본문을 표시한다.
 *
 * @requirements FR-007, FR-008
 */

'use client';

import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import type { Briefing } from '@/types/briefing';

interface BriefingContentPreviewProps {
  briefing: Briefing;
}

/**
 * 브리핑 콘텐츠 미리보기를 렌더링한다
 *
 * @param props - 브리핑 데이터
 * @param props.briefing - Briefing 객체
 * @returns 콘텐츠 미리보기 컨테이너
 */
export default function BriefingContentPreview({ briefing }: BriefingContentPreviewProps) {
  return (
    <Container header={<Header variant="h2">브리핑 내용</Header>}>
      <Box padding="l">
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{briefing.content}</div>
      </Box>
    </Container>
  );
}
