# 코드 리뷰 리포트 v2

## 요약
- **최종 판정**: PASS
- **리뷰 파일 수**: 133개 (src/ 121개, e2e/ 13개)
- **발견 이슈**: critical 0건, major 0건, minor 2건
- **E2E 테스트**: 63/63 통과 (4차 이터레이션에서 전수 통과)
- **이터레이션**: 1차 (v2 최초 리뷰)

## 빌드 검증 결과 (QA 결과 참조)
| 검증 | 결과 | 상세 |
|------|------|------|
| npm run build | PASS | QA에서 빌드 통과 확인 |
| npm run lint | PASS | QA에서 린트 통과 확인 |
| tsc --noEmit | PASS | QA에서 타입 체크 통과 확인 |

## 카테고리별 리뷰

### 1. Cloudscape 준수 -- PASS

**검사 파일**: src/components/ 하위 49개 파일, src/app/ 하위 페이지 12개

**검사 방법**: 모든 import 경로 확인, useCollection 사용 여부, TopNavigation 위치 확인, 이벤트 패턴 확인

**근거**:
- **배럴 임포트 없음**: `@cloudscape-design/components` 패키지 직접 import 0건. 개별 경로 import(`@cloudscape-design/components/{name}`) 223건 (49개 파일) 확인
- **useCollection**: Table 컴포넌트가 포함된 12개 파일 모두 `useCollection` 사용 확인 (NotamTable, FlightTable, RouteTable, DecisionTable, RefBookTable, BriefingTable, AuditLogTable, RecentCriticalNotams, AffectedFlightsSummary, FlightNotamImpact, RouteNotamImpacts, NotamImpactSection)
- **TopNavigation 위치**: `src/components/layout/AppShell.tsx`에서 TopNavigation이 AppLayout 외부에 배치 (line 144-170: `<>` 프래그먼트 내 TopNavigation 먼저, AppLayout 후)
- **이벤트 패턴**: `({ detail })` 디스트럭처링 패턴 20건 (7개 파일) 확인. Cloudscape 이벤트 핸들러 전부 올바른 패턴 사용
- **StatusIndicator**: 14개 파일에서 상태 표시에 StatusIndicator 사용 확인
- **SpaceBetween**: 레이아웃 간격에 SpaceBetween 사용 (커스텀 CSS margin 미사용)
- **Header 컴포넌트**: 34개 파일에서 Cloudscape Header 사용. raw `<h1>`~`<h6>` 태그 0건

### 2. Next.js 15 규약 -- PASS

**검사 파일**: src/app/ 하위 12개 페이지, src/app/layout.tsx, src/app/api/ 하위 33개 라우트

**검사 방법**: App Router 파일 컨벤션 확인, "use client" 지시어 배치 확인, Pages Router 패턴 검색

**근거**:
- **App Router**: 모든 페이지가 `src/app/{path}/page.tsx` 패턴 준수. layout.tsx에 metadata export 확인
- **"use client"**: 훅(useState, useSWR 등) 또는 이벤트 핸들러를 사용하는 파일에만 적용. layout.tsx는 Server Component 유지
- **Pages Router 패턴 부재**: `getServerSideProps`, `getStaticProps`, `getInitialProps` 검색 결과 0건
- **Next.js 15 params 패턴**: API 라우트에서 `params: Promise<{ id: string }>` + `await params` 사용 (Next.js 15 비동기 params 호환)
- **metadata**: layout.tsx에서 `export const metadata: Metadata` 올바르게 내보냄

### 3. TypeScript 품질 -- PASS

**검사 파일**: src/ 하위 전체 121개 파일

**검사 방법**: `any` 타입, `@ts-ignore`, `@ts-nocheck` 패턴 검색. 타입 정의 파일 구조 확인

**근거**:
- **any 타입**: `: any`, `as any` 패턴 검색 결과 0건
- **@ts-ignore / @ts-nocheck**: 0건
- **타입 정의**: src/types/ 디렉토리에 13개 타입 파일 (airport, auditLog, auth, briefing, common, dashboard, decision, flight, impact, notam, qCode, refBook, route). 모든 엔티티가 인터페이스로 정의
- **v2 신규 타입**: `src/types/decision.ts`에 DecisionRecord, CreateDecisionRecordRequest, DecisionType이 올바르게 정의
- **strict 호환**: optional chaining과 null guard 패턴 적절히 사용 (예: `notam.aiAnalysis ? ... : ''`, `decision ?? null`)

