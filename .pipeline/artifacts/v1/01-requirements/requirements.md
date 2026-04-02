# 요구사항 분석서: 제주항공 AI NOTAM 분석 시스템

**고객**: 제주항공 (Jeju Air)
**작성일**: 2026-03-30
**버전**: 1
**분석가 노트**: 고객의 10개 요구사항을 14개 FR로 구조화하고, 도메인 리서치에서 제안된 5개 추가 FR을 포함하여 총 19개 FR을 도출하였다. P0 8개 (핵심 데모), P1 7개 (중요), P2 3개 (있으면 좋음). AI 기능은 Amazon Bedrock 실제 연동 필수.

---

## 1. 페인 포인트 (Pain Points)

| ID | 설명 | 관련 FR |
|----|------|---------|
| PP-001 | 운항관리사 3명이 24시간 교대로 하루 수천 건 NOTAM을 수동 모니터링 -- 지속 불가능한 업무량 | FR-001, FR-005, FR-010 |
| PP-002 | NOTAM이 비정형 텍스트와 약어로 구성되어 해석이 느리고 오류 발생 가능 | FR-001, FR-002, FR-015 |
| PP-003 | 중요 NOTAM을 J-FOS REF BOOK에 수기로 등재해야 함 -- 시간 소모 및 누락 위험 | FR-003, FR-005 |
| PP-004 | 긴급 NOTAM 분석 지연으로 운항 차질 리스크 존재 | FR-001, FR-005, FR-016 |
| PP-005 | 수천 건의 루틴 NOTAM 필터링에 과도한 시간 소모 | FR-005, FR-002 |
| PP-006 | 승무원 브리핑 자료(Company NOTAM, DISP COMMENT) 수동 제작의 업무 부하 | FR-007, FR-008 |
| PP-007 | 고숙련 운항관리사가 단순 해석 업무에 소모되어 항로 우회 등 고부가가치 의사결정에 집중 불가 | FR-009, FR-004, FR-006 |

---

## 2. 기능 요구사항 (Functional Requirements)

### 요약 테이블

| ID | 제목 | 우선순위 | UI 유형 | 출처 |
|----|------|----------|---------|------|
| FR-001 | LLM 기반 NOTAM 중요도 점수화 | **P0** | table-view | 고객 요구 #1 |
| FR-002 | Q-Code 기반 기본 판단 | **P0** | detail | 고객 요구 #2 |
| FR-003 | 공간/운항 스케줄 기반 종합 분석 | **P0** | detail | 고객 요구 #3 |
| FR-004 | 운항 영향편/항로 자동 매칭 | **P0** | table-view | 고객 요구 #4 |
| FR-005 | 중요 NOTAM 자동 필터링 | **P0** | table-view | 고객 요구 #5 |
| FR-006 | 항로 영향도 분석 대시보드 (지도) | **P0** | dashboard | 고객 요구 #6 |
| FR-007 | 운항관리사용 브리핑 문서 자동 생성 | **P0** | detail | 고객 요구 #7 |
| FR-008 | 승무원 브리핑 자료 자동 생성 | P1 | detail | 고객 요구 #8 |
| FR-009 | 항로 변경 의사결정 가이드 | P1 | detail | 고객 요구 #9 |
| FR-010 | NOTAM-항로/스케줄 매칭 알고리즘 | **P0** | table-view | 고객 요구 #10 |
| FR-011 | REF BOOK 관리 (디지털화) | P1 | table-view | 고객 컨텍스트 |
| FR-012 | NOTAM 상세 뷰 + AI 분석 | P1 | detail | 복합 요구 |
| FR-013 | 운항편 스케줄 조회 | P1 | table-view | 복합 요구 |
| FR-014 | 교대 인수인계 보고서 생성 | P1 | detail | 도메인 리서치 |
| FR-015 | NOTAM 평문 한국어 요약 | P1 | detail | 도메인 리서치 |
| FR-016 | 긴급 NOTAM 실시간 알림 배너 | P1 | dashboard | 도메인 리서치 |
| FR-017 | 운항관리사 행동 감사 추적 | P2 | table-view | 도메인 리서치 |
| FR-018 | NOTAM 변경 추적 (diff view) | P2 | detail | 도메인 리서치 |
| FR-019 | NOTAM 만료 자동 관리 | P2 | table-view | 도메인 리서치 |

