# 요구사항 정의서 — 제주항공 AI 기반 NOTAM 분석 시스템 (v2)

> **고객**: 제주항공 (Jeju Air)
> **버전**: 2 (v1 -> v2 이터레이션)
> **작성일**: 2026-04-01
> **분석 근거**: 요구사항 정의서 PDF, 항공정보분석 워크플로우 다이어그램, v1 데모 세션 피드백 12건

---

## 1. v2 변경 요약

### v1 대비 주요 변경사항

| 구분 | 내용 |
|------|------|
| 기존 FR 업데이트 | FR-001, FR-003, FR-005, FR-006, FR-009, FR-010, FR-011, FR-012, FR-013, FR-017 — 수용 기준(AC) 추가/수정 |
| 신규 FR 추가 | FR-020: TIFRS 기반 의사결정 근거 문서화 |
| 신규 NFR 추가 | NFR-008: Leaflet 지도 인프라 안정성 (v1 버그 수정 반영) |
| 신규 데이터 엔티티 | DecisionRecord (TIFRS 의사결정 기록) |
| 신규 Enum | DecisionType, AuditAction에 'record-decision' 추가 |
| 신규 페이지 | /decisions (의사결정 기록 목록) |
| Pain Point 추가 | PP-008: TIFRS 의사결정 근거 미체계화 |

### 데모 피드백 반영 매핑

| 피드백 ID | 설명 | 반영 위치 |
|-----------|------|-----------|
| FB-UX-001 | 지도 범례(legend) 추가 | FR-006 AC |
| FB-UX-002 | NOTAM 원형 클릭 팝업 + 상세 링크 | FR-006, FR-009 AC |
| FB-UX-003 | 지도 헤더 info popover | FR-006 AC |
| FB-UX-004 | NOTAM 중요도 색상 일관 적용 | FR-001, FR-005, FR-006, FR-009, FR-012 AC |
| FB-UX-005 | 항로 드롭다운 "전체" 옵션 | FR-006 AC |
| FB-UX-006 | 중요 NOTAM = Critical + High | FR-005 AC |
| FB-UX-007 | 지도에 모든 NOTAM 표시 | FR-006 AC |
| FB-UX-008 | 항로 상태 컬럼 info popover | FR-010 AC |
| FB-UX-009 | 운항편 상태 컬럼 info popover | FR-013 AC |
| FB-BUG-001 | Leaflet CSS import 방식 변경 | NFR-008 |
| FB-BUG-002 | Leaflet 마커 아이콘 webpack 호환 | NFR-008 |
| FB-BUG-003 | 지도 wrapper position:relative | NFR-008 |

### 워크플로우 다이어그램 인사이트 반영

| 인사이트 | 반영 위치 |
|----------|-----------|
| 중요도 분류와 운항 영향 분석이 별도 단계 | FR-003 AC 업데이트 |
| REF BOOK 등재가 영향 분석의 전제 조건 | FR-011 AC 업데이트 |
| TIFRS단 판단 근거가 의사결정 자료에 포함 | FR-020 (신규) |
| 브리핑 자료와 의사결정 자료가 별도 산출물 | FR-020과 FR-007/FR-008 분리 유지 |

---

## 2. Pain Points (고객 고충)

| ID | 설명 | 관련 FR |
|----|------|---------|
| PP-001 | 담당자 3명이 24시간 교대로 하루 수천 건의 NOTAM을 수동 모니터링 | FR-001, FR-005, FR-010 |
| PP-002 | NOTAM이 비정형 텍스트/약어로 구성되어 해석이 어렵고 시간 소요 | FR-001, FR-002, FR-015 |
| PP-003 | 중요 NOTAM을 J-FOS REF BOOK에 수기 등재해야 함 | FR-003, FR-005, FR-011 |
| PP-004 | 긴급 NOTAM 분석 지연으로 운항 차질 리스크 | FR-001, FR-005, FR-016 |
| PP-005 | 수천 건의 루틴 NOTAM 필터링에 과도한 시간 소모 | FR-005, FR-002 |
| PP-006 | 승무원 브리핑 자료(Company NOTAM, DISP COMMENT) 수동 작성 업무 과중 | FR-007, FR-008 |
| PP-007 | 고숙련 운항관리사가 단순 해석에 시간을 소모하여 고부가가치 의사결정에 집중 못함 | FR-009, FR-004, FR-006 |
| PP-008 | [v2] TIFRS 기반 의사결정 근거가 체계적으로 문서화되지 않아 감사추적 불완전 | FR-020, FR-017 |

