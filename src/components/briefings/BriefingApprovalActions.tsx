/**
 * 브리핑 승인 액션 컴포넌트
 *
 * 브리핑 상태에 따라 승인/반려 버튼 또는 승인 정보를 표시한다.
 *
 * @requirements FR-007
 */

'use client';

import Alert from '@cloudscape-design/components/alert';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { useNotification } from '@/contexts/NotificationContext';
import { useApiMutation } from '@/hooks/useApiMutation';
import type { Briefing, UpdateBriefingRequest } from '@/types/briefing';

interface BriefingApprovalActionsProps {
  briefing: Briefing;
  onStatusChange: () => void;
}

/**
 * 브리핑 승인 액션을 렌더링한다
 *
 * @param props - 브리핑 데이터와 상태 변경 콜백
 * @param props.briefing - Briefing 객체
 * @param props.onStatusChange - 상태 변경 후 콜백
 * @returns 승인 액션 컨테이너
 */
export default function BriefingApprovalActions({ briefing, onStatusChange }: BriefingApprovalActionsProps) {
  const { addNotification } = useNotification();
  const { execute: updateBriefing, loading } = useApiMutation<UpdateBriefingRequest, Briefing>(
    `/api/briefings/${briefing.id}`,
    'PUT',
  );

  /**
   * 승인을 처리한다
   *
   * @returns void
   */
  async function handleApprove() {
    try {
      await updateBriefing({ status: 'approved', approvedBy: '김운항관리사' });
      addNotification({ type: 'success', content: '브리핑이 승인되었습니다.' });
      onStatusChange();
    } catch {
      addNotification({ type: 'error', content: '승인 처리에 실패했습니다.' });
    }
  }

  /**
   * 반려를 처리한다
   *
   * @returns void
   */
  async function handleReject() {
    try {
      await updateBriefing({ status: 'draft' });
      addNotification({ type: 'info', content: '브리핑이 반려되었습니다.' });
      onStatusChange();
    } catch {
      addNotification({ type: 'error', content: '반려 처리에 실패했습니다.' });
    }
  }

  if (briefing.status === 'approved' || briefing.status === 'distributed') {
    return (
      <Container header={<Header variant="h2">승인 상태</Header>}>
        <Alert type="success">
          승인자: {briefing.approvedBy ?? '-'} | 승인일:{' '}
          {briefing.approvedAt
            ? new Date(briefing.approvedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
            : '-'}
        </Alert>
      </Container>
    );
  }

  if (briefing.status === 'draft' || briefing.status === 'pending-review') {
    return (
      <Container header={<Header variant="h2">승인 관리</Header>}>
        <SpaceBetween size="s" direction="horizontal">
          <Button variant="primary" loading={loading} onClick={handleApprove}>
            승인
          </Button>
          <Button variant="normal" loading={loading} onClick={handleReject}>
            반려
          </Button>
        </SpaceBetween>
      </Container>
    );
  }

  return null;
}