### 우선순위 요약
- **P0 (핵심 데모)**: 8개 -- FR-001~FR-007, FR-010
- **P1 (중요)**: 8개 -- FR-008, FR-009, FR-011~FR-016
- **P2 (있으면 좋음)**: 3개 -- FR-017~FR-019

---

### FR-001: LLM 기반 NOTAM 중요도 점수화 (P0)

NOTAM 수신 시 Amazon Bedrock LLM을 사용하여 중요도 점수(0~1)를 산출한다. 과거 3년치 REF BOOK 데이터의 패턴(Q-Code, 키워드)을 RAG로 학습하여 REF BOOK 등재 대상 여부를 확률로 분류한다.

**인수 기준**:
- 각 NOTAM에 0.0~1.0 사이 중요도 점수 표시
- Amazon Bedrock LLM 실제 호출 (mocking 금지)
- critical/high/medium/low/routine 5단계 분류
- NOTAM 목록 테이블에 색상 코딩된 중요도 배지 표시
- NOTAM당 점수 산출 10초 이내

---

### FR-002: Q-Code 기반 기본 판단 (P0)

NOTAM Q-line에서 Q-Code를 추출하여 규칙 기반 초기 분류를 수행한다. LLM 분석 전 사전 필터로 활용한다 (예: QMRLC = 활주로 폐쇄 = high).

**인수 기준**:
- 모든 NOTAM에 Q-Code 추출 및 표시
- Q-Code를 사람이 읽을 수 있는 설명으로 표시
- LLM 점수화 전 규칙 기반 분류 수행
- Q-Code 조회 테이블 참조 데이터로 제공

---

### FR-003: 공간/운항 스케줄 기반 종합 분석 (P0)

공항의 맥락 정보(활주로 수, 위치)와 운항 스케줄을 결합하여 NOTAM의 종합 중요도를 분석한다. 예: 활주로 4개 공항의 1개 폐쇄 vs 활주로 1개 공항의 1개 폐쇄는 심각도가 다르다.

**인수 기준**:
- 영향 분석 시 공항 활주로 수와 시설 정보 고려
- 활성 운항 스케줄과 교차 참조
- 맥락적 심각도 설명 표시
- Bedrock LLM이 자연어 영향 요약 생성

---

### FR-004: 운항 영향편/항로 자동 매칭 (P0)

NOTAM 본문에서 공간 데이터(좌표, 반경, 고도)를 추출하고, 자사 항로(NAVBLUE 웨이포인트)와 운항 스케줄을 교차 분석하여 영향받는 운항편을 자동으로 식별한다.

**인수 기준**:
- 특정 NOTAM에 대한 영향 운항편 목록 표시
- 영향 항로 목록 표시
- 공간적 겹침(NOTAM 영역 vs 항로 경로) 고려
- 시간적 겹침(NOTAM 유효기간 vs 운항 시간) 고려
- 영향 운항편 목록에 편명, 항로, 출발 시각, 영향 유형 표시

---

### FR-005: 중요 NOTAM 자동 필터링 (P0)

수천 건의 NOTAM 중 운항에 실질적 영향을 미치는 중요 NOTAM만 자동 필터링한다. 설정 가능한 중요도 임계치로 분류한다.

**인수 기준**:
- 중요도 레벨별 필터링 지원 (critical, high, medium, low, routine)
- 기본 뷰는 critical + high만 표시
- 필터에 중요도 레벨별 NOTAM 건수 표시
- 테이블에서 중요도 점수, 시간, 공항, Q-Code별 정렬 지원
- 필터링 비율(주의 필요 / 전체) 표시

---

### FR-006: 항로 영향도 분석 대시보드 (P0)

인터랙티브 지도 위에 NOTAM 영향 영역과 항로를 오버레이하여 시각적으로 파악할 수 있는 대시보드.