---

## 3. 기능 요구사항 (Functional Requirements)

### 요약 테이블

| ID | 제목 | 우선순위 | UI 유형 | v2 변경 |
|----|------|----------|---------|---------|
| FR-001 | LLM 기반 NOTAM 중요도 점수화 | P0 | table-view | AC 추가 (색상 일관성) |
| FR-002 | Q-Code 기반 초기 분류 | P0 | detail | 변경 없음 |
| FR-003 | 공간/스케줄 기반 종합 분석 | P0 | detail | AC 추가 (단계 분리, REF BOOK 연계) |
| FR-004 | 운항편/항로 자동 매칭 | P0 | table-view | 변경 없음 |
| FR-005 | 중요 NOTAM 자동 필터링 | P0 | table-view | AC 추가 (critical+high, 색상 일관성) |
| FR-006 | 항로 영향도 분석 대시보드 (지도) | P0 | dashboard | AC 대폭 추가 (범례, 팝업, popover, 전체 옵션, 전체 NOTAM, 색상) |
| FR-007 | 운항관리사용 브리핑 문서 자동 생성 | P0 | detail | 변경 없음 |
| FR-008 | 승무원 브리핑 자료 자동 생성 | P1 | detail | 변경 없음 |
| FR-009 | 항로 우회 의사결정 가이드 | P1 | detail | AC 추가 (지도 색상, 팝업) |
| FR-010 | NOTAM-항로/스케줄 매칭 알고리즘 | P0 | table-view | AC 추가 (상태 컬럼 popover) |
| FR-011 | REF BOOK 관리 | P1 | table-view | AC 추가 (워크플로우 순서 반영) |
| FR-012 | NOTAM 상세 뷰 (AI 분석 포함) | P1 | detail | AC 추가 (지도 색상 일관성) |
| FR-013 | 운항편 스케줄 개요 | P1 | table-view | AC 추가 (상태 컬럼 popover) |
| FR-014 | 교대 근무 핸드오버 리포트 | P1 | detail | 변경 없음 |
| FR-015 | NOTAM 한국어 평문 요약 | P1 | detail | 변경 없음 |
| FR-016 | 긴급 NOTAM 실시간 알림 배너 | P1 | dashboard | 변경 없음 |
| FR-017 | 운항관리사 감사 추적 | P2 | table-view | AC 추가 (TIFRS 의사결정 포함) |
| FR-018 | NOTAM 변경 추적 (NOTAMR diff) | P2 | detail | 변경 없음 |
| FR-019 | NOTAM 만료 관리 | P2 | table-view | 변경 없음 |
| FR-020 | [v2 신규] TIFRS 기반 의사결정 근거 문서화 | P2 | detail | 신규 |

### 우선순위 분포

| 우선순위 | 수량 | FR ID |
|----------|------|-------|
| P0 (필수) | 8 | FR-001~007, FR-010 |
| P1 (권장) | 8 | FR-008~009, FR-011~016 |
| P2 (선택) | 4 | FR-017~020 |

---

### FR-001: LLM 기반 NOTAM 중요도 점수화
- **우선순위**: P0
- **UI 유형**: table-view
- **설명**: Amazon Bedrock LLM을 활용하여 수신 NOTAM의 중요도를 0~1 확률 점수로 산정. 과거 3년치 REF BOOK 패턴을 RAG로 학습.
- **수용 기준**:
  1. NOTAM마다 0.0~1.0 중요도 점수 표시
  2. Amazon Bedrock LLM으로 점수 생성 (모킹 금지)
  3. critical, high, medium, low, routine 5단계 분류
  4. NOTAM 목록 테이블에 색상 코딩된 중요도 배지 표시
  5. NOTAM 당 10초 이내 점수 산출
  6. [v2] 중요도 배지 색상 일관 적용: 빨강=critical, 주황=high, 파랑=기타

