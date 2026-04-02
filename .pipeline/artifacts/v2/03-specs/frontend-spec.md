# 프론트엔드 스펙 — 제주항공 AI NOTAM 분석 시스템

> 생성일: 2026-04-01 | 버전: v2 | 총 스펙 수: 44 (훅 17 + 컨텍스트 3 + 레이아웃 2 + 공유 8 + 기능 26 + 페이지 12)
>
> v2 변경 요약: v1 기반(38개) + FR-020 TIFRS 의사결정 관련 6개 신규. 8개 기존 컴포넌트에 v2 구현 완료(implemented) 표시.

---

## 목차

1. [커스텀 훅 (Hooks)](#1-커스텀-훅)
2. [컨텍스트 (Contexts)](#2-컨텍스트)
3. [레이아웃 (Layout)](#3-레이아웃)
4. [공유 컴포넌트 (Shared)](#4-공유-컴포넌트)
5. [기능 컴포넌트 (Feature)](#5-기능-컴포넌트)
6. [페이지 컴포넌트 (Pages)](#6-페이지-컴포넌트)

---

## 1. 커스텀 훅

모든 훅은 SWR 기반이며, `"use client"` 지시문이 필요하다. fetcher 함수는 공용 `src/lib/fetcher.ts`에서 import한다.

### 1.1~1.14 기존 훅 (v1 유지)

v1에서 정의한 14개 훅은 변경 없이 그대로 유지한다.

| # | 이름 | 파일 경로 | API | 요구사항 |
|---|------|-----------|-----|----------|
| 1.1 | useNotams | src/hooks/useNotams.ts | GET /api/notams | FR-001, FR-005, FR-019 |
| 1.2 | useNotam | src/hooks/useNotam.ts | GET /api/notams/[id] | FR-002, FR-012 |
| 1.3 | useNotamAnalysis | src/hooks/useNotamAnalysis.ts | POST /api/notams/analyze | FR-001, FR-003 |
| 1.4 | useFlights | src/hooks/useFlights.ts | GET /api/flights | FR-004, FR-013 |
| 1.5 | useFlight | src/hooks/useFlight.ts | GET /api/flights/[id] | FR-004, FR-013 |
| 1.6 | useRoutes | src/hooks/useRoutes.ts | GET /api/routes | FR-006, FR-010 |
| 1.7 | useRoute | src/hooks/useRoute.ts | GET /api/routes/[id] | FR-009, FR-010 |
| 1.8 | useRefBook | src/hooks/useRefBook.ts | GET /api/ref-book | FR-011 |
| 1.9 | useBriefings | src/hooks/useBriefings.ts | GET /api/briefings | FR-007, FR-008, FR-014 |
| 1.10 | useBriefing | src/hooks/useBriefing.ts | GET /api/briefings/[id] | FR-007, FR-008 |
| 1.11 | useDashboard | src/hooks/useDashboard.ts | GET /api/dashboard/route-impact | FR-006, FR-005, FR-016 |
| 1.12 | useAuditLog | src/hooks/useAuditLog.ts | GET /api/audit-log | FR-017 |
| 1.13 | useGenerateBriefing | src/hooks/useGenerateBriefing.ts | POST /api/briefings/generate | FR-007 |
| 1.14 | useRouteAlternatives | src/hooks/useRouteAlternatives.ts | POST /api/routes/[id]/alternatives | FR-009 |

### 1.15 useDecisions [v2 신규]

- **파일 경로**: `src/hooks/useDecisions.ts`
- **API 엔드포인트**: `GET /api/decisions`
- **요구사항**: FR-020

```typescript
interface UseDecisionsParams {
  decisionType?: DecisionType;
  decidedBy?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'decidedAt' | 'overallDecision' | 'decidedBy';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface UseDecisionsReturn {
  data: { items: DecisionRecord[]; total: number } | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => void;
}
```

- SWR 설정: `revalidateOnFocus: false`
- 쿼리 파라미터를 URLSearchParams로 직렬화
- `mutate()`는 의사결정 기록 후 목록 갱신에 사용

### 1.16 useNotamDecision [v2 신규]

- **파일 경로**: `src/hooks/useNotamDecision.ts`
- **API 엔드포인트**: `GET /api/notams/[id]/decision`
- **요구사항**: FR-020

```typescript
function useNotamDecision(notamId: string | null): {
  data: DecisionRecord | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => void;
}
```

- `notamId`가 null이면 요청하지 않음 (conditional fetching)
- 404 응답 시 data=undefined (에러가 아닌 빈 상태) — 아직 결정이 없는 경우
- AI 사전 분석 결과가 포함될 수 있음 (aiSuggestedDecision, aiRationale)

### 1.17 useRecordDecision [v2 신규]

- **파일 경로**: `src/hooks/useRecordDecision.ts`
- **API 엔드포인트**: `POST /api/notams/[id]/decision`
- **요구사항**: FR-020

```typescript
function useRecordDecision(notamId: string): {
  trigger: (params: CreateDecisionRecordRequest) => Promise<DecisionRecord>;
  isMutating: boolean;
}
```

- `useSWRMutation` 사용 (POST 요청)
- 성공 시: useNotamDecision.mutate() + useDecisions.mutate() 호출 필요
- Amazon Bedrock가 AI 사전 분석을 수행하므로 응답 시간이 길 수 있음 — `isMutating`으로 로딩 UI 표시 필수

---

## 2. 컨텍스트

v1과 동일 — NotificationContext, AlertContext, AuthContext. 변경 없음.

---

## 3. 레이아웃

### 3.1 RootLayout

v1과 동일. 단, Leaflet CSS는 ES module import로 변경 (CDN link 제거).

### 3.2 AppShell [v2 변경]

- **변경 사항**: SideNavigation의 "관리" 섹션에 "의사결정 기록" 링크 추가

#### SideNavigation 메뉴 구조 (v2 업데이트)

| 섹션 | 항목 | 경로 | v2 변경 |
|------|------|------|---------|
| 운항 현황 | 대시보드 | `/` | - |
| 운항 현황 | NOTAM 목록 | `/notams` | - |
| 운항 현황 | 운항편 | `/flights` | - |
| 항로 관리 | 항로 목록 | `/routes` | - |
| 문서 관리 | REF BOOK | `/ref-book` | - |
| 문서 관리 | 브리핑 문서 | `/briefings` | - |
| 관리 | **의사결정 기록** | `/decisions` | **v2 신규** |
| 관리 | 감사 로그 | `/audit-log` | - |

---

## 4. 공유 컴포넌트

### 4.1~4.7 기존 공유 컴포넌트 (v1 유지)

ImportanceBadge, NotamExpiryIndicator, ImportanceScoreBar, AirportLabel, LeafletMapWrapper, LoadingState, ErrorState — 모두 v1 사양 유지.

LeafletMapWrapper 관련 v2 NFR-008 반영 사항:
- Leaflet CSS는 ES module import 사용 (`import 'leaflet/dist/leaflet.css'`)
- `L.Icon.Default.mergeOptions()`로 marker icon 설정
- wrapper div에 `position: relative` 필수

### 4.8 DecisionTypeBadge [v2 신규]

- **파일 경로**: `src/components/common/DecisionTypeBadge.tsx`
- **요구사항**: FR-020

```typescript
interface DecisionTypeBadgeProps {
  type: DecisionType;
}
```

| DecisionType | Badge color | 한국어 라벨 |
|-------------|-------------|-------------|
| no-action | green | 조치 불요 |
| monitor | blue | 모니터링 |
| route-change | red | 항로 변경 |
| schedule-change | red | 스케줄 변경 |
| cancel-flight | red | 운항 취소 |
| divert | red | 회항 |

#### Cloudscape 컴포넌트 사용

| Component | Import Path | Key Props |
|-----------|-------------|-----------|
| Badge | @cloudscape-design/components/badge | color |

#### 파일 의존성

- src/types/decision.ts

---

## 5. 기능 컴포넌트

### 5.1~5.23 기존 기능 컴포넌트 (v1 유지)

v1에서 정의한 23개 기능 컴포넌트는 기본 사양 유지. 다음 8개는 v2에서 이미 구현 완료 표시:

| 컴포넌트 | v2 변경 사항 |
|---------|-------------|
| RouteImpactMap | 지도 범례, 클릭 팝업, info Popover, '전체' 필터, 전체 NOTAM 표시, position:relative |
| RecentCriticalNotams | critical + high 중요도 모두 표시 (기존 critical만) |
| FlightTable | status 칼럼 헤더에 info popover 추가 |
| FlightRouteMap | 중요도별 색상 코딩, 클릭 팝업 추가 |
| NotamMiniMap | 중요도 기반 색상 코딩 (대시보드와 일관) |
| RouteTable | status 칼럼 헤더에 info popover 추가 |
| LeafletMapInner | ES module CSS, mergeOptions(), position:relative |
| AuditLogTable | action 매핑에 'record-decision=의사결정 기록' 추가 |

### 5.24 NotamDecisionSection [v2 신규]

- **파일 경로**: `src/components/notams/NotamDecisionSection.tsx`
- **타입**: feature
- **요구사항**: FR-020
- **Cloudscape 패턴**: resource-management/create/form

#### Props 인터페이스

```typescript
interface NotamDecisionSectionProps {
  notamId: string;
  notam: Notam;
}
```

#### Cloudscape 컴포넌트 사용

| Component | Import Path | Key Props | Event Handlers |
|-----------|-------------|-----------|----------------|
| Container | @cloudscape-design/components/container | header | - |
| Header | @cloudscape-design/components/header | variant, actions | - |
| SpaceBetween | @cloudscape-design/components/space-between | size | - |
| FormField | @cloudscape-design/components/form-field | label, description, errorText | - |
| Input | @cloudscape-design/components/input | value, placeholder | onChange |
| Textarea | @cloudscape-design/components/textarea | value, rows | onChange |
| Select | @cloudscape-design/components/select | selectedOption, options | onChange |
| Button | @cloudscape-design/components/button | variant, loading | onClick |
| ColumnLayout | @cloudscape-design/components/column-layout | columns | - |
| Box | @cloudscape-design/components/box | variant | - |
| StatusIndicator | @cloudscape-design/components/status-indicator | type | - |
| Alert | @cloudscape-design/components/alert | type, header | - |
| ExpandableSection | @cloudscape-design/components/expandable-section | headerText, defaultExpanded | - |

#### 상태 관리

- **Local state**:
  - `tifrsTime: string = ''`
  - `tifrsImpact: string = ''`
  - `tifrsFacilities: string = ''`
  - `tifrsRoute: string = ''`
  - `tifrsSchedule: string = ''`
  - `overallDecision: DecisionType | null = null`
  - `rationale: string = ''`
  - `isEditing: boolean = false`

#### 폼 필드 정의

| 필드 | 컴포넌트 | 필수 | 설명 |
|------|---------|------|------|
| tifrsTime | Textarea (rows=2) | O | NOTAM 유효 기간이 운항에 미치는 시간적 영향 |
| tifrsImpact | Textarea (rows=2) | O | 운항 안전/정상성에 미치는 영향 심각도 |
| tifrsFacilities | Textarea (rows=2) | O | 영향받는 공항 시설, 항행 장비 등 |
| tifrsRoute | Textarea (rows=2) | O | 영향받는 항로 구간 및 대체 항로 가용성 |
| tifrsSchedule | Textarea (rows=2) | O | 운항 스케줄 변경 필요성 및 범위 |
| overallDecision | Select | O | 종합 결정 (DecisionType 옵션) |
| rationale | Textarea (rows=3) | O | 결정 근거 |

#### 동작 명세

1. **마운트 시**: `useNotamDecision(notamId)`로 기존 결정 로드
2. **기존 결정 있음**: KeyValuePairs로 읽기 전용 표시 + ExpandableSection "AI 제안"에 aiSuggestedDecision/aiRationale 표시 + Header actions에 "수정" Button
3. **기존 결정 없음**: AI 사전 분석 결과로 폼 프리필 (Alert type="info"로 "AI가 제안한 TIFRS 분석 결과입니다. 검토 후 수정하세요." 안내)
4. **폼 제출 시**: `useRecordDecision.trigger()` 호출 → 성공 시 NotificationContext에 "의사결정이 기록되었습니다" 성공 알림 + useNotamDecision.mutate()
5. **수정 모드**: "수정" Button 클릭 시 isEditing=true → 기존 값으로 폼 프리필 → 재제출 가능
6. **감사 추적**: 결정 기록 시 POST /api/audit-log (action: record-decision) 자동 호출

#### 접근성 요구사항

- 모든 FormField에 `constraintText` 또는 `description` 설정
- Select의 `ariaLabel`: "종합 결정 선택"
- Submit Button의 `ariaLabel`: "TIFRS 의사결정 기록"

#### 파일 의존성

- src/hooks/useNotamDecision.ts
- src/hooks/useRecordDecision.ts
- src/types/decision.ts
- src/types/notam.ts
- src/components/common/DecisionTypeBadge.tsx
- src/contexts/NotificationContext.tsx

### 5.25 DecisionTable [v2 신규]

- **파일 경로**: `src/components/decisions/DecisionTable.tsx`
- **타입**: feature
- **요구사항**: FR-020

#### Props 인터페이스

```typescript
interface DecisionTableProps {
  decisions: DecisionRecord[];
  totalCount: number;
  isLoading: boolean;
  onSelectionChange: (selected: DecisionRecord | null) => void;
}
```

#### useCollection 설정

```typescript
const { items, collectionProps, filterProps, paginationProps, propertyFilterProps } = useCollection(
  decisions,
  {
    propertyFiltering: {
      filteringProperties: [
        { key: 'overallDecision', operators: ['=', '!='], propertyLabel: '결정 유형', groupValuesLabel: '결정 유형 값' },
        { key: 'decidedBy', operators: ['=', ':'], propertyLabel: '결정자', groupValuesLabel: '결정자 값' },
      ],
    },
    sorting: {},
    pagination: { pageSize: 20 },
    selection: { trackBy: 'id' },
  }
);
```

#### 칼럼 정의 (7열)

| ID | 헤더 | 너비 | 정렬 | 셀 렌더링 |
|----|------|------|------|-----------|
| notamId | NOTAM | 120 | - | Link -> /notams/{notamId} |
| overallDecision | 결정 | 120 | O | DecisionTypeBadge |
| decidedBy | 결정자 | 120 | - | 텍스트 |
| decidedAt | 결정일시 | 160 | O | 날짜 포맷 |
| tifrsTime | 시간 영향 | 200 | - | 텍스트 (최대 100자 + ...) |
| tifrsImpact | 운항 영향 | 200 | - | 텍스트 (최대 100자 + ...) |
| rationale | 결정 근거 | 300 | - | 텍스트 (최대 150자 + ...) |

#### 이벤트 핸들러

- `onSelectionChange`: `({ detail }) => onSelectionChange(detail.selectedItems[0] ?? null)`
- `onSortingChange`: useCollection이 자동 처리

#### Header

- variant: "h1"
- counter: `(${totalCount})`

#### 빈 상태

```typescript
<Box textAlign="center" padding={{ bottom: 's' }}>
  <b>의사결정 기록이 없습니다</b>
  <Box variant="p">NOTAM 상세 페이지에서 TIFRS 의사결정을 기록할 수 있습니다.</Box>
</Box>
```

#### 접근성 요구사항

- enableKeyboardNavigation: true
- ariaLabel: "TIFRS 의사결정 기록 목록"

#### 파일 의존성

- @cloudscape-design/collection-hooks
- src/types/decision.ts
- src/components/common/DecisionTypeBadge.tsx

### 5.26 DecisionSplitPanelDetail [v2 신규]

- **파일 경로**: `src/components/decisions/DecisionSplitPanelDetail.tsx`
- **타입**: feature
- **요구사항**: FR-020

#### Props 인터페이스

```typescript
interface DecisionSplitPanelDetailProps {
  decision: DecisionRecord | null;
}
```

#### Cloudscape 컴포넌트 사용

| Component | Import Path | Key Props |
|-----------|-------------|-----------|
| SplitPanel | @cloudscape-design/components/split-panel | header, closeBehavior |
| KeyValuePairs | @cloudscape-design/components/key-value-pairs | items, columns |
| ColumnLayout | @cloudscape-design/components/column-layout | columns |
| Header | @cloudscape-design/components/header | variant |
| StatusIndicator | @cloudscape-design/components/status-indicator | type |
| Box | @cloudscape-design/components/box | variant |
| Link | @cloudscape-design/components/link | href |
| SpaceBetween | @cloudscape-design/components/space-between | size |

#### 동작 명세

1. decision이 null이면 SplitPanel 렌더링하지 않음
2. SplitPanel header: `"의사결정 상세 — NOTAM ${decision.notamId.substring(0, 8)}"`
3. closeBehavior: "hide"
4. 2열 ColumnLayout로 TIFRS 기준 표시:
   - 좌측: 시간(T), 운항(I), 시설(F)
   - 우측: 항로(R), 스케줄(S)
5. 하단: 종합 결정 (DecisionTypeBadge), 결정 근거, AI 제안 결정/근거
6. Link -> `/notams/{decision.notamId}` "NOTAM 상세 보기"

#### 파일 의존성

- src/types/decision.ts
- src/components/common/DecisionTypeBadge.tsx

---

## 6. 페이지 컴포넌트

### 6.1~6.11 기존 페이지 (v1 유지)

v1의 11개 페이지는 기본 구조 유지. 단, NotamDetailPage에 변경 사항 있음.

#### 6.3 NotamDetailPage (/notams/[id]) [v2 변경]

- **요구사항**: FR-002, FR-003, FR-012, FR-015, FR-018, **FR-020** (v2 추가)
- **children**: NotamRawAndParsed, NotamAiAnalysis, NotamImpactSection, NotamMiniMap, NotamDiffView, **NotamDecisionSection** (v2 추가)

v2 추가 동작:
- `useNotamDecision(id)`와 `useRecordDecision(id)` 훅 사용
- NotamDecisionSection에 `notamId={id}` `notam={notam}` 전달
- TIFRS 의사결정 기록/조회 기능 내장

#### 컴포넌트 구조 (v2 업데이트)

```
ContentLayout (header: "NOTAM 상세 - {locationIndicator} {series}{number}/{year}")
  SpaceBetween (size="l")
    NotamRawAndParsed (notam)
    NotamAiAnalysis (notam, onReanalyze, isAnalyzing)
    NotamImpactSection (notamId, affectedRoutes, affectedFlights)
    NotamMiniMap (latitude, longitude, radius, locationIndicator, importanceLevel)
    NotamDiffView (original, replacement, changes)         ← NOTAMR일 때만
    NotamDecisionSection (notamId, notam)                  ← v2 신규
```

### 6.12 DecisionListPage (/decisions) [v2 신규]

- **파일 경로**: `src/app/decisions/page.tsx`
- **요구사항**: FR-020
- **contentType**: "table"

#### 동작 명세

1. `useDecisions()` 호출로 의사결정 기록 목록 로드
2. useState로 `selectedDecision: DecisionRecord | null` 관리
3. DecisionTable의 onSelectionChange로 selectedDecision 설정
4. selectedDecision이 있으면 AppLayout splitPanel에 DecisionSplitPanelDetail 렌더링

#### 컴포넌트 구조

```
ContentLayout (header: "의사결정 기록")
  SpaceBetween (size="l")
    DecisionTable (decisions, totalCount, isLoading, onSelectionChange)
  AppLayout.splitPanel:
    DecisionSplitPanelDetail (selectedDecision)
```

#### 접근성 요구사항

- ContentLayout header의 ariaLabel: "TIFRS 의사결정 기록 관리"

#### 파일 의존성

- src/hooks/useDecisions.ts
- src/components/decisions/DecisionTable.tsx
- src/components/decisions/DecisionSplitPanelDetail.tsx

---

## 공용 fetcher 함수

v1과 동일 — `src/lib/fetcher.ts`.

---

## Cloudscape 공통 규칙 체크리스트

- [x] 모든 import는 개별 경로: `@cloudscape-design/components/{kebab-name}`
- [x] 모든 이벤트는 `({ detail }) => ...` 패턴
- [x] 모든 Table/Cards에 `useCollection` 사용
- [x] 모든 폼 입력은 `FormField`로 감싸기
- [x] 섹션 제목은 `Header` 컴포넌트 (raw HTML heading 금지)
- [x] 간격은 `SpaceBetween` (CSS margin 금지)
- [x] 상태 표시는 `StatusIndicator`
- [x] Table/Cards에 `enableKeyboardNavigation` 설정
- [x] TopNavigation은 AppLayout 외부
- [x] `"use client"`는 훅/이벤트 핸들러 사용 컴포넌트에만

---

## v2 구현 완료(implemented) 컴포넌트 목록

v1 데모 피드백을 반영하여 이미 코드가 수정된 컴포넌트. 코드 제너레이터가 재생성하지 않아야 한다.

| 컴포넌트 | 파일 경로 | 변경 요약 |
|---------|-----------|-----------|
| RouteImpactMap | src/components/dashboard/RouteImpactMap.tsx | 범례, 팝업, Popover, 전체 필터, 전체 NOTAM, position:relative |
| RecentCriticalNotams | src/components/dashboard/RecentCriticalNotams.tsx | critical+high 모두 표시 |
| FlightTable | src/components/flights/FlightTable.tsx | status 칼럼 info popover |
| FlightRouteMap | src/components/flights/FlightRouteMap.tsx | 중요도별 색상, 클릭 팝업 |
| NotamMiniMap | src/components/notams/NotamMiniMap.tsx | 중요도 기반 색상 |
| RouteTable | src/components/routes/RouteTable.tsx | status 칼럼 info popover |
| LeafletMapWrapper | src/components/common/LeafletMapWrapper.tsx | ES module CSS, mergeOptions |
| AuditLogTable | src/components/audit-log/AuditLogTable.tsx | record-decision 매핑 추가 |