**인수 기준**:
- 인터랙티브 지도에 NOTAM 영향 영역(원형: 중심 + 반경) 표시
- 항로를 웨이포인트 연결 폴리라인으로 표시
- NOTAM 영역과 항로의 교차 구간 시각적 강조
- 요약 위젯: 활성 NOTAM 수, 긴급 건수, 영향 항로 수, 영향 운항편 수
- 지도 줌/팬/클릭 NOTAM 상세보기 지원
- 항로 선택 시 해당 항로와 관련 NOTAM만 필터

---

### FR-007: 운항관리사용 브리핑 문서 자동 생성 (P0)

AI가 분석 완료된 중요 NOTAM을 요약하여 운항관리사용 결재 문서를 자동 생성한다.

**인수 기준**:
- 운항관리사가 선택한 운항편에 대해 브리핑 생성 트리거
- 생성된 브리핑에 관련 NOTAM과 AI 요약 포함
- Amazon Bedrock 실제 호출 (mocking 금지)
- 초안 상태 표시 및 검토/승인 워크플로우 지원
- 포맷된 문서 미리보기 가능

---

### FR-008: 승무원 브리핑 자료 자동 생성 (P1)

DISP COMMENT, Company NOTAM 등 승무원용 브리핑 자료 초안을 AI가 자동 생성한다.

**인수 기준**:
- 선택 운항편에 대한 DISP COMMENT 생성
- Company NOTAM 문서 생성
- 항공 용어 적절히 사용
- 운항관리사가 승인 전 편집 가능
- 동일 운항편에 대해 여러 유형 브리핑 생성 가능

---

### FR-009: 항로 변경 의사결정 가이드 (P1)

고영향 NOTAM이 항로에 영향을 줄 때 AI가 대체 항로를 제안한다. 예: 인천-방콕 노선 1번 대신 98번 루트 사용 권고.

**인수 기준**:
- 고영향 NOTAM 발생 시 대체 항로 제안
- 대안 제안에 사유와 비교 정보(거리, 시간) 포함
- Amazon Bedrock LLM이 제안 생성
- 원래 항로 vs 대안 항로를 지도에서 비교 가능
- 권고 형태로 제공 (자동 실행 아님)

---

### FR-010: NOTAM-항로/스케줄 매칭 알고리즘 (P0)

NOTAM의 시공간적 영향 범위와 자사 운항 항로/스케줄의 교차를 자동 계산하는 핵심 알고리즘.

**인수 기준**:
- NOTAM 원형 영역과 항로 폴리라인의 공간적 겹침 계산
- 고도 제한(하한/상한) 고려
- 시간적 겹침(NOTAM 유효기간 vs 운항 시각) 고려
- 영향받는 항로 구간과 통과 거리 표시
- 모든 활성 NOTAM에 대해 모든 예정 운항편과 매칭 수행

---

### FR-011: REF BOOK 관리 (P1)

종이 기반 REF BOOK을 디지털화하여 AI 제안 기반으로 운항관리사가 확인/편집/등재하는 워크플로우 제공.

**인수 기준**:
- AI가 REF BOOK 등재 대상 NOTAM을 신뢰도 점수와 함께 제안
- 운항관리사가 AI 제안을 확인/편집/거부 가능
- REF BOOK 항목 검색 및 필터링 가능
- 항목에 연결된 NOTAM 상세, 등재자, 등재 시각 표시
- 과거 REF BOOK 항목 조회 가능

---

### FR-012: NOTAM 상세 뷰 + AI 분석 (P1)

개별 NOTAM의 원문, 파싱된 필드, AI 중요도 점수, 영향 분석, 영향 운항편/항로, 평문 요약을 하나의 상세 페이지에 통합.

**인수 기준**:
- 원문 NOTAM과 파싱된 구조화 필드를 나란히 표시
- AI 중요도 점수와 분류를 눈에 띄게 표시
- 영향 운항편/항로 목록 링크
- AI 생성 평문 요약 표시
- 미니맵에 NOTAM 위치 표시

---

### FR-013: 운항편 스케줄 조회 (P1)

전체 운항 스케줄을 테이블로 조회하고, 각 운항편의 NOTAM 영향 상태를 확인.

**인수 기준**:
- 운항편 목록에 편명, 출발/도착 공항, 시각, 상태 표시
- 각 운항편에 영향 NOTAM 수와 심각도 표시
- 공항, 항로, 날짜, NOTAM 영향 상태로 필터링
- 운항편 클릭 시 NOTAM 영향 분석 상세로 이동

