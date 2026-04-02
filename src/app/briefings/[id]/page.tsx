/**
 * 브리핑 상세 페이지
 *
 * 브리핑 정보, 콘텐츠 미리보기, 승인 액션을 표시한다.
 *
 * @route /briefings/[id]
 * @requirements FR-007, FR-008
 */

'use client';

import { useParams } from 'next/navigation';
import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import BriefingApprovalActions from '@/components/briefings/BriefingApprovalActions';
import BriefingContentPreview from '@/components/briefings/BriefingContentPreview';
import BriefingInfo from '@/components/briefings/BriefingInfo';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import { useBriefing } from '@/hooks/useBriefing';

/**
 * 브리핑 상세 페이지 컴포넌트
 *
 * @returns 브리핑 상세 레이아웃
 */
export default function BriefingDetailPage() {
  const params = useParams();
  const briefingId = params.id as string;
  const { data: briefing, error, isLoading } = useBriefing(briefingId);
  const { mutate } = useSWRConfig();

  const handleStatusChange = useCallback(() => {
    mutate(`/api/briefings/${briefingId}`);
  }, [briefingId, mutate]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!briefing) return <LoadingState />;

  return (
    <ContentLayout header={<Header variant="h1">브리핑 상세</Header>}>
      <SpaceBetween size="l">
        <BriefingInfo briefing={briefing} />
        <BriefingContentPreview briefing={briefing} />
        <BriefingApprovalActions briefing={briefing} onStatusChange={handleStatusChange} />
      </SpaceBetween>
    </ContentLayout>
  );
}