### 4. 접근성 -- PASS

**검사 파일**: src/components/ 하위 테이블 14개, 폼 2개, 레이아웃 1개

**검사 방법**: enableKeyboardNavigation, ariaLabel, FormField, 제목 계층 확인

**근거**:
- **enableKeyboardNavigation**: 14개 Table/Cards 사용 파일 모두에서 `enableKeyboardNavigation={true}` 확인
- **FormField**: NotamDecisionSection.tsx에서 모든 폼 입력(7개 필드)이 `<FormField label=...>` 래핑 확인. RefBookRegistrationModal.tsx에서도 동일 패턴 확인
- **ariaLabel**: TopNavigation 알림 버튼, RefBookTable 삭제 버튼에 ariaLabel 설정. Cloudscape 컴포넌트 자체가 WCAG 2.1 AA 내장
- **제목 계층**: Cloudscape Header variant="h1" ~ "h3"로 적절한 제목 계층 유지

**참고 (minor)**: Select, TextFilter 등 일부 인터랙티브 요소에 명시적 ariaLabel이 없으나, Cloudscape가 내부적으로 placeholder/label을 aria 속성으로 매핑하므로 기능적 문제 없음

### 5. 요구사항 커버리지 -- PASS

**검사 파일**: requirements.json (20 FRs), src/ 전체

**검사 방법**: requirements.json에서 FR 목록을 프로그래밍적으로 추출하고, 각 FR의 구현 파일/API 매핑 확인

**요구사항 분포** (requirements.json 파싱):
- 전체: 20개 FR (P0: 8개, P1: 8개, P2: 4개)
- v2 신규: FR-020 (TIFRS 의사결정 기록)

| FR | 우선순위 | 구현 확인 | 근거 |
|-----|---------|---------|------|
| FR-001 | P0 | O | NotamTable, /api/notams, /api/notams/analyze |
| FR-002 | P0 | O | NotamRawAndParsed, /api/q-codes |
| FR-003 | P0 | O | NotamAiAnalysis, /api/notams/[id]/impact-analysis |
| FR-004 | P0 | O | FlightNotamImpact, /api/notams/[id]/affected-flights, affected-routes |
| FR-005 | P0 | O | NotamTable 필터링, /api/notams?importance=, /api/notams/stats |
| FR-006 | P0 | O | RouteImpactMap, DashboardSummaryCards, /api/dashboard/route-impact |
| FR-007 | P0 | O | BriefingTable, BriefingContentPreview, /api/briefings/generate |
| FR-008 | P1 | O | /api/briefings/generate-crew, /api/briefings/[id]/crew-package |
| FR-009 | P1 | O | RouteDeviationGuidance, /api/routes/[id]/alternatives |
| FR-010 | P0 | O | RouteTable, /api/matching/calculate, /api/matching/results |
| FR-011 | P1 | O | RefBookTable, RefBookRegistrationModal, /api/ref-book CRUD |
| FR-012 | P1 | O | NotamRawAndParsed, NotamAiAnalysis, NotamMiniMap |
| FR-013 | P1 | O | FlightTable, FlightInfo, /api/flights |
| FR-014 | P1 | O | /api/reports/shift-handover |
| FR-015 | P1 | O | NotamAiAnalysis, /api/notams/[id]/summarize |
| FR-016 | P1 | O | CriticalAlertBanner, /api/notams/alerts |
| FR-017 | P2 | O | AuditLogTable, /api/audit-log (POST 포함 record-decision 감사) |
| FR-018 | P2 | O | NotamDiffView, /api/notams/[id]/diff |
| FR-019 | P2 | O | NotamExpiryIndicator, /api/notams?status=expiring-soon |
| FR-020 | P2 | O | NotamDecisionSection, DecisionTable, DecisionSplitPanelDetail, /api/notams/[id]/decision, /api/decisions |

