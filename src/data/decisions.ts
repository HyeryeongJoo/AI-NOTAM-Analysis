/**
 * TIFRS 의사결정 기록 시드 데이터
 *
 * 기존 고중요도 NOTAM에 대한 의사결정 5건.
 * AI 제안과 운항관리사 최종 결정을 모두 포함.
 *
 * @requirements FR-020
 */

import type { DecisionRecord } from '@/types/decision';

/**
 * 상대 시각을 생성한다.
 *
 * @param hoursOffset - 시간 오프셋
 * @returns ISO-8601 문자열
 */
function relHours(hoursOffset: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hoursOffset, 0, 0, 0);
  return d.toISOString();
}

/** 시드 의사결정 데이터 (5건) */
export const SEED_DECISIONS: DecisionRecord[] = [
  {
    id: 'decision-001',
    notamId: 'notam-001',
    decidedBy: 'dispatcher-001',
    decidedAt: relHours(-6),
    tifrsTime: '활주로 폐쇄 기간 06:00~12:00 UTC, 제주항공 ICN 출발편 7C101~7C109 시간대와 중첩',
    tifrsImpact: '인천공항 33L 활주로 폐쇄로 활주로 운영 용량 25% 감소. 지연 30분~1시간 예상',
    tifrsFacilities: 'RKSI RWY 33L 폐쇄, ILS CAT III 사용 불가. RWY 33R/34L/34R 정상 운영',
    tifrsRoute: 'ICN-CJU, ICN-NRT, ICN-KIX 출발편에 직접 영향. 활주로 배정 변경 필요',
    tifrsSchedule: '오전 출발편 7건 평균 30분 지연 예상. 14:00 UTC 이후 정상화 전망',
    overallDecision: 'monitor',
    rationale: '복수 활주로 운영으로 대체 가능하나, 오전 피크 시간대 지연 가능성 모니터링 필요',
    aiSuggestedDecision: 'monitor',
    aiRationale:
      '인천공항은 4개 활주로를 운영하므로 1개 폐쇄 시에도 운항 지속 가능. 다만 06:00-12:00 UTC는 제주항공 오전 출발 피크와 겹쳐 30분 이내 지연 발생 가능성 높음. 모니터링하며 지연 확대 시 스케줄 조정 검토 권고.',
  },
  {
    id: 'decision-002',
    notamId: 'notam-004',
    decidedBy: 'dispatcher-001',
    decidedAt: relHours(-5),
    tifrsTime: '공역 제한 기간 2일간 지속, 전 시간대 영향',
    tifrsImpact: '군사 훈련으로 인한 위험구역 설정. 해당 공역 통과 항공기 우회 필수',
    tifrsFacilities: '항행시설 영향 없음. 공역만 제한',
    tifrsRoute: 'ICN-NRT 항로(Y711)가 위험구역과 50% 중첩. 우회 시 약 40NM 추가',
    tifrsSchedule: '해당 기간 ICN-NRT 전 운항편 약 15분 추가 소요',
    overallDecision: 'route-change',
    rationale:
      '위험구역 통과 불가하므로 대체 항로 Y722 사용. 거리 증가 40NM, 시간 증가 약 15분이나 안전 확보 우선',
    aiSuggestedDecision: 'route-change',
    aiRationale:
      'Y711 항로가 위험구역(RKRR D-58)과 대폭 중첩되어 통과가 불가합니다. 대체 항로 Y722는 위험구역을 완전히 회피하며, 추가 거리 약 40NM(15분)으로 운항 영향이 제한적입니다. 항로 변경을 권고합니다.',
  },
  {
    id: 'decision-003',
    notamId: 'notam-011',
    decidedBy: 'dispatcher-002',
    decidedAt: relHours(-4),
    tifrsTime: 'ILS 장비 점검 기간 4시간 (02:00~06:00 UTC), 야간/새벽 시간대',
    tifrsImpact: 'CAT I ILS 사용 불가. 시정 양호 시 VOR/DME 접근 가능',
    tifrsFacilities: 'RJTT ILS RWY 34R 사용 불가. RWY 34L ILS 정상 운영',
    tifrsRoute: 'ICN-NRT 도착편에 영향. 야간 접근 시 활주로 변경 필요할 수 있음',
    tifrsSchedule: '7C301 도착 04:30 UTC 예정 — ILS 점검 시간과 중첩. 대체 활주로 접근 필요',
    overallDecision: 'monitor',
    rationale: '34L 활주로 ILS 정상이므로 활주로 변경으로 대응 가능. 기상 악화 시 재검토',
    aiSuggestedDecision: 'no-action',
    aiRationale:
      '나리타공항은 복수 활주로를 운영하고 있으며, RWY 34L의 ILS가 정상 운영 중입니다. 해당 시간대 기상 조건이 양호할 것으로 예상되어 특별한 조치 없이 진행 가능합니다.',
  },
  {
    id: 'decision-004',
    notamId: 'notam-023',
    decidedBy: 'dispatcher-001',
    decidedAt: relHours(-3),
    tifrsTime: '미사일 사격 훈련 3일간, 매일 09:00~15:00 UTC',
    tifrsImpact: '위험구역 D-121 활성화. 반경 30NM 이내 비행 금지',
    tifrsFacilities: '해상 위험구역으로 지상 시설 영향 없음',
    tifrsRoute: 'ICN-BKK 항로 초기 구간이 위험구역 인접. 최소 이격거리 10NM 유지 필요',
    tifrsSchedule: '7C501, 7C503 출발 시간이 훈련 시간과 중첩',
    overallDecision: 'monitor',
    rationale: '위험구역 경계까지 10NM 이격 가능. 출발 시 ATC 지시에 따라 우회 경로 수용 준비',
    aiSuggestedDecision: 'route-change',
    aiRationale:
      '위험구역 D-121이 ICN-BKK 항로 초기 구간에 인접하여 충돌 위험이 있습니다. 안전 마진 확보를 위해 초기 구간 우회 항로 사용을 권고합니다. ATC 지시에 따른 우회만으로는 불확실성이 있을 수 있습니다.',
  },
  {
    id: 'decision-005',
    notamId: 'notam-002',
    decidedBy: 'dispatcher-002',
    decidedAt: relHours(-2),
    tifrsTime: '유도로 폐쇄 7일간 지속, 전 시간대',
    tifrsImpact: '지상 이동 시간 약 5분 증가. 항공기 운항에 직접적 영향 미미',
    tifrsFacilities: 'RKSI TWY B3 폐쇄, 대체 유도로 TWY A 사용 가능',
    tifrsRoute: '지상 이동 경로만 영향. 항로 영향 없음',
    tifrsSchedule: '전체 ICN 출발/도착편 지상 이동 5분 추가 소요',
    overallDecision: 'no-action',
    rationale:
      '유도로 폐쇄로 인한 영향이 미미하여 조치 불필요. 운항승무원에게 지상 이동 경로 변경 안내만 실시',
    aiSuggestedDecision: 'no-action',
    aiRationale:
      '유도로 B3 폐쇄는 지상 이동에만 영향을 미치며, 대체 유도로가 사용 가능합니다. 항공기 운항에 실질적인 영향이 없으므로 특별한 조치가 필요하지 않습니다.',
  },
];