---

### FR-014: 교대 인수인계 보고서 생성 (P1)

교대 시점 이후 신규/변경/긴급 NOTAM을 자동 요약하여 인수인계 보고서를 생성한다.

**인수 기준**:
- 설정 가능한 시간 범위 이후 수신/변경된 NOTAM으로 보고서 생성
- NOTAM을 중요도 레벨별로 분류
- 신규 긴급 NOTAM과 상태 변경 강조
- Amazon Bedrock LLM이 생성
- 운항관리사가 조회 및 내보내기 가능

---

### FR-015: NOTAM 평문 한국어 요약 (P1)

각 NOTAM에 대해 LLM이 ICAO 약어와 Q-Code를 한국어 평문으로 번역한 요약을 생성한다.

**인수 기준**:
- 각 NOTAM에 AI 생성 한국어 평문 요약 제공
- 요약이 운항에 미치는 의미를 설명
- Amazon Bedrock 실제 호출 (mocking 금지)
- 상세 뷰에서 원문 NOTAM 옆에 요약 표시

---

### FR-016: 긴급 NOTAM 실시간 알림 배너 (P1)

중요도 임계치를 초과하는 NOTAM 수신 시 화면 상단에 눈에 띄는 알림 배너를 표시한다.

**인수 기준**:
- 긴급 NOTAM 수신 시 페이지 상단 알림 배너 표시
- 알림에 NOTAM 요약, 영향 공항/항로, 중요도 레벨 표시
- 운항관리사가 확인(acknowledge)할 때까지 유지
- 알림에서 NOTAM 상세 뷰로 링크

---

### FR-017: 운항관리사 행동 감사 추적 (P2)

NOTAM에 대한 운항관리사의 모든 행동(조회, 분석, 승인, REF BOOK 등재, 브리핑 생성)을 규제 준수를 위해 기록한다.

**인수 기준**:
- 모든 운항관리사 행동을 타임스탬프, 사용자, 행동 유형, 대상 NOTAM과 함께 기록
- 감사 로그를 검색 가능한 테이블로 조회
- 로그 항목은 변경 불가 (추가 전용)

---

### FR-018: NOTAM 변경 추적 -- diff view (P2)

대체 NOTAM(NOTAMR) 수신 시 원본 NOTAM과의 변경점을 하이라이트하는 diff 뷰를 제공한다.

**인수 기준**:
- NOTAMR에서 원본 NOTAM 링크 표시
- diff 뷰에서 추가/삭제/변경 내용 강조
- NOTAM 이력 체인 탐색 가능 (원본 -> 대체 -> 취소)

---

### FR-019: NOTAM 만료 자동 관리 (P2)

NOTAM 생애주기를 자동 관리하여 만료 카운트다운 표시 및 만료된 NOTAM 자동 아카이브.

**인수 기준**:
- NOTAM에 만료까지 남은 시간 표시
- 설정 가능한 기간 내 만료 예정 NOTAM 플래그
- 만료된 NOTAM 자동으로 아카이브 상태 전환
- 테이블에서 만료 상태별 필터링 지원

---

## 3. 비기능 요구사항 (Non-Functional Requirements)

| ID | 카테고리 | 설명 | 제약 조건 |
|----|----------|------|-----------|
| NFR-001 | 인증 | 운항관리사 접근 인증 | 프로토타입에서 mock 인증 사용. 단일 역할: 운항관리사 |
| NFR-002 | 성능 | AI 분석 응답 시간 | NOTAM당 Bedrock LLM 점수화/요약 15초 이내. 배치 처리 시 동시 실행 |
| NFR-003 | 성능 | 대시보드 렌더링 성능 | 활성 NOTAM 500건 기준 대시보드 3초 이내 로드. 지도 인터랙션 60fps |
| NFR-004 | 국제화 | 한국어 UI | 모든 UI 레이블/탐색/텍스트 한국어. NOTAM 원문은 영어(ICAO 표준). AI 요약은 한국어 |
| NFR-005 | 보안 | 보안 헤더 및 입력 검증 | Next.js 미들웨어로 보안 헤더(CSP 등) 적용. 모든 API에 zod 스키마 검증 |
| NFR-006 | 접근성 | 기본 접근성 준수 | Cloudscape 빌트인 WCAG 2.1 AA. 커스텀 지도 컴포넌트에 ARIA 레이블 |
| NFR-007 | 성능 | 시드 데이터 볼륨 | NOTAM 50건+, 항로 10개+, 운항편 30개+, 공항 15개+ 시드 데이터 |