### FR-002: Q-Code 기반 초기 분류
- **우선순위**: P0
- **UI 유형**: detail
- **설명**: NOTAM Q-line에서 Q-Code를 추출하고 규칙 기반 초기 분류 수행. LLM 분석 전 1차 필터링 역할.
- **수용 기준**:
  1. 모든 NOTAM에서 Q-Code 추출 및 표시
  2. Q-Code 설명을 사람이 읽을 수 있는 형태로 표시 (예: QMRLC -> 활주로 폐쇄)
  3. 규칙 기반 분류가 LLM 점수화 이전에 실행
  4. Q-Code 조회 테이블이 참조 데이터로 제공

### FR-003: 공간/스케줄 기반 종합 분석
- **우선순위**: P0
- **UI 유형**: detail
- **설명**: 공항 시설 정보(활주로 수 등)와 운항 스케줄을 결합하여 NOTAM의 종합 중요도 산출.
- **수용 기준**:
  1. 공항 활주로 수와 시설 고려한 영향도 분석
  2. 활성 운항 스케줄과 교차 분석
  3. 맥락적 심각도 설명 제공
  4. Bedrock LLM으로 자연어 영향 요약 생성
  5. [v2] 종합 분석은 Q-Code 분류(FR-002) 후 별도 단계로 실행 (워크플로우 다이어그램 반영)
  6. [v2] REF BOOK 등재 상태를 참조하여 NOTAM 중요도 맥락 평가

### FR-004: 운항편/항로 자동 매칭
- **우선순위**: P0
- **UI 유형**: table-view
- **설명**: NOTAM 본문에서 공간 데이터(좌표, 반경, 고도)를 추출하고 항로/스케줄과 교차 분석하여 영향 운항편 자동 식별.
- **수용 기준**:
  1. NOTAM별 영향 운항편 목록 표시
  2. NOTAM별 영향 항로 목록 표시
  3. 공간적 겹침(NOTAM 영역 vs 항로 경로) 고려
  4. 시간적 겹침(NOTAM 유효 시간 vs 운항 스케줄) 고려
  5. 영향 운항편 목록에 편명, 항로, 출발 시간, 영향 유형 표시

### FR-005: 중요 NOTAM 자동 필터링
- **우선순위**: P0
- **UI 유형**: table-view
- **설명**: 수천 건의 NOTAM 중 운항 영향이 있는 것만 자동 필터링. 설정 가능한 중요도 임계치 적용.
- **수용 기준**:
  1. 중요도별 필터링 지원 (critical, high, medium, low, routine)
  2. 기본 뷰에서 critical + high 중요도 NOTAM만 표시
  3. 중요도별 NOTAM 건수 표시
  4. 중요도 점수, 시간, 공항, Q-Code 기준 정렬 지원
  5. 필터링 비율(필터/전체) 표시
  6. [v2] 대시보드 '중요 NOTAM' 위젯은 critical뿐만 아니라 high도 포함 (critical+high)
  7. [v2] 모든 뷰에서 중요도 색상 일관 적용: 빨강=critical, 주황=high, 파랑=기타

