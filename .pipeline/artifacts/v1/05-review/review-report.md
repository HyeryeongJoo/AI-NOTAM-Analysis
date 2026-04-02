# 코드 리뷰 리포트 v1

## 요약
- **최종 판정**: PASS
- **리뷰 파일 수**: 152개 (src/ 하위 .ts/.tsx)
- **발견 이슈**: critical 0건, major 0건, minor 2건
- **E2E 테스트**: 52/52 통과
- **이터레이션**: 1차 (최초 리뷰)

## 빌드 검증 결과 (QA 결과 참조)

| 검증 | 결과 | 상세 |
|------|------|------|
| npm run build | PASS | 모든 라우트 정상 빌드 |
| npm run lint | PASS | 에러 0건, 경고 8건 (jsdoc/require-returns) |
| tsc --noEmit | PASS | 타입 에러 0건 |

## 카테고리별 리뷰

### 1. Cloudscape 준수 -- PASS

**검사 파일**: src/components/ 하위 39개 컴포넌트, src/app/ 하위 13개 페이지
**검사 방법**: 전체 import 경로 패턴 검색, useCollection 사용 여부, TopNavigation 위치, 이벤트 패턴 확인

**근거**:
- **개별 경로 임포트**: 배럴 임포트(`from '@cloudscape-design/components'` 뒤에 슬래시 없는 경로) 검색 결과 0건. 모든 컴포넌트가 `@cloudscape-design/components/{kebab-name}` 형태로 개별 임포트함
- **useCollection**: Table을 사용하는 13개 파일 전부에서 `@cloudscape-design/collection-hooks`의 `useCollection` 사용 확인
  - NotamTable.tsx, FlightTable.tsx, RouteTable.tsx, BriefingTable.tsx, RefBookTable.tsx, AuditLogTable.tsx, RecentCriticalNotams.tsx, AffectedFlightsSummary.tsx, FlightNotamImpact.tsx, NotamImpactSection.tsx(2회), RouteNotamImpacts.tsx, RouteAlternatives.tsx
- **TopNavigation 위치**: AppShell.tsx:141에서 TopNavigation이 `<>` 프래그먼트 직하에 위치, AppLayout 외부에 배치 확인
- **이벤트 패턴**: onChange, onSelectionChange, onFollow, onItemClick 등 모든 Cloudscape 이벤트에서 `({ detail }) => ...` 구조 분해 패턴 사용 확인 (AppShell.tsx:161, NotamTable.tsx:106, RefBookRegistrationModal.tsx:107~146, RouteImpactMap.tsx:63 등)
- **StatusIndicator**: 상태 표시에 StatusIndicator 컴포넌트 사용 (NotamTable.tsx:192~201, FlightTable.tsx:133~137 등)
- **SpaceBetween**: 커스텀 CSS 마진 대신 SpaceBetween 활용 (DashboardPage.tsx:55, RefBookRegistrationModal.tsx:105 등)
- **Header**: 모든 페이지/섹션 제목에 Cloudscape Header 컴포넌트 사용 확인

### 2. Next.js 15 규약 -- PASS

**검사 파일**: src/app/ 하위 13개 페이지, src/components/ 39개, src/hooks/ 15개, src/lib/ 26개
**검사 방법**: "use client" 지시어 분포 확인, Pages Router 패턴 검색, metadata export 확인

**근거**:
- **App Router 전용**: 모든 페이지가 `src/app/{feature}/page.tsx` 패턴. Pages Router 패턴(getServerSideProps, getStaticProps, getInitialProps) 검색 결과 0건
- **"use client" 배치**: 69개 파일에 'use client' 지시어. 모두 hooks/이벤트 핸들러/React state를 사용하는 파일에만 적용됨. Server Component 전용 파일(types, validation, repository, services, data)에는 미사용
- **layout.tsx**: src/app/layout.tsx에 Server Component로 유지, metadata export 존재 (line 16~19)
- **html lang="ko"**: 루트 레이아웃에서 한국어 설정 확인 (line 29)
- **Next.js 15 params 비동기**: API 라우트 핸들러에서 `params: Promise<{ id: string }>`로 Next.js 15의 비동기 params 패턴 정확히 사용 (notams/[id]/route.ts:18, ref-book/[id]/route.ts:19 등)