---

## 4. 페르소나 (Personas)

### P-001: 김 운항관리사 (Flight Dispatcher)

**역할**: 운항관리사 -- 24시간 교대 근무, 3명 체제

**목표**:
- 하루 수천 건 NOTAM에서 운항에 중요한 것을 빠르게 식별
- 최소 시간에 정확한 승무원 브리핑 자료 생성
- AI 지원으로 정보에 기반한 항로 우회 결정
- 수기 작성 없이 REF BOOK 기록 유지
- 포괄적 요약으로 원활한 교대 인수인계

**고충**:
- 근무 시간의 70%를 루틴 NOTAM 필터링과 해석에 소모
- REF BOOK 수기 등재가 번거롭고 오류 발생 가능
- 운항편당 브리핑 자료 제작에 20~30분 소요
- 고량 수신 기간에 긴급 NOTAM 누락 우려
- 교대 인수인계가 구두 전달에 의존 -- 정보 누락 발생

### P-002: 박 팀장 (Dispatch Team Lead)

**역할**: 통제센터팀 팀장

**목표**:
- 모든 교대 근무에서 긴급 NOTAM 100% 커버리지 보장
- 수동 NOTAM 처리로 인한 팀 초과 근무 감소
- NOTAM 처리 감사 추적으로 규제 준수 유지
- 전반적 운영 효율 지표 개선

**고충**:
- 예산 제약으로 운항관리사 3명 이상 확대 불가
- 교대 근무별 품질이 관리사 경험에 따라 편차
- 전체 항로 네트워크에 대한 NOTAM 영향 통합 뷰 부재
- 데이터 없이 운영 개선을 입증하기 어려움

---

## 5. 데이터 모델

### 핵심 엔티티

| 엔티티 | 설명 | 주요 필드 |
|--------|------|-----------|
| **Notam** | ICAO 표준 NOTAM 전문 | id, type, qCode, fir, 위경도, 반경, 유효기간, 본문, importanceScore, status |
| **RefBookEntry** | REF BOOK 등재 기록 | id, notamId, registeredBy, summary, impactLevel, affectedAirports |
| **Flight** | 운항편 정보 | id, flightNumber, 출발/도착 공항, 예정 시각, routeId, status |
| **Route** | 항로 정보 | id, routeName, 출발/도착 공항, waypoints, distance, alternateRouteIds |
| **Waypoint** | 항로 경유지 | id, name(5자 ICAO), latitude, longitude, sequenceOrder |
| **Airport** | 공항 정보 | icaoCode, iataCode, name, 위경도, runwayCount, fir |
| **Briefing** | 브리핑 문서 | id, type, flightId, content, notamIds, status |
| **AuditLog** | 감사 로그 | id, userId, action, targetId, timestamp |
| **QCode** | Q-Code 참조 테이블 | code, subject, condition, description, defaultImportance |
| **NotamRouteImpact** | NOTAM-항로 영향 | notamId, routeId, overlapType, distanceThroughArea |
| **NotamFlightImpact** | NOTAM-운항편 영향 | notamId, flightId, temporalOverlap, spatialOverlap |

### 주요 관계
- NOTAM -> NOTAM: NOTAMR이 기존 NOTAM 대체 (자기참조)
- RefBookEntry -> Notam: 다대일
- Flight -> Route: 다대일
- Flight -> Airport: 다대일 (출발, 도착)
- Route -> Waypoint: 일대다
- Briefing -> Flight: 다대일
- Briefing -> Notam: 다대다
- NotamRouteImpact -> Notam, Route: 다대일
- NotamFlightImpact -> Notam, Flight: 다대일

---

## 6. 페이지 구조