### FR-006: 항로 영향도 분석 대시보드 (지도)
- **우선순위**: P0
- **UI 유형**: dashboard
- **설명**: 인터랙티브 지도에서 항로별 NOTAM 영향도를 시각적으로 파악할 수 있는 대시보드.
- **수용 기준**:
  1. NOTAM 영향 영역을 원형(중심점+반경)으로 표시
  2. 항로를 waypoint 연결 폴리라인으로 표시
  3. NOTAM 영역과 항로 교차 구간 시각적 강조
  4. 요약 위젯: 총 활성 NOTAM, critical 건수, 영향 항로 수, 영향 운항편 수
  5. 지도 확대/축소/이동, NOTAM 클릭 시 상세 보기 지원
  6. 항로 선택 시 해당 항로와 관련 NOTAM만 필터 표시
  7. [v2] 지도에 범례(legend) 포함: 빨강=Critical, 주황=High, 파랑=기타, 항로 선 색상 설명
  8. [v2] NOTAM 원형 클릭 시 팝업 표시 — NOTAM 요약 정보 + 상세 페이지(/notams/{id}) 링크 포함
  9. [v2] 지도 헤더에 Cloudscape Popover로 info 아이콘 — 지도 요소 의미 안내
  10. [v2] 항로 드롭다운에 '전체'(All) 옵션 기본 선택 — 모든 항로 NOTAM 동시 표시
  11. [v2] 지도에 critical만이 아닌, 선택된 항로에 영향을 미치는 **모든** NOTAM 표시 (중요도별 색상 구분)
  12. [v2] NOTAM 중요도 색상 일관 적용: 빨강=critical, 주황=high, 파랑=medium/low/routine

### FR-007: 운항관리사용 브리핑 문서 자동 생성
- **우선순위**: P0
- **UI 유형**: detail
- **설명**: AI가 분석 완료된 중요 NOTAM을 요약한 운항관리사 결재 문서 자동 생성.
- **수용 기준**:
  1. 선택한 운항편에 대해 브리핑 생성 트리거 가능
  2. 관련 NOTAM AI 요약 포함
  3. Amazon Bedrock으로 콘텐츠 생성 (모킹 금지)
  4. 초안/검토/승인 워크플로우 지원
  5. 포맷된 형태로 미리보기 가능

### FR-008: 승무원 브리핑 자료 자동 생성
- **우선순위**: P1
- **UI 유형**: detail
- **설명**: DISP COMMENT, Company NOTAM 등 승무원 브리핑 패키지 자동 생성.
- **수용 기준**:
  1. 선택한 운항편의 DISP COMMENT 생성
  2. Company NOTAM 문서 생성
  3. 적절한 항공 용어 사용
  4. 승인 전 편집 가능
  5. 동일 운항편에 대해 여러 유형의 브리핑 생성 가능

### FR-009: 항로 우회 의사결정 가이드
- **우선순위**: P1
- **UI 유형**: detail
- **설명**: NOTAM이 항로에 중대한 영향을 미칠 때 대체 항로를 AI가 제안.
- **수용 기준**:
  1. 고영향 NOTAM 발생 시 대체 항로 제안
  2. 대체 항로 비교 정보 포함 (거리, 시간)
  3. Amazon Bedrock LLM으로 제안 생성
  4. 원래 항로 vs 대체 항로 지도 비교
  5. 권고 사항으로 제공 (자동 조치 아님)
  6. [v2] 운항편 상세 지도에서 NOTAM 원형을 중요도별 색상으로 표시 (빨강=critical, 주황=high, 파랑=기타)
  7. [v2] 운항편 상세 지도의 NOTAM 원형 클릭 시 팝업 표시 — 요약 + 상세 페이지 링크

### FR-010: NOTAM-항로/스케줄 매칭 알고리즘
- **우선순위**: P0
- **UI 유형**: table-view
- **설명**: NOTAM 영향 영역과 항로/스케줄의 시공간적 교차를 자동 계산하는 핵심 알고리즘.
- **수용 기준**:
  1. NOTAM 원형과 항로 폴리라인의 공간적 겹침 계산
  2. 고도 제한(하한/상한) 고려
  3. 시간적 겹침(NOTAM 유효 기간 vs 운항 시간) 고려
  4. 영향 항로 구간별 통과 거리 포함 결과 제공
  5. 전체 활성 NOTAM 대 전체 예정 운항편에 대해 매칭 실행
  6. [v2] 항로 테이블 '상태' 컬럼 헤더에 info popover — active/suspended/alternate 상태값 설명

