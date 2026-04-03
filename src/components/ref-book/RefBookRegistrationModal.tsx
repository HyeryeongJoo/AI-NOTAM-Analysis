/**
 * REF BOOK 등록 모달 컴포넌트
 *
 * Modal + Form으로 REF BOOK 항목을 등록한다.
 *
 * @requirements FR-011
 */

'use client';

import { useState } from 'react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Modal from '@cloudscape-design/components/modal';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Textarea from '@cloudscape-design/components/textarea';
import type { ImportanceLevel } from '@/types/notam';
import type { CreateRefBookEntryRequest } from '@/types/refBook';
import type { SelectProps } from '@cloudscape-design/components/select';

interface RefBookRegistrationModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (entry: CreateRefBookEntryRequest) => void;
  prefilledNotamId?: string;
  isSubmitting?: boolean;
}

const IMPACT_LEVEL_OPTIONS: SelectProps.Option[] = [
  { label: '위험', value: 'critical' },
  { label: '높음', value: 'high' },
  { label: '보통', value: 'medium' },
  { label: '낮음', value: 'low' },
  { label: '참고', value: 'routine' },
];

/**
 * REF BOOK 등록 모달을 렌더링한다
 *
 * @param props - 모달 상태와 이벤트
 * @param props.visible - 모달 표시 여부
 * @param props.onDismiss - 닫기 콜백
 * @param props.onSubmit - 제출 콜백
 * @param props.prefilledNotamId - 미리 채울 NOTAM ID
 * @param props.isSubmitting - 제출 진행 중 여부
 * @returns Modal 컴포넌트
 */
export default function RefBookRegistrationModal({
  visible,
  onDismiss,
  onSubmit,
  prefilledNotamId,
  isSubmitting,
}: RefBookRegistrationModalProps) {
  const [notamId, setNotamId] = useState(prefilledNotamId ?? '');
  const [summary, setSummary] = useState('');
  const [impactLevel, setImpactLevel] = useState<SelectProps.Option | null>(null);
  const [affectedAirports, setAffectedAirports] = useState('');
  const [affectedRoutes, setAffectedRoutes] = useState('');
  const [remarks, setRemarks] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  /**
   * 폼 제출을 처리한다
   *
   * @returns void
   */
  function handleSubmit() {
    if (!notamId || !summary || !impactLevel?.value || !affectedAirports || !expiresAt) return;

    onSubmit({
      notamId,
      summary,
      impactLevel: impactLevel.value as ImportanceLevel,
      affectedAirports: affectedAirports.split(',').map((s) => s.trim()),
      affectedRoutes: affectedRoutes ? affectedRoutes.split(',').map((s) => s.trim()) : [],
      remarks,
      expiresAt,
    });
  }

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header="REF BOOK 신규 등록"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              취소
            </Button>
            <Button variant="primary" loading={isSubmitting} onClick={handleSubmit}>
              등록
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <Form>
        <SpaceBetween size="l">
          <FormField label="NOTAM ID" constraintText="필수">
            <Input value={notamId} onChange={({ detail }) => setNotamId(detail.value)} />
          </FormField>

          <FormField label="요약 설명" constraintText="필수">
            <Textarea value={summary} onChange={({ detail }) => setSummary(detail.value)} />
          </FormField>

          <FormField label="영향도" constraintText="필수">
            <Select
              selectedOption={impactLevel}
              onChange={({ detail }) => setImpactLevel(detail.selectedOption)}
              options={IMPACT_LEVEL_OPTIONS}
              placeholder="영향도 선택"
            />
          </FormField>

          <FormField label="영향 공항" constraintText="필수, 쉼표로 구분 (4자리 ICAO 코드)">
            <Input
              value={affectedAirports}
              onChange={({ detail }) => setAffectedAirports(detail.value)}
              placeholder="RKSI, RKSS, RKPC"
            />
          </FormField>

          <FormField label="영향 항로" constraintText="쉼표로 구분">
            <Input
              value={affectedRoutes}
              onChange={({ detail }) => setAffectedRoutes(detail.value)}
              placeholder="Y711, G597"
            />
          </FormField>

          <FormField label="비고">
            <Textarea value={remarks} onChange={({ detail }) => setRemarks(detail.value)} />
          </FormField>

          <FormField label="만료일시" constraintText="필수 (ISO-8601 형식)">
            <Input
              value={expiresAt}
              onChange={({ detail }) => setExpiresAt(detail.value)}
              placeholder="2026-04-15T23:59:00Z"
            />
          </FormField>
        </SpaceBetween>
      </Form>
    </Modal>
  );
}
