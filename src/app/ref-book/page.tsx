/**
 * REF BOOK 페이지
 *
 * REF BOOK 항목 목록과 등록 모달을 관리한다.
 *
 * @route /ref-book
 * @requirements FR-011
 */

'use client';

import { useState } from 'react';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import RefBookRegistrationModal from '@/components/ref-book/RefBookRegistrationModal';
import RefBookTable from '@/components/ref-book/RefBookTable';
import { useNotification } from '@/contexts/NotificationContext';
import { useApiMutation } from '@/hooks/useApiMutation';
import { useRefBook } from '@/hooks/useRefBook';
import type { CreateRefBookEntryRequest, RefBookEntry } from '@/types/refBook';

/**
 * REF BOOK 페이지 컴포넌트
 *
 * @returns REF BOOK 레이아웃
 */
export default function RefBookPage() {
  const { data, error, isLoading, mutate } = useRefBook();
  const [modalVisible, setModalVisible] = useState(false);
  const { addNotification } = useNotification();
  const { execute: createEntry, loading: creating } = useApiMutation<CreateRefBookEntryRequest, RefBookEntry>(
    '/api/ref-book',
    'POST',
  );

  /**
   * 항목 등록을 처리한다
   *
   * @param entry - 등록할 항목 데이터
   * @returns void
   */
  async function handleSubmit(entry: CreateRefBookEntryRequest) {
    try {
      await createEntry(entry);
      setModalVisible(false);
      mutate();
      addNotification({ type: 'success', content: 'REF BOOK 항목이 등록되었습니다.' });
    } catch {
      addNotification({ type: 'error', content: 'REF BOOK 등록에 실패했습니다.' });
    }
  }

  /**
   * 항목 삭제를 처리한다
   *
   * @param id - 삭제할 항목 ID
   * @returns void
   */
  async function handleDelete(id: string) {
    try {
      await fetch(`/api/ref-book/${id}`, { method: 'DELETE' });
      mutate();
      addNotification({ type: 'success', content: 'REF BOOK 항목이 삭제되었습니다.' });
    } catch {
      addNotification({ type: 'error', content: '삭제에 실패했습니다.' });
    }
  }

  if (isLoading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={() => mutate()} />;

  return (
    <>
      <RefBookTable
        entries={data?.items ?? []}
        totalCount={data?.total ?? 0}
        isLoading={isLoading}
        onRegisterNew={() => setModalVisible(true)}
        onDelete={handleDelete}
      />
      <RefBookRegistrationModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        isSubmitting={creating}
      />
    </>
  );
}
