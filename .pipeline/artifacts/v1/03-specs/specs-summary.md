# 스펙 요약 — 제주항공 AI NOTAM 분석 시스템

> 버전: v1 | 생성일: 2026-03-30

---

## 전체 개요

제주항공 AI NOTAM 분석 시스템의 백엔드(BE)와 프론트엔드(FE) 스펙을 정리한 문서이다. 총 19개 기능 요구사항(FR-001~FR-019)을 커버하며, 백엔드 42개 + 프론트엔드 38개 = **총 80개 스펙**으로 구성된다.

---

## 백엔드 스펙 요약

| 카테고리 | 수량 | 설명 |
|---------|------|------|
| 타입 | 30 | 공유 TypeScript 인터페이스, enum (프론트엔드도 import) |
| 검증 | 14 | zod 스키마 (API 요청 유효성 검증) |
| 시드 데이터 | 11 | 목데이터 파일 (50 NOTAM, 12 항로, 30 운항편, 15 공항 등) |
| Repository | 9 | 인메모리 데이터 접근 레이어 |
| 서비스 | 3 | Bedrock AI, 매칭 알고리즘, Q-Code 파서 |
| API 라우트 | 29 | Next.js Route Handlers (REST) |
| 미들웨어 | 1 | 보안 헤더 |

### 핵심 AI 서비스 (Amazon Bedrock)

- NOTAM 중요도 스코어링 (0.0~1.0)
- 한국어 평문 요약 생성
- 영향 분석 보고서 생성
- 브리핑 문서 자동 생성 (운항관리사 요약, Company NOTAM, DISP COMMENT, 승무원 브리핑)
- 교대 인수인계 보고서 생성
- 대체 항로 제안

### 핵심 알고리즘 (Matching Service)

- 공간 교차 계산: NOTAM 원형 영역 vs 항로 폴리라인 (Haversine 거리)
- 시간 겹침 계산: NOTAM 유효기간 vs 운항편 스케줄
- 고도 충돌 판정: NOTAM 상한/하한 vs 항로 비행고도

---

## 프론트엔드 스펙 요약

| 카테고리 | 수량 | 설명 |
|---------|------|------|
| 커스텀 훅 | 14 | SWR 기반 API 호출 (GET: useSWR, POST: useSWRMutation) |
| 컨텍스트 | 3 | NotificationContext, AlertContext, AuthContext |
| 레이아웃 | 2 | RootLayout, AppShell (TopNavigation + AppLayout) |
| 공유 컴포넌트 | 7 | ImportanceBadge, NotamExpiryIndicator, ImportanceScoreBar 등 |
| 기능 컴포넌트 | 23 | 대시보드, NOTAM, 운항편, 항로, REF BOOK, 브리핑, 감사 로그 |
| 페이지 | 11 | 11개 라우트 (App Router) |

### 페이지 구성

| 경로 | 페이지명 | 타입 | 핵심 FR |
|------|---------|------|---------|
| `/` | 대시보드 | dashboard | FR-006, FR-005, FR-016 |
| `/notams` | NOTAM 목록 | table-view | FR-001, FR-002, FR-005, FR-019 |
| `/notams/[id]` | NOTAM 상세 | detail | FR-002, FR-003, FR-012, FR-015, FR-018 |
| `/flights` | 운항편 목록 | table-view | FR-004, FR-013 |
| `/flights/[id]` | 운항편 상세 | detail | FR-004, FR-009, FR-013 |
| `/routes` | 항로 목록 | table-view | FR-010, FR-006 |
| `/routes/[id]` | 항로 상세 | detail | FR-009, FR-010 |
| `/ref-book` | REF BOOK | table-view | FR-011 |
| `/briefings` | 브리핑 목록 | table-view | FR-007, FR-008, FR-014 |
| `/briefings/[id]` | 브리핑 상세 | detail | FR-007, FR-008 |
| `/audit-log` | 감사 로그 | table-view | FR-017 |