**v2 신규 기능 (FR-020) 구현 상세**:
- 타입: `src/types/decision.ts` (DecisionRecord, CreateDecisionRecordRequest, DecisionType)
- 리포지토리: `src/lib/db/decision.repository.ts` (findAll, findById, findByNotamId, create, update)
- API: `src/app/api/notams/[id]/decision/route.ts` (GET/POST), `src/app/api/decisions/route.ts` (GET)
- 검증: `src/lib/validation/decision.validation.ts` (zod 스키마)
- AI: `src/lib/services/bedrock.service.ts`의 `analyzeTifrsDecision()` (실제 Bedrock 호출)
- 컴포넌트: NotamDecisionSection (폼+결과), DecisionTable (useCollection), DecisionSplitPanelDetail (SplitPanel)
- 훅: useNotamDecision, useRecordDecision, useDecisions
- 시드: `src/data/decisions.ts` (5건)
- 페이지: `/decisions` (DecisionsPage), NOTAM 상세 페이지에 NotamDecisionSection 임베딩

### 6. 백엔드 품질 -- PASS

**검사 파일**: src/app/api/ 하위 33개 라우트, src/lib/db/ 11개 리포지토리, src/lib/validation/ 9개 스키마

**검사 방법**: HTTP 메서드, zod 검증, 에러 코드, 리포지토리 패턴 확인

**근거**:
- **HTTP 메서드**: GET/POST/PUT/DELETE 적절히 사용 (예: ref-book은 GET/POST + [id]에 PUT/DELETE)
- **zod 검증**: 모든 POST/PUT 라우트에 zod `safeParse` 검증 적용 확인. 9개 검증 파일(auditLog, auth, briefing, decision, flight, matching, notam, refBook, route)
- **에러 응답**: 400 (Validation Error), 404 (Not Found), 201 (Created) 올바르게 사용
- **리포지토리 패턴**: 모든 데이터 접근이 `src/lib/db/*.repository.ts`를 통해 이루어짐. API 라우트에 직접 데이터 조작 없음
- **비즈니스 로직 분리**: AI 분석은 bedrock.service.ts, 매칭은 matching.service.ts, Q-Code는 qCode.service.ts로 분리
- **v2 신규**: decision.repository.ts, decision.validation.ts 올바르게 추가. 감사 로그 연동 확인

### 7. 코드 구성 -- PASS

**검사 파일**: src/ 전체 121개 파일

**검사 방법**: 디렉토리 구조, 파일 네이밍, barrel export 여부, 순환 의존성 확인

**근거**:
- **디렉토리 구조**: CLAUDE.md의 Directory Convention 완전 준수 (app/, components/, types/, lib/db/, lib/services/, lib/validation/, data/, hooks/, contexts/)
- **파일 네이밍**: 컴포넌트 PascalCase.tsx (예: DecisionTable.tsx), 유틸/훅 camelCase.ts (예: useDecisions.ts), API 라우트 kebab-case 디렉토리 (예: audit-log/route.ts)
- **barrel export 없음**: src/ 내 index.ts 파일 0건
- **순환 의존성**: 프론트엔드 -> hooks -> lib/fetcher -> API -> lib/db 단방향 의존 확인. types/는 공유 레이어로 양쪽에서 import
- **v2 신규 파일 위치**: decisions/ 컴포넌트는 components/decisions/, notams/ 내 NotamDecisionSection은 components/notams/ 하위에 배치 (관련 도메인에 포함)
- **사용하지 않는 코드 없음**: RouteImpactMap에서 `_criticalNotams` (unused 파라미터)가 prefix underscore로 처리

### 8. 주석 언어 검증 -- PASS

**검사 파일**: src/ 전체 121개 파일

**검사 방법**: 파일 헤더 주석, JSDoc 설명, 인라인 주석 언어 확인

**근거**:
- **파일 헤더**: 모든 파일에 `/** ... */` 형식의 한국어 파일 헤더 주석 존재 (grep -rL "^/\*\*" 결과 0건)
- **JSDoc 설명**: export 함수/컴포넌트의 JSDoc이 한국어로 작성 (예: "의사결정 기록 테이블을 렌더링한다", "싱글턴 스토어 인스턴스를 반환한다")
- **JSDoc 태그**: `@param`, `@returns`, `@requirements` 등 태그명은 영어 유지
- **인라인 주석**: 의도 설명이 필요한 곳에만 한국어 인라인 주석 (예: "// 프로토타입: 기본 운항관리사 사용", "// 필터링 적용 -- 선택된 항로만 또는 전체")

### 9. 시드 데이터 일관성 -- PASS

**검사 파일**: src/data/ 하위 12개 시드 파일, src/lib/db/store.ts

**검사 방법**: FK 참조 유효성, 데이터 볼륨, enum 값 일관성 확인