### FR-011: REF BOOK 관리
- **우선순위**: P1
- **UI 유형**: table-view
- **설명**: 디지털 REF BOOK. AI 제안을 검토하고 중요 NOTAM을 등재/편집/관리.
- **수용 기준**:
  1. AI가 REF BOOK 등재 대상 NOTAM 제안 (신뢰도 점수 포함)
  2. 운항관리사가 AI 제안을 확인/편집/거부 가능
  3. REF BOOK 항목 검색 및 필터링 가능
  4. 링크된 NOTAM 상세, 등재자, 등재 시간 표시
  5. 과거 REF BOOK 항목 조회 가능
  6. [v2] REF BOOK 등재가 상세 운항 영향 분석의 전제 단계로 위치 (워크플로우 순서 반영)

### FR-012: NOTAM 상세 뷰 (AI 분석 포함)
- **우선순위**: P1
- **UI 유형**: detail
- **설명**: 단일 NOTAM의 원문, 파싱 결과, AI 점수, 영향 분석, 관련 운항편/항로, 한국어 요약을 표시하는 상세 뷰.
- **수용 기준**:
  1. 원문과 구조화된 파싱 결과 나란히 표시
  2. AI 중요도 점수 및 분류 눈에 띄게 표시
  3. 영향 운항편/항로 목록 (링크 포함)
  4. AI 생성 한국어 평문 요약 표시
  5. 미니맵에 NOTAM 위치 표시
  6. [v2] 미니맵 NOTAM 원형에 대시보드와 동일한 중요도 기반 색상 적용

### FR-013: 운항편 스케줄 개요
- **우선순위**: P1
- **UI 유형**: table-view
- **설명**: 전체 운항 스케줄을 테이블로 표시. 편명, 출발/도착, 항로, NOTAM 영향 상태 포함.
- **수용 기준**:
  1. 편명, 출발/도착 공항, 시간, 상태 표시
  2. 편별 영향 NOTAM 건수 및 심각도 표시
  3. 공항, 항로, 날짜, NOTAM 영향 상태별 필터링
  4. 운항편 클릭 시 상세 페이지로 이동
  5. [v2] 운항편 테이블 '상태' 컬럼 헤더에 info popover — scheduled/dispatched/in-flight/arrived/cancelled/diverted 상태값 설명

### FR-014: 교대 근무 핸드오버 리포트
- **우선순위**: P1
- **UI 유형**: detail
- **설명**: 교대 근무 인수인계용 브리핑 자동 생성. 이전 교대 이후 신규/변경/긴급 NOTAM 요약.
- **수용 기준**:
  1. 설정 가능한 시간 창 기준 수신/변경 NOTAM 리포트 생성
  2. 중요도별 NOTAM 분류
  3. 신규 긴급 NOTAM 및 상태 변경 강조
  4. Amazon Bedrock LLM으로 생성
  5. 리포트 조회 및 내보내기 가능

### FR-015: NOTAM 한국어 평문 요약
- **우선순위**: P1
- **UI 유형**: detail
- **설명**: ICAO 약어와 Q-Code를 사람이 읽을 수 있는 한국어로 변환하여 요약.
- **수용 기준**:
  1. NOTAM마다 AI 생성 한국어 평문 요약 제공
  2. 운항 관점에서의 의미 설명
  3. Amazon Bedrock으로 생성 (모킹 금지)
  4. 상세 뷰에서 원문과 함께 표시

### FR-016: 긴급 NOTAM 실시간 알림 배너
- **우선순위**: P1
- **UI 유형**: dashboard
- **설명**: critical 임계치 초과 NOTAM 수신 시 상단 알림 배너 표시.
- **수용 기준**:
  1. Critical NOTAM 수신 시 페이지 상단 알림 배너 표시
  2. NOTAM 요약, 영향 공항/항로, 중요도 표시
  3. 운항관리사가 확인할 때까지 배너 유지
  4. 배너 클릭 시 NOTAM 상세 뷰로 이동

