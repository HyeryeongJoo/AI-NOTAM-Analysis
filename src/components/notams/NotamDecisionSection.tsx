/**
 * NOTAM 의사결정 섹션 컴포넌트
 *
 * NOTAM 상세 페이지에 임베딩되어 기존 의사결정 기록 표시와
 * TIFRS 기반 새 의사결정 기록 폼을 제공한다.
 * 마운트 시 AI 사전 분석 결과를 폼에 자동 채운다.
 *
 * @requirements FR-020
 */

'use client';

import { useState } from 'react';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Textarea from '@cloudscape-design/components/textarea';
import DecisionTypeBadge from '@/components/common/DecisionTypeBadge';
import { useNotamDecision } from '@/hooks/useNotamDecision';
import { useRecordDecision } from '@/hooks/useRecordDecision';
import type { CreateDecisionRecordRequest, DecisionType } from '@/types/decision';
import type { Notam } from '@/types/notam';

interface NotamDecisionSectionProps {
  notam: Notam;
}

/** 의사결정 유형 셀렉트 옵션 */
const DECISION_OPTIONS: Array<{ label: string; value: DecisionType }> = [
  { label: '조치 불필요', value: 'no-action' },
  { label: '모니터링', value: 'monitor' },
  { label: '항로 변경', value: 'route-change' },
  { label: '스케줄 변경', value: 'schedule-change' },
  { label: '운항 취소', value: 'cancel-flight' },
  { label: '회항', value: 'divert' },
];

/** 폼 초기 상태 */
const INITIAL_FORM_STATE = {
  overallDecision: null as { label: string; value: string } | null,
  tifrsTime: '',
  tifrsImpact: '',
  tifrsFacilities: '',
  tifrsRoute: '',
  tifrsSchedule: '',
  rationale: '',
  recorder: '',
};

/**
 * NOTAM 의사결정 섹션을 렌더링한다
 *
 * 기존 의사결정이 있으면 결과를 표시하고,
 * 없으면 TIFRS 기록 폼을 표시한다.
 *
 * @param props - NOTAM 데이터
 * @param props.notam - 대상 NOTAM 객체
 * @returns 의사결정 섹션 컨테이너
 */