### 핵심 UI 패턴

1. **대시보드**: KPI 카드 + Leaflet 지도 + 최근 위험 NOTAM 테이블 + 영향 운항편
2. **테이블 뷰**: PropertyFilter + useCollection(정렬/필터/페이지네이션) + SplitPanel 미리보기
3. **상세 뷰**: KeyValuePairs + ExpandableSection + Tabs + 미니 지도
4. **지도 시각화**: Leaflet Circle(NOTAM 범위) + Polyline(항로) + Marker(공항)
5. **AI 분석**: 재분석 버튼 + ImportanceScoreBar + 한국어 요약 + 영향 분석
6. **폼 입력**: Modal + Form + FormField + 유효성 검증

---

## 요구사항 커버리지

| FR | 제목 | 우선순위 | BE | FE |
|----|------|---------|----|----|
| FR-001 | LLM NOTAM 중요도 스코어링 | P0 | O | O |
| FR-002 | Q-Code 기반 분류 | P0 | O | O |
| FR-003 | 공간/스케줄 종합 분석 | P0 | O | O |
| FR-004 | 운항편/항로 자동 매칭 | P0 | O | O |
| FR-005 | 위험 NOTAM 자동 필터링 | P0 | O | O |
| FR-006 | 항로 영향 분석 대시보드 + 지도 | P0 | O | O |
| FR-007 | 운항관리사 브리핑 자동 생성 | P0 | O | O |
| FR-008 | 승무원 브리핑 자동 생성 | P1 | O | O |
| FR-009 | 대체 항로 제안 | P1 | O | O |
| FR-010 | NOTAM-항로/스케줄 매칭 알고리즘 | P0 | O | O |
| FR-011 | REF BOOK 관리 | P1 | O | O |
| FR-012 | NOTAM 상세 뷰 + AI 분석 | P1 | O | O |
| FR-013 | 운항편 스케줄 조회 | P1 | O | O |
| FR-014 | 교대 인수인계 보고서 | P1 | O | O |
| FR-015 | NOTAM 한국어 요약 | P1 | O | O |
| FR-016 | 위험 NOTAM 알림 배너 | P1 | O | O |
| FR-017 | 운항관리사 감사 로그 | P2 | O | O |
| FR-018 | NOTAM 변경 추적 (NOTAMR diff) | P2 | O | O |
| FR-019 | NOTAM 만료 관리 | P2 | O | O |

**미커버 요구사항: 없음** — 19개 FR 전체를 BE + FE에서 커버한다.

---

## 생성 순서

코드 제너레이터는 다음 순서로 파일을 생성한다. 의존성 그래프를 존중하여 참조 대상이 먼저 생성된다.

### 백엔드 (1차)

1. `types` — 공유 타입 (FE가 import하므로 가장 먼저)
2. `validation` — zod 스키마
3. `data` — 시드 데이터
4. `db` — Repository (시드 데이터 import)
5. `services` — Bedrock, Matching, QCode 서비스
6. `api` — Route Handlers (repository + service import)
7. `middleware` — 보안 헤더

### 프론트엔드 (2차)

8. `hooks` — SWR 커스텀 훅 (types import)
9. `contexts` — Context Providers
10. `layout` — RootLayout + AppShell
11. `shared` — 공유 컴포넌트 (ImportanceBadge 등)
12. `feature` — 기능 컴포넌트 (훅 + 공유 컴포넌트 import)
13. `page` — 페이지 컴포넌트 (훅 + 기능 컴포넌트 import)

---

## 기술 스택 요약

| 범주 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| UI 라이브러리 | Cloudscape Design System v3+ |
| 상태 관리 | SWR (서버 상태) + React Context (클라이언트 상태) |
| 지도 | Leaflet + react-leaflet |
| 검증 | zod |
| AI | Amazon Bedrock (Claude 3.5 Sonnet) |
| 언어 | TypeScript (strict mode) |
| UI 언어 | 한국어 |