### FR-017: 운항관리사 감사 추적
- **우선순위**: P2
- **UI 유형**: table-view
- **설명**: 규제 준수를 위한 운항관리사 행동 로그. 조회/분석/승인/등재/브리핑 생성 등 모든 액션 기록.
- **수용 기준**:
  1. 모든 액션에 타임스탬프, 사용자, 액션 유형, 대상 NOTAM 기록
  2. 검색 가능한 테이블로 감사 로그 조회
  3. 로그 항목은 불변(append-only)
  4. [v2] TIFRS 의사결정 기록(FR-020)이 감사 추적에 포함

### FR-018: NOTAM 변경 추적 (NOTAMR diff)
- **우선순위**: P2
- **UI 유형**: detail
- **설명**: 대체 NOTAM(NOTAMR) 수신 시 원본 대비 변경 사항 diff 뷰 표시.
- **수용 기준**:
  1. 대체 NOTAM에 원본 NOTAM 링크 표시
  2. 추가/삭제/변경 내용 하이라이트
  3. NOTAM 이력 체인 탐색 가능 (원본 -> 대체 -> 취소)

### FR-019: NOTAM 만료 관리
- **우선순위**: P2
- **UI 유형**: table-view
- **설명**: NOTAM 수명주기 자동 관리. 만료 카운트다운 표시 및 만료 NOTAM 자동 아카이브.
- **수용 기준**:
  1. NOTAM별 만료까지 남은 시간 표시
  2. 설정 가능한 기간 내 만료 예정 NOTAM 플래그
  3. 만료된 NOTAM 자동 아카이브 처리
  4. 만료 상태별 필터링 지원

### FR-020: TIFRS 기반 의사결정 근거 문서화 [v2 신규]
- **우선순위**: P2
- **UI 유형**: detail
- **설명**: 워크플로우 다이어그램에서 식별된 TIFRS(Time/Impact/Facilities/Route/Schedule) 판단 기준을 구조화된 형태로 기록. 의사결정 자료는 브리핑 자료와 별도 산출물.
- **수용 기준**:
  1. NOTAM에 대한 의사결정 기록 시 구조화된 TIFRS 필드 입력
  2. TIFRS 항목: 시간 영향, 운항 영향 심각도, 영향 시설, 영향 항로 구간, 스케줄 교란 수준
  3. AI가 NOTAM 분석을 기반으로 TIFRS 항목 사전 채움 (Amazon Bedrock, 모킹 금지)
  4. 의사결정 기록은 NOTAM에 연결되어 상세 뷰에 표시
  5. 의사결정 기록을 별도 목록으로 조회 가능 (감사/참조용)
  6. 의사결정 근거를 의사결정 지원 문서로 내보내기 가능

---

## 4. 비기능 요구사항 (Non-Functional Requirements)

| ID | 카테고리 | 설명 | 제약사항 |
|----|----------|------|----------|
| NFR-001 | 인증 | 운항관리사 기본 인증 | 프로토타입은 mock auth 사용 (Cognito 미사용). 단일 역할: dispatcher |
| NFR-002 | 성능 | AI 분석 응답 시간 | NOTAM당 15초 이내. 배치 처리 시 동시 실행 |
| NFR-003 | 성능 | 대시보드 렌더링 | 500개 NOTAM 기준 3초 이내 로드. 지도 상호작용 60fps |
| NFR-004 | 국제화 | 한국어 UI | UI 텍스트 전체 한국어. NOTAM 원문은 영어(ICAO). AI 요약은 한국어 |
| NFR-005 | 보안 | 보안 헤더 및 입력 검증 | CSP, X-Frame-Options 등 보안 헤더. zod 스키마로 API 입력 검증 |
| NFR-006 | 접근성 | 기본 접근성 | Cloudscape WCAG 2.1 AA. 지도 컴포넌트에 ARIA 레이블 |
| NFR-007 | 성능 | 시드 데이터 규모 | 최소 NOTAM 50건, 항로 10개, 운항편 30개, 공항 15개 |
| NFR-008 | 성능 | [v2] Leaflet 지도 인프라 안정성 | CSS는 ES module import. 마커 아이콘 webpack 호환. wrapper div에 position:relative |