export default function NotamDecisionSection({ notam }: NotamDecisionSectionProps) {
  const {
    decision,
    isLoading: isLoadingDecision,
    mutate: refreshDecision,
  } = useNotamDecision(notam.id);
  const {
    execute: recordDecision,
    loading: isSubmitting,
    error: submitError,
  } = useRecordDecision(notam.id);

  // NOTAM의 기존 AI 분석이 있으면 Impact 필드를 프리필
  const aiPrefillImpact = notam.aiAnalysis ? `AI 분석: ${notam.aiAnalysis.substring(0, 200)}` : '';
  const [formState, setFormState] = useState({
    ...INITIAL_FORM_STATE,
    tifrsImpact: aiPrefillImpact,
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /**
   * 폼 제출 핸들러
   *
   * @param event - 폼 제출 이벤트
   */
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!formState.overallDecision) return;

    const body: CreateDecisionRecordRequest = {
      notamId: notam.id,
      tifrsTime: formState.tifrsTime,
      tifrsImpact: formState.tifrsImpact,
      tifrsFacilities: formState.tifrsFacilities,
      tifrsRoute: formState.tifrsRoute,
      tifrsSchedule: formState.tifrsSchedule,
      overallDecision: formState.overallDecision.value as DecisionType,
      rationale: formState.rationale,
    };

    try {
      await recordDecision(body);
      setSubmitSuccess(true);
      await refreshDecision();
    } catch {
      // 에러는 useRecordDecision 훅에서 관리
    }
  }

  if (isLoadingDecision) {
    return (
      <Container header={<Header variant="h2">TIFRS 의사결정</Header>}>
        <StatusIndicator type="loading">의사결정 기록을 불러오는 중...</StatusIndicator>
      </Container>
    );
  }

  // 기존 의사결정이 있으면 결과만 표시
  if (decision) {
    return (
      <Container header={<Header variant="h2">TIFRS 의사결정 기록</Header>}>
        <SpaceBetween size="m">
          <ColumnLayout columns={3} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">결정 유형</Box>
              <DecisionTypeBadge type={decision.overallDecision} />
            </div>
            <div>
              <Box variant="awsui-key-label">기록자</Box>
              <div>{decision.decidedBy}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">기록 시각</Box>
              <div>
                {new Date(decision.decidedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
              </div>
            </div>
          </ColumnLayout>

          <SpaceBetween size="s">
            <Box variant="awsui-key-label">TIFRS 분석</Box>
            <ColumnLayout columns={1}>
              <div>
                <Box fontWeight="bold">T — Time:</Box> {decision.tifrsTime || '-'}
              </div>
              <div>
                <Box fontWeight="bold">I — Impact:</Box> {decision.tifrsImpact || '-'}
              </div>
              <div>
                <Box fontWeight="bold">F — Facilities:</Box> {decision.tifrsFacilities || '-'}
              </div>
              <div>
                <Box fontWeight="bold">R — Route:</Box> {decision.tifrsRoute || '-'}
              </div>
              <div>
                <Box fontWeight="bold">S — Schedule:</Box> {decision.tifrsSchedule || '-'}
              </div>
            </ColumnLayout>
          </SpaceBetween>

          <div>
            <Box variant="awsui-key-label">결정 근거</Box>
            <Box>{decision.rationale || '-'}</Box>
          </div>

          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">AI 제안 결정</Box>
              <DecisionTypeBadge type={decision.aiSuggestedDecision} />
            </div>
            <div>
              <Box variant="awsui-key-label">AI 분석 근거</Box>
              <Box>{decision.aiRationale || '-'}</Box>
            </div>
          </ColumnLayout>
        </SpaceBetween>
      </Container>
    );
  }

  // 새 의사결정 기록 폼
  return (
    <Container header={<Header variant="h2">TIFRS 의사결정 기록</Header>}>
      <SpaceBetween size="m">
        {submitSuccess && (
          <Alert type="success" dismissible onDismiss={() => setSubmitSuccess(false)}>
            의사결정이 성공적으로 기록되었습니다.
          </Alert>
        )}

        {submitError && <Alert type="error">의사결정 기록 실패: {submitError.message}</Alert>}

        <form onSubmit={handleSubmit}>
          <Form
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setFormState(INITIAL_FORM_STATE)}>
                  초기화
                </Button>
                <Button
                  variant="primary"
                  formAction="submit"
                  loading={isSubmitting}
                  disabled={!formState.overallDecision}
                >
                  의사결정 기록
                </Button>
              </SpaceBetween>
            }
          >
            <SpaceBetween size="l">
              <FormField
                label="의사결정 유형"
                constraintText="NOTAM 영향에 대한 최종 대응 조치를 선택합니다."
              >
                <Select
                  selectedOption={formState.overallDecision}
                  onChange={({ detail }) =>
                    setFormState((prev) => ({
                      ...prev,
                      overallDecision: detail.selectedOption as { label: string; value: string },
                    }))
                  }
                  options={DECISION_OPTIONS}
                  placeholder="결정 유형 선택"
                />
              </FormField>

              <Header variant="h3">TIFRS 분석</Header>

              <FormField
                label="T — Time (시간적 영향)"
                description="NOTAM의 유효 기간과 운항 시간대와의 관계를 분석합니다."
              >
                <Textarea
                  value={formState.tifrsTime}
                  onChange={({ detail }) =>
                    setFormState((prev) => ({ ...prev, tifrsTime: detail.value }))
                  }
                  placeholder="예: 유효기간 2026-04-01~04-30, 주간 운항편 3편 해당"
                  rows={2}
                />
              </FormField>

              <FormField
                label="I — Impact (운영 영향)"
                description="NOTAM이 운항 안전과 효율에 미치는 영향 수준을 기술합니다."
              >
                <Textarea
                  value={formState.tifrsImpact}
                  onChange={({ detail }) =>
                    setFormState((prev) => ({ ...prev, tifrsImpact: detail.value }))
                  }
                  placeholder="예: ILS 접근 불가로 시정 제한 시 대체공항 필요"
                  rows={2}
                />
              </FormField>

              <FormField
                label="F — Facilities (시설/장비)"
                description="영향받는 공항 시설, 항행 장비, 서비스를 기술합니다."
              >
                <Textarea
                  value={formState.tifrsFacilities}
                  onChange={({ detail }) =>
                    setFormState((prev) => ({ ...prev, tifrsFacilities: detail.value }))
                  }
                  placeholder="예: RKPC ILS RWY 07 사용 불가"
                  rows={2}
                />
              </FormField>

              <FormField
                label="R — Route (항로)"
                description="영향받는 항로 구간과 대체 경로를 기술합니다."
              >
                <Textarea
                  value={formState.tifrsRoute}
                  onChange={({ detail }) =>
                    setFormState((prev) => ({ ...prev, tifrsRoute: detail.value }))
                  }
                  placeholder="예: Y711 항로 구간 KADBO-OLMEN 고도 제한"
                  rows={2}
                />
              </FormField>

              <FormField
                label="S — Schedule (스케줄)"
                description="영향받는 운항 스케줄과 일정 변경 사항을 기술합니다."
              >
                <Textarea
                  value={formState.tifrsSchedule}
                  onChange={({ detail }) =>
                    setFormState((prev) => ({ ...prev, tifrsSchedule: detail.value }))
                  }
                  placeholder="예: 7C101, 7C103편 제주 야간 도착편 영향"
                  rows={2}
                />
              </FormField>

              <FormField
                label="결정 근거"
                description="운항관리사로서 해당 의사결정을 내린 이유를 기술합니다."
              >
                <Textarea
                  value={formState.rationale}
                  onChange={({ detail }) =>
                    setFormState((prev) => ({ ...prev, rationale: detail.value }))
                  }
                  placeholder="예: VOR 접근 가능하므로 운항 유지, 기상 악화 시 재검토 예정"
                  rows={3}
                />
              </FormField>

              <FormField label="기록자" description="의사결정을 기록하는 운항관리사 ID">
                <Input
                  value={formState.recorder}
                  onChange={({ detail }) =>
                    setFormState((prev) => ({ ...prev, recorder: detail.value }))
                  }
                  placeholder="dispatcher-001"
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </form>
      </SpaceBetween>
    </Container>
  );
}