| 경로 | 페이지 제목 | 유형 | 관련 FR |
|------|-----------|------|---------|
| `/` | 대시보드 - 항로 영향 개요 | dashboard | FR-006, FR-005, FR-016 |
| `/notams` | NOTAM 목록 | table-view | FR-001, FR-002, FR-005, FR-019 |
| `/notams/{id}` | NOTAM 상세 | detail | FR-002, FR-003, FR-012, FR-015, FR-018 |
| `/flights` | 운항편 스케줄 | table-view | FR-004, FR-013 |
| `/flights/{id}` | 운항편 상세 및 영향 | detail | FR-004, FR-009, FR-013 |
| `/routes` | 항로 목록 | table-view | FR-010, FR-006 |
| `/routes/{id}` | 항로 상세 및 NOTAM 영향 | detail | FR-009, FR-010 |
| `/ref-book` | REF BOOK 관리 | table-view | FR-011 |
| `/briefings` | 브리핑 문서 | table-view | FR-007, FR-008, FR-014 |
| `/briefings/{id}` | 브리핑 상세 및 미리보기 | detail | FR-007, FR-008 |
| `/audit-log` | 감사 로그 | table-view | FR-017 |

---

## 7. 가정사항 (Assumptions)

1. 프로토타입은 실제 AFTN 피드 대신 시드 데이터(샘플 NOTAM, 항로, 운항편, 공항)를 사전 로드하여 사용
2. REF BOOK 과거 데이터는 시드 데이터로 제공 (실제 3년치 데이터셋 아님)
3. NAVBLUE 항로 데이터는 현실적 웨이포인트가 포함된 샘플 항로 데이터로 대체
4. J-FOS 연동은 범위 밖 -- 독립 웹 애플리케이션으로 구현
5. mock 인증 사용 -- 단일 역할(운항관리사), Cognito/SSO 없음
6. 지도 시각화는 오픈소스 라이브러리(Leaflet 또는 MapLibre GL) 사용
7. Boeing 737 단일 기종 운영 -- 기종별 분기 로직 불필요
8. AI 기능은 Amazon Bedrock Claude로 구동 -- 실제 LLM 호출, mocking 금지
9. 중요도 임계치는 설정 가능하되 기본값 0.8 (critical 분류 기준)
10. NOTAM 좌표 체계는 ICAO 표준(도/분/초) 준수
11. 모든 UI 텍스트는 한국어, NOTAM 원문과 코드는 영어

---

## 8. 범위 제외 (Out of Scope)

1. 실제 AFTN 연동 또는 실시간 NOTAM 피드 수신
2. J-FOS 시스템 연동 또는 데이터 동기화
3. NAVBLUE API 연동 -- 시드 데이터로 대체
4. 단일 운항관리사 역할 외 사용자 관리, 역할, 권한
5. 이메일/SMS/푸시 알림 전송 인프라
6. 모바일 반응형 디자인 -- 운항관리 워크스테이션 대상 데스크톱 우선
7. NOTAM 발행(작성) 기능 -- 수신/분석 전용 시스템
8. 다중 항공사 지원 -- 제주항공 전용
9. 프로덕션 배포, 스케일링, 고가용성
10. 인메모리/파일 기반 시드 데이터 이상의 데이터 영속성
11. 한국어 외 국제화 -- 단일 로케일
12. SNOWTAM/ASHTAM/BIRDTAM 특수 형식 처리 (표준 NOTAM만 해당)
13. 비행계획 제출 또는 ATC 통신

---

## 9. KPI (참조)

| KPI | 현재 | 목표 | 대시보드 적용 |
|-----|------|------|-------------|
| NOTAM 처리 시간 | 15-30분/건 | 루틴 < 5분, 긴급 < 1분 | 핵심 지표 |
| 중요 NOTAM 탐지율 | 수동 | 99.5%+ | 안전 지표 |
| 오탐율 | N/A | < 10% | 효율 지표 |
| 일일 NOTAM 수신량 | 수천 건 | 추적용 | 시스템 부하 위젯 |
| 필터링 비율 | 100% 수동 | 5-15% 주의 필요 | 자동화 효과 |
| REF BOOK 등재 정확도 | N/A | > 85% | AI 품질 지표 |
| 브리핑 생성 시간 | 20-30분 | < 2분 | 시간 절감 지표 |