### 3. TypeScript 품질 -- PASS

**검사 파일**: src/ 하위 152개 전체
**검사 방법**: `any` 타입, `@ts-ignore`, `@ts-nocheck` 패턴 검색

**근거**:
- **any 타입**: `: any` 패턴 검색 결과 0건
- **@ts-ignore/@ts-nocheck**: 검색 결과 0건
- **타입 정의**: src/types/ 하위 12개 타입 파일에서 모든 엔티티 인터페이스 정의. Notam, Flight, Route, Airport, Briefing, RefBookEntry, AuditLog, QCode, NotamRouteImpact, NotamFlightImpact, Dashboard, Auth 등
- **Enum 타입**: Union type 방식으로 정의 (e.g., `NotamType = 'NOTAMN' | 'NOTAMR' | 'NOTAMC'`)
- **null 처리**: optional 필드에 `string | null` 타입 사용 (Notam.aiSummary, Notam.aiAnalysis, Notam.schedule, Notam.replacesNotamId)
- **strict mode**: tsconfig에서 strict 모드 활성화 전제 하에 빌드/타입체크 통과 확인

### 4. 접근성 -- PASS (WARN: ariaLabel 부분 미흡)

**검사 파일**: Table 포함 13개, 모달 1개, AppShell 1개
**검사 방법**: enableKeyboardNavigation, ariaLabel, FormField 사용 검색

**근거**:
- **enableKeyboardNavigation**: Table을 사용하는 14개 인스턴스 전부에서 `enableKeyboardNavigation={true}` 설정 확인
- **FormField**: RefBookRegistrationModal.tsx에서 모든 입력 요소(Input, Textarea, Select)가 FormField로 래핑됨 (line 106~149)
- **ariaLabel**: TopNavigation 알림 버튼에 ariaLabel 설정 (AppShell.tsx:149), RefBookTable 삭제 버튼에 ariaLabel 설정 (RefBookTable.tsx:149)
- **PropertyFilter/TextFilter i18nStrings**: NotamTable.tsx:115~128에서 한국어 i18nStrings 설정 확인
- **(WARN) ariaLabel 범위**: 일부 Table 컴포넌트에 `ariaLabel` prop 미설정. Cloudscape Table은 header text를 자동으로 accessible name으로 사용하므로 기능적 문제는 없으나, 명시적 ariaLabel 설정이 권장됨

### 5. 백엔드 품질 -- PASS

**검사 파일**: src/app/api/ 하위 31개 route.ts, src/lib/db/ 10개 repository, src/lib/validation/ 8개, src/lib/services/ 4개
**검사 방법**: HTTP 메서드, zod 검증, repository 패턴, 에러 코드, Bedrock 통합 확인

**근거**:
- **HTTP 메서드**: GET(목록/상세), POST(생성/분석), PUT(수정), DELETE(삭제) 적절히 사용. REF BOOK API에서 GET/POST/PUT/DELETE 전부 구현 (ref-book/route.ts, ref-book/[id]/route.ts)
- **zod 검증**: 8개 validation 파일에서 모든 엔티티별 요청 스키마 정의. POST/PUT 라우트에서 safeParse 사용 (notams/analyze/route.ts:26, ref-book/route.ts:40, etc.)
- **에러 응답**: 400(유효성 실패), 404(미발견), 500(서버 에러) 적절히 반환. 표준 에러 구조 `{ error, message, statusCode }` 일관 사용
- **Repository 패턴**: 모든 데이터 접근이 src/lib/db/ 하위 repository를 통해 수행. API 라우트에 직접 데이터 로직 없음. `getStore()` 싱글턴을 통한 인메모리 저장소 추상화로 DB 교체 용이
- **Bedrock 통합**: src/lib/services/bedrock.service.ts에서 실제 `BedrockRuntimeClient` 사용. Mocking 없이 InvokeModelCommand로 Claude 호출. 에러 시 Q-Code 기반 폴백 처리 (analyze/route.ts:55~66)
- **보안 미들웨어**: src/middleware.ts에서 X-Frame-Options, CSP, XSS Protection 등 보안 헤더 설정 확인