**근거**:

**FK 참조 유효성**:
- decisions.notamId -> notams: 5건 모두 유효 (notam-001, notam-002, notam-004, notam-011, notam-023 = 시드 NOTAM에 존재)
- refBookEntries.notamId -> notams: 8건 모두 유효 (notam-001~notam-033 범위 내)
- routeImpacts.notamId -> notams: 11개 참조 모두 유효
- routeImpacts.routeId -> routes: route-001~route-012 범위 내 모두 유효
- flightImpacts.flightId -> flights: 14개 참조 모두 유효 (flight-001~flight-025 범위 내)
- flightImpacts.notamId -> notams: 16개 참조 모두 유효
- flights.routeId -> routes: 9개 고유 참조 모두 유효 (route-001~route-012)

**데이터 볼륨** (NFR-007: "최소 50 NOTAMs, 10 routes, 30 flights, 15 airports"):
- NOTAM: 50건 (요구: 50) -- 충족
- Routes: 12건 (요구: 10) -- 충족 (18개 route-관련 ID 출현이지만 고유 12개)
- Flights: 30건 (요구: 30) -- 충족
- Airports: 15건 (요구: 15) -- 충족
- Decisions (v2 신규): 5건 -- 프로토타입 시연에 적절

**enum 일관성**:
- DecisionType: seed 데이터의 overallDecision과 aiSuggestedDecision 값이 'no-action', 'monitor', 'route-change'로 모두 정의된 enum 범위 내
- ImportanceLevel, NotamStatus, FlightStatus, RouteStatus, RefBookStatus, BriefingType, BriefingStatus, AuditAction: 기존 v1 데이터에서 이미 검증 완료

## QA 테스트 결과 참조

**QA 이터레이션 이력** (test-result.json 참조):

| 이터레이션 | 통과 | 실패 | 수정 유형 |
|-----------|------|------|---------|
| 1차 | 59/63 | 4 | - |
| 2차 | 60/63 | 3 | infrastructure 4건 (셀렉터 수정) |
| 3차 | 62/63 | 1 | infrastructure 3건 (스크롤, 셀렉터) |
| 4차 | 63/63 | 0 | infrastructure 3건 (로딩 대기, TIFRS 라벨) |

- 총 63개 테스트, 63개 통과, 0개 실패
- 모든 실패는 infrastructure 유형 (Cloudscape 셀렉터 매칭, 스크롤 처리)
- functional feedback 0건 = 기능 구현에 문제 없음
- v2 신규 테스트 10건: decisions-api.spec.ts(3), decisions.spec.ts(4), notam-decision.spec.ts(3)
- FR 커버리지: 15/20 FRs (P0 8/8)

## 발견 이슈 (Minor)

### [MINOR-001] ariaLabel 명시적 설정 부족
- **파일**: 다수 컴포넌트
- **카테고리**: 접근성
- **문제**: Select, TextFilter 등 인터랙티브 요소에 명시적 ariaLabel 미설정 (2개 파일에서만 사용)
- **영향**: Cloudscape가 내부적으로 placeholder/label을 aria 속성으로 매핑하므로 기능적 문제 없음
- **권장**: 향후 접근성 감사 시 명시적 ariaLabel 추가 고려

### [MINOR-002] DecisionsPage의 SplitPanel이 AppLayout 외부에 배치
- **파일**: src/app/decisions/page.tsx:44
- **카테고리**: Cloudscape 준수
- **문제**: DecisionSplitPanelDetail이 ContentLayout 내부에 직접 렌더링됨. Cloudscape 권장 패턴은 AppLayout의 splitPanel prop을 사용하는 것
- **영향**: 프로토타입 데모에서 시각적으로 동작하지만, AppLayout splitPanel prop 사용 시 더 나은 UX 제공 가능
- **권장**: 핸드오버 시 AppLayout splitPanel prop으로 리팩토링 검토

## 권장 사항
- **PASS** -- 보안 점검 단계로 진행
- minor 이슈 2건은 프로토타입 품질에 영향 없으며, 핸드오버 시 개선사항으로 포함 가능
- v2 신규 기능(FR-020 TIFRS 의사결정)은 타입 -> 리포지토리 -> API -> 검증 -> AI -> 컴포넌트 -> 훅 -> 시드 전 레이어가 올바르게 구현됨