---

## 5. 데이터 모델

### 엔티티

| 엔티티명 | 설명 | v2 변경 |
|----------|------|---------|
| Notam | NOTAM 전문 및 AI 분석 결과 | 변경 없음 |
| RefBookEntry | REF BOOK 등재 기록 | 변경 없음 |
| Flight | 운항편 정보 | 변경 없음 |
| Route | 항로 정보 (waypoint 포함) | 변경 없음 |
| Waypoint | 항로 경유지 좌표 | 변경 없음 |
| Airport | 공항 정보 | 변경 없음 |
| Briefing | 브리핑 문서 | 변경 없음 |
| AuditLog | 감사 로그 | AuditAction에 'record-decision' 추가 |
| QCode | Q-Code 참조 데이터 | 변경 없음 |
| NotamRouteImpact | NOTAM-항로 영향 매핑 | 변경 없음 |
| NotamFlightImpact | NOTAM-운항편 영향 매핑 | 변경 없음 |
| **DecisionRecord** | **[v2 신규] TIFRS 의사결정 기록** | **신규 엔티티** |

### 신규 Enum

| Enum명 | 값 | 설명 |
|--------|-----|------|
| DecisionType | no-action, monitor, route-change, schedule-change, cancel-flight, divert | TIFRS 의사결정 유형 |

---

## 6. 페이지 구성

| 경로 | 제목 | 패턴 | 관련 FR | v2 변경 |
|------|------|------|---------|---------|
| / | 대시보드 - 항로 영향 개요 | dashboard | FR-006, FR-005, FR-016 | FR-006 AC 대폭 업데이트 |
| /notams | NOTAM 목록 | table-view | FR-001, FR-002, FR-005, FR-019 | - |
| /notams/{id} | NOTAM 상세 | detail | FR-002, FR-003, FR-012, FR-015, FR-018, FR-020 | FR-020 추가 |
| /flights | 운항 스케줄 | table-view | FR-004, FR-013 | FR-013 AC 업데이트 |
| /flights/{id} | 운항편 상세 | detail | FR-004, FR-009, FR-013 | FR-009 AC 업데이트 |
| /routes | 항로 목록 | table-view | FR-010, FR-006 | FR-010 AC 업데이트 |
| /routes/{id} | 항로 상세 | detail | FR-009, FR-010 | - |
| /ref-book | REF BOOK 관리 | table-view | FR-011 | FR-011 AC 업데이트 |
| /briefings | 브리핑 문서 | table-view | FR-007, FR-008, FR-014 | - |
| /briefings/{id} | 브리핑 상세 | detail | FR-007, FR-008 | - |
| /audit-log | 감사 로그 | table-view | FR-017 | - |
| **/decisions** | **의사결정 기록** | **table-view** | **FR-020** | **v2 신규** |

---

## 7. 페르소나

### P-001: Kim Dispatcher (운항관리사)
- **역할**: 24시간 교대 근무 운항관리사
- **목표**:
  - 수천 건의 NOTAM에서 운항에 중요한 것을 빠르게 식별
  - 승무원 브리핑 자료를 최소 시간에 정확하게 생성
  - AI 지원으로 항로 우회 등 정보에 기반한 의사결정
  - 수동 전사 없이 REF BOOK 기록 유지
  - 교대 인수인계 시 포괄적 요약으로 원활한 전환
  - [v2] TIFRS 기반 의사결정 근거의 체계적 문서화
- **고충점**:
  - 교대 근무 시간의 70%를 루틴 NOTAM 필터링과 해석에 소모
  - REF BOOK 수기 등재가 지루하고 오류 가능성 높음
  - 운항편당 브리핑 작성에 20~30분 소요
  - 대량 NOTAM 유입 시 중요 NOTAM 누락 우려
  - 교대 인수인계가 구두 소통에 의존 — 정보 공백 발생
  - [v2] TIFRS 의사결정 근거 문서화가 비체계적