### 6. 요구사항 커버리지 -- PASS

**검사 방법**: requirements.json의 19개 FR을 프로그래밍적으로 분류 후 코드/테스트 매핑 확인

**FR 분포** (requirements.json 기반):
- P0: 7개 (FR-001~FR-007, FR-010 포함 총 8개 -- FR-010 포함)
  - FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-010
- P1: 7개 (FR-008, FR-009, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016)
- P2: 3개 (FR-017, FR-018, FR-019)

**FR별 구현 현황**:

| FR | 우선순위 | 구현 | 근거 |
|----|---------|------|------|
| FR-001 | P0 | O | NotamTable(점수/등급), bedrock.service(AI 분석), analyze API |
| FR-002 | P0 | O | NotamRawAndParsed(Q-Code 표시), qCode.service, Q-Codes API |
| FR-003 | P0 | O | NotamAiAnalysis, impact-analysis API, bedrock.service |
| FR-004 | P0 | O | FlightNotamImpact, affected-flights/affected-routes API |
| FR-005 | P0 | O | NotamTable(PropertyFilter), notam.repository(필터), stats API |
| FR-006 | P0 | O | RouteImpactMap(Leaflet), DashboardSummaryCards, dashboard API |
| FR-007 | P0 | O | FlightBriefingActions, briefings/generate API, bedrock.service |
| FR-008 | P1 | O | generate-crew API, CrewPackage, bedrock.service |
| FR-009 | P1 | O | RouteDeviationGuidance, RouteAlternatives, alternatives API |
| FR-010 | P0 | O | matching.service, matching/calculate API, matching/results API |
| FR-011 | P1 | O | RefBookTable, RefBookRegistrationModal, ref-book CRUD API |
| FR-012 | P1 | O | NotamRawAndParsed, NotamAiAnalysis, notams/[id] 상세 페이지 |
| FR-013 | P1 | O | FlightTable, FlightInfo, flights API |
| FR-014 | P1 | O | shift-handover API(POST/GET), bedrock.service |
| FR-015 | P1 | O | summarize API, bedrock.service.generateKoreanSummary |
| FR-016 | P1 | O | CriticalAlertBanner(Flashbar), AlertContext, alerts API |
| FR-017 | P2 | O | AuditLogTable, audit-log API, auditLog.repository |
| FR-018 | P2 | O | NotamDiffView, notams/[id]/diff API, notamDiff.service |
| FR-019 | P2 | O | NotamExpiryIndicator, expiryStatus 필터, notam.repository |

**19/19 FR 전부 구현 확인. P0 8개 모두 코드+테스트 커버.**

### 7. 코드 구조 -- PASS

**검사 파일**: 전체 디렉토리 구조, import 패턴
**검사 방법**: 디렉토리 규칙, 네이밍, barrel export, 순환 의존성 검증

**근거**:
- **디렉토리 규칙**: CLAUDE.md의 Directory Convention과 정확히 일치
  - src/app/ (페이지 + API), src/components/ (UI), src/types/ (공유 타입), src/lib/db/ (데이터 접근), src/lib/services/ (AWS), src/lib/validation/ (zod), src/data/ (시드), src/hooks/ (API 훅), src/contexts/ (전역 상태)
