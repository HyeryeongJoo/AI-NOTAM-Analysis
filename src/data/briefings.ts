/**
 * 브리핑 시드 데이터
 *
 * AI 생성 브리핑 문서 5건. 다양한 유형과 상태.
 *
 * @requirements FR-007, FR-008, FR-014
 */

import type { Briefing } from '@/types/briefing';

/**
 * 상대 날짜를 생성한다.
 *
 * @param daysOffset - 일 오프셋
 * @param hoursOffset - 시간 오프셋
 * @returns ISO-8601 문자열
 */
function relDate(daysOffset: number, hoursOffset: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(d.getHours() + hoursOffset, 0, 0, 0);
  return d.toISOString();
}

/** 시드 브리핑 데이터 (5건) */
export const SEED_BRIEFINGS: Briefing[] = [
  {
    id: 'briefing-001',
    type: 'dispatcher-summary',
    flightId: 'flight-001',
    generatedAt: relDate(0, -2),
    content: `## 운항 브리핑 요약 — 7C101 (ICN→NRT)

### 영향 NOTAM 요약
1. **[CRITICAL] A1234/26** — 인천공항 RWY 15L/33R 폐쇄 (재포장)
   - 나머지 활주로 사용 가능하나 지상 이동 시간 증가 예상
2. **[HIGH] A1235/26** — 인천공항 ILS RWY 33L 정비 (0100-0800)
   - CAT II/III 불가, 33R ILS 사용
3. **[HIGH] J4505/26** — 후쿠오카 레이더 장비 고장
   - RJJJ FIR 통과 시 절차적 관제, 간격 증대

### 권고 사항
- 추가 연료 5분 반영 권장 (지상 대기 + FIR 지연)
- 목적지 날씨 양호 시 33R CATIII 배정 불필요
`,
    notamIds: ['notam-001', 'notam-002', 'notam-015'],
    status: 'approved',
    approvedBy: 'dispatcher-001',
    approvedAt: relDate(0, -1),
  },
  {
    id: 'briefing-002',
    type: 'dispatcher-summary',
    flightId: 'flight-007',
    generatedAt: relDate(0, -1),
    content: `## 운항 브리핑 요약 — 7C301 (ICN→BKK)

### 영향 NOTAM 요약
1. **[CRITICAL] B2001/26** — 수완나품 RWY 19L/01R 야간 정비 폐쇄
   - 도착 시각 야간이면 단일 활주로 운영
2. **[HIGH] B2002/26** — 태국 R-401 제한 구역 활성화 (0300-0900)
   - MANAT 웨이포인트 인근, FL300 이상 비행 시 무관
3. **[CRITICAL] A1271/26** — 서해 공중급유 훈련 제한 구역
   - GUKDO 웨이포인트 영향, 우회 필요
4. **[HIGH] B2011/26** — BKK ILS 19R CAT III U/S
   - CAT I 가용, 최저치 상승

### 권고 사항
- 서해 제한 구역 우회 항로 사전 준비 (route-006)
- BKK 도착 시 단일 활주로 지연 대비 추가 연료 10분 권장
`,
    notamIds: ['notam-016', 'notam-017', 'notam-036', 'notam-047'],
    status: 'approved',
    approvedBy: 'dispatcher-001',
    approvedAt: relDate(0, -1),
  },
  {
    id: 'briefing-003',
    type: 'company-notam',
    flightId: 'flight-011',
    generatedAt: relDate(0, -1),
    content: `COMPANY NOTAM — 7C501 (ICN→CJU)
DATE: ${new Date().toISOString().split('T')[0]}

1. RKPC VOR/DME (116.9) U/S — RNAV REQUIRED
2. RKPC RWY 07 ILS GP U/S — LOC ONLY APCH
3. RKSI RWY 15L/33R CLSD — USE 15R/33L OR 16/34
4. WIND SHEAR ADVISORY RWY 07 FINAL AT RKPC

ACTION REQUIRED: VERIFY RNAV CAPABILITY BEFORE DISPATCH.
`,
    notamIds: ['notam-005', 'notam-038', 'notam-001', 'notam-043'],
    status: 'approved',
    approvedBy: 'dispatcher-002',
    approvedAt: relDate(0, -1),
  },
  {
    id: 'briefing-004',
    type: 'disp-comment',
    flightId: 'flight-004',
    generatedAt: relDate(0),
    content: `DISP COMMENT — 7C201 (ICN→KIX)

NRT/KIX 방면 주의 사항:
- J4502: VIP 비행 제한 구역 RJJJ FIR 내 (FL200-400, 20NM)
  → 간사이 접근 시 FL330 유지하면 영향 없음 (제한 범위 외)
- J4503: KIX NDB U/S → RNAV/ILS 접근 사용
- J4520: KIX ILS 06R 보정 중 → 24L 접근 대비

연료: STD +3분 (FUK 레이더 고장 간격 증대)
`,
    notamIds: ['notam-012', 'notam-013', 'notam-032'],
    status: 'draft',
    approvedBy: null,
    approvedAt: null,
  },
  {
    id: 'briefing-005',
    type: 'crew-briefing',
    flightId: 'flight-001',
    generatedAt: relDate(0, -1),
    content: JSON.stringify({
      dispComment: '7C101 ICN-NRT: RWY 15L/33R CLSD, ILS 33L U/S(0100-0800), FUK RADAR U/S. 추가 연료 5분.',
      companyNotam: 'COMPANY NOTAM 7C101: (1) RKSI RWY 15L/33R CLSD (2) RKSI ILS 33L U/S 0100-0800 (3) RJFF RADAR U/S PROCEDURAL CTL (4) RJAA RWY 16R/34L CLSD 2300-0500',
      crewBriefing: '## Crew Briefing 7C101 ICN→NRT\n\n### 출발 (RKSI)\n- RWY 15L/33R 폐쇄: 15R/33L 또는 16/34 사용\n- ILS 33L 정비 중 (0100-0800): 해당 시간 33R 사용\n\n### 항로\n- 후쿠오카 레이더 고장: 절차적 관제, 지연 가능\n- 위험 구역 D-65 (FL250 이하): FL350 운항으로 무관\n\n### 도착 (RJAA)\n- RWY 16R/34L 야간 폐쇄 (2300-0500)\n- 주간 도착 시 영향 없음\n\n### 날씨\n- ICN: CAVOK\n- NRT: FEW025, VIS 10KM+',
    }),
    notamIds: ['notam-001', 'notam-002', 'notam-015', 'notam-011'],
    status: 'approved',
    approvedBy: 'dispatcher-001',
    approvedAt: relDate(0, -1),
  },
];