### P-002: Park Team Lead (통제센터팀 팀장)
- **역할**: 운항관리 팀장
- **목표**:
  - 모든 교대에서 100% 긴급 NOTAM 커버리지 보장
  - NOTAM 수동 처리로 인한 팀 초과근무 감소
  - 규제 준수를 위한 NOTAM 처리 감사 추적
  - 운영 효율성 지표 개선
- **고충점**:
  - 예산 제약으로 3명 이상 팀 확대 불가
  - 교대별 품질이 운항관리사 경험에 따라 편차
  - 전체 항로 네트워크의 NOTAM 영향 통합 뷰 부재
  - 데이터 없이 운영 개선을 입증하기 어려움

---

## 8. 가정사항 (Assumptions)

1. 프로토타입은 실제 AFTN 대신 시드 데이터 사용 (NOTAM, 항로, 운항편, 공항 사전 로드)
2. REF BOOK 과거 데이터는 시드 데이터로 제공 (실제 3년치 데이터셋 아님)
3. NAVBLUE 항로 데이터는 현실적인 waypoint가 포함된 샘플 항로로 대체
4. J-FOS 연동은 범위 밖 — 독립 웹 애플리케이션으로 구현
5. 단일 사용자 역할(dispatcher) + mock auth — Cognito/SSO 미사용
6. 지도 시각화는 Leaflet 사용 (ES module import, CDN 아님) — Next.js 호환성
7. Boeing 737 단일 기종 — 기종별 분기 로직 불필요
8. AI 기능은 Amazon Bedrock Claude — 실제 LLM 호출 (모킹 금지)
9. Critical 분류 임계치 기본값 0.8 (설정 가능)
10. NOTAM 좌표는 ICAO 표준 (도/분/초)
11. UI 텍스트 한국어, NOTAM 원문 및 코드 영어
12. [v2] TIFRS = Time/Impact/Facilities/Route/Schedule (워크플로우 다이어그램 맥락에서 추론, 고객 확인 필요)
13. [v2] 중요도 색상 표준화: 빨강(#d13212)=critical, 주황(#ff9900)=high, 파랑(#0073bb)=기타
14. [v2] 대시보드 지도의 기본 항로 필터는 '전체'

---

## 9. 범위 제외 (Out of Scope)

1. 실제 AFTN 연동 또는 실시간 NOTAM 피드
2. J-FOS 시스템 연동 또는 데이터 동기화
3. NAVBLUE API 연동 — 시드 데이터 사용
4. 단일 dispatcher 역할 외의 사용자 관리/권한
5. 이메일/SMS/푸시 알림 인프라
6. 모바일 반응형 디자인 — 디스패치 워크스테이션용 데스크톱 우선
7. NOTAM 생성(발행) — 시스템은 읽기/분석 전용
8. 다중 항공사 지원 — 제주항공 전용
9. 프로덕션 배포, 스케일링, 고가용성
10. 인메모리/파일 기반 시드 데이터 외 영구 저장소
11. 한국어 외 국제화 — 단일 로케일
12. SNOWTAM/ASHTAM/BIRDTAM 특수 형식 (표준 NOTAM만)
13. 비행 계획 제출 또는 ATC 통신

---

## 10. 확인 필요 사항

| 항목 | 설명 | 상태 |
|------|------|------|
| TIFRS 정의 | 워크플로우 다이어그램에서 "TIFRS단 판단 근거"가 언급되나, 정확한 약어 풀이 및 각 항목의 정의가 PDF 요구사항 정의서에는 없음. Time/Impact/Facilities/Route/Schedule로 추론했으나 고객 확인 필요 | 확인 대기 |
| TIFRS 의사결정 양식 | FR-020의 구조화된 TIFRS 입력 필드의 구체적 형태(자유 텍스트 vs 선택형 등) 확인 필요 | 확인 대기 |