- **파일 네이밍**: 컴포넌트 PascalCase.tsx (NotamTable.tsx, FlightInfo.tsx), 유틸/훅 camelCase.ts (useDashboard.ts, fetcher.ts), API 라우트 kebab-case 디렉토리 (ref-book, audit-log)
- **barrel export 금지**: `index.ts` 파일 내 re-export 패턴 검색 결과 0건
- **파일 당 1 default export**: 모든 컴포넌트/페이지 파일이 단일 default export
- **프론트엔드 데이터 접근**: 프론트엔드 컴포넌트가 `src/lib/db/`를 직접 import하지 않음. 모든 데이터 접근은 src/hooks/를 통한 API 호출 (SWR 기반)
- **순환 의존성**: 데이터 흐름이 page -> component -> hook -> API -> repository 단방향. 컨텍스트 간 순환 없음

### 8. 주석 언어 검증 -- PASS

**검사 파일**: 전체 152개 파일 샘플링 (20개 이상 직접 확인)
**검사 방법**: 파일 헤더, JSDoc, 인라인 주석의 언어 확인

**근거**:
- **파일 헤더 주석**: 모든 확인된 파일에서 한국어 헤더 주석 존재
  - 예: `/** NOTAM 테이블 컴포넌트 */` (NotamTable.tsx:2), `/** 루트 레이아웃 */` (layout.tsx:2), `/** NOTAM 목록 API */` (api/notams/route.ts:2)
- **JSDoc 설명**: 한국어로 작성. `@param`, `@returns` 등 태그명은 영어, 설명은 한국어
  - 예: `@param request - HTTP 요청` (route.ts:18), `@returns 페이지네이션된 NOTAM 목록 + 통계` (route.ts:19)
- **인라인 주석**: 한국어로 작성 (의도 설명)
  - 예: `// Critical NOTAM 알림 컨텍스트 동기화` (page.tsx:37), `// Bedrock 호출 실패 시 Q-Code 기본값으로 폴백` (analyze/route.ts:54)
- **@requirements 태그**: 파일 헤더에 관련 FR 번호 기록 (영어 유지)

### 9. 시드 데이터 일관성 -- PASS

**검사 파일**: src/data/ 하위 10개 시드 파일, src/lib/db/store.ts
**검사 방법**: FK 참조 유효성, 데이터 볼륨, enum 값 검증

**근거**:
- **NOTAM 50건**: NFR-007 요구 "최소 50건" 충족. SEED_NOTAMS 배열 50개 항목 확인 (notam-001 ~ notam-050)
- **항로 12개**: NFR-007 요구 "10개" 초과. SEED_ROUTES 12개 확인 (route-001 ~ route-012)
- **운항편 30개**: NFR-007 요구 "30개" 충족. SEED_FLIGHTS 30개 확인 (flight-001 ~ flight-030)
- **공항 15개**: NFR-007 요구 "15개" 충족. SEED_AIRPORTS 15개 확인
- **FK 참조 유효성**:
  - Flight.routeId: 모든 30개 운항편의 routeId가 유효한 route ID 참조 (route-001~012 범위 내)
  - Flight.departureAirport/arrivalAirport: 모든 ICAO 코드가 SEED_AIRPORTS에 존재 (RKSI, RJAA, RJBB, VTBS, VVNB, RKPC, RKPK, RKSS, RPLL, ZSSS)
  - Route.departureAirport/arrivalAirport: 동일하게 유효
  - RefBookEntry.notamId: 8건 모두 유효한 notam ID 참조 (notam-001, 002, 004, 005, 011, 015, 016, 033)
  - Briefing.flightId: 5건 모두 유효 (flight-001, 004, 007, 011)
  - Briefing.notamIds: 모든 참조 NOTAM ID가 SEED_NOTAMS에 존재
  - FlightImpact: 25건의 notamId, flightId, routeId 모두 유효
  - RouteImpact: 20건의 notamId, routeId 모두 유효
  - AuditLog.userId: dispatcher-001~003 모두 SEED_DISPATCHERS에 존재
  - NOTAM.replacesNotamId: notam-021->notam-001, notam-041->notam-005 (유효)
  - Route.alternateRouteIds: 모두 SEED_ROUTES 내 유효 ID
- **enum 값 정합성**:
  - NotamType: NOTAMN(46건), NOTAMR(2건), NOTAMC(1건) -- 모두 유효
  - NotamStatus: new/active/analyzed/expired/cancelled -- 모두 정의된 값
  - ImportanceLevel: critical/high/medium/low/routine -- 모두 정의된 값
  - FlightStatus: scheduled/dispatched/in-flight/arrived -- 모두 정의된 값
  - BriefingType: dispatcher-summary/company-notam/disp-comment/crew-briefing -- 모두 정의된 값
  - BriefingStatus: draft/approved -- 정의된 값 범위 내
  - AuditAction: view/analyze/register-ref-book/generate-briefing/approve/acknowledge-alert -- 모두 정의된 값

## QA 테스트 결과 (test-result.json / test-report.md 참조)

### 이터레이션 이력

| # | 통과 | 실패 | 인프라 수정 | 기능 피드백 |
|---|------|------|-----------|-----------|
| 1 | 38 | 14 | 14건 (셀렉터/API 응답 형식) | 0건 |
| 2 | 51 | 1 | 1건 (분석 섹션 셀렉터) | 0건 |
| 3 | 52 | 0 | 1건 (타이밍 안정화) | 0건 |
| **검증** | **52** | **0** | - | - |

### P0 FR별 인터랙션 테스트 존재 여부

| FR | 제목 | 인터랙션 테스트 | 결과 |
|----|------|---------------|------|
| FR-001 | LLM 기반 NOTAM 중요도 점수 | 테이블 정렬 클릭 | PASS |
| FR-002 | Q-Code 기반 초기 분류 | NOTAM 상세 이동 | PASS |
| FR-003 | 공간/일정 기반 종합 분석 | 영향 분석 섹션 클릭 | PASS |
| FR-004 | 운항편/항로 자동 매칭 | 운항편 상세 이동 | PASS |
| FR-005 | 위험 NOTAM 자동 필터링 | 필터 인터랙션, 정렬 클릭 | PASS |
| FR-006 | 항로 영향 대시보드 + 지도 | 지도 줌, 항로 선택 | PASS |
| FR-007 | 디스패처 브리핑 자동 생성 | 생성 버튼 클릭, 상세 이동 | PASS |
| FR-010 | NOTAM-항로/일정 매칭 | 매칭 결과 API 검증 | PASS |

**P0 FR 8/8 인터랙션 테스트 100% 커버.**

### 테스트 품질 메트릭
- `waitForTimeout` 사용: 0건
- `textContent('body')` 사용: 0건
- `test.skip()` 사용: 0건
- 어서션 약화 이력: 0건
- Type 2(기능) 실패: 0건 -- 코드 제너레이터 피드백 불필요

## 발견 이슈

### [MINOR] Table 컴포넌트 ariaLabel 미설정
- **파일**: 대부분의 Table 컴포넌트 (NotamTable.tsx, FlightTable.tsx, RouteTable.tsx 등)
- **카테고리**: 접근성
- **문제**: Table 컴포넌트에 명시적 `ariaLabel` prop이 설정되지 않음
- **영향**: Cloudscape Table은 Header 텍스트를 자동으로 accessible name으로 사용하므로 기능적 문제 없음. 다만 WCAG 모범 사례상 명시적 설정이 권장됨
- **수정 방안**: 각 Table에 `ariaLabel="NOTAM 목록"` 등 추가

### [MINOR] lint 경고 8건 (jsdoc/require-returns)
- **파일**: 8개 파일 (QA 리포트 참조)
- **카테고리**: 코드 구조
- **문제**: ESLint jsdoc/require-returns 규칙 경고
- **영향**: 에러가 아닌 경고. 빌드에 영향 없음
- **수정 방안**: 해당 함수에 `@returns` JSDoc 태그 추가

## 권장 사항

- **PASS** -- 보안 점검(security-auditor-pipeline) 단계로 진행
- minor 이슈 2건은 프로토타입 수준에서 허용 범위. 핸드오버 시 개선 사항으로 기록
