# 프론트엔드 스펙 — 제주항공 AI NOTAM 분석 시스템

> 생성일: 2026-03-30 | 버전: v1 | 총 스펙 수: 38 (훅 14 + 컨텍스트 3 + 레이아웃 2 + 공유 7 + 기능 23 + 페이지 11)

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

### 1.1 useNotams

- **파일 경로**: `src/hooks/useNotams.ts`
- **API 엔드포인트**: `GET /api/notams`
- **요구사항**: FR-001, FR-005, FR-019

```typescript
interface UseNotamsParams {
  importance?: ImportanceLevel;
  status?: NotamStatus;
  airport?: string;
  qCode?: string;
  expiryStatus?: 'expiring-soon' | 'expired' | 'active';
  sortBy?: 'importanceScore' | 'effectiveFrom' | 'effectiveTo' | 'locationIndicator' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface UseNotamsReturn {
  data: { items: Notam[]; total: number; stats: NotamStats } | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => void;
}
```

- SWR 설정: `revalidateOnFocus: false`
- 쿼리 파라미터를 URLSearchParams로 직렬화하여 SWR key에 포함
- `mutate()`는 RefBook 등록, 분석 완료 후 목록 갱신에 사용

### 1.2 useNotam

- **파일 경로**: `src/hooks/useNotam.ts`
- **API 엔드포인트**: `GET /api/notams/[id]`
- **요구사항**: FR-002, FR-012

```typescript
function useNotam(id: string | null): {
  data: Notam | undefined;
  error: Error | undefined;
  isLoading: boolean;
}
```

- `id`가 null이면 요청하지 않음 (conditional fetching)

### 1.3 useNotamAnalysis

- **파일 경로**: `src/hooks/useNotamAnalysis.ts`
- **API 엔드포인트**: `POST /api/notams/analyze`
- **요구사항**: FR-001, FR-003

```typescript
function useNotamAnalysis(): {
  trigger: (notamId: string) => Promise<{
    importanceScore: number;
    importanceLevel: ImportanceLevel;
    aiSummary: string;
    aiAnalysis: string;
  }>;
  isMutating: boolean;
}
```

- `useSWRMutation` 사용 (POST 요청)
- Amazon Bedrock 실제 호출 — 응답까지 최대 15초 소요 가능

### 1.4 useFlights

- **파일 경로**: `src/hooks/useFlights.ts`
- **API 엔드포인트**: `GET /api/flights`
- **요구사항**: FR-004, FR-013

```typescript
interface UseFlightsParams {
  airport?: string;
  route?: string;
  date?: string;
  impactStatus?: 'affected' | 'clear' | 'all';
  sortBy?: 'flightNumber' | 'scheduledDeparture' | 'departureAirport' | 'notamImpactCount';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
```

### 1.5 useFlight

- **파일 경로**: `src/hooks/useFlight.ts`
- **API 엔드포인트**: `GET /api/flights/[id]`
- **요구사항**: FR-004, FR-013

```typescript
function useFlight(id: string): {
  data: (Flight & { route: Route; affectedNotams: Notam[] }) | undefined;
  error: Error | undefined;
  isLoading: boolean;
}
```

- 응답에 연관 Route와 영향 NOTAM이 포함됨

### 1.6 useRoutes

- **파일 경로**: `src/hooks/useRoutes.ts`
- **API 엔드포인트**: `GET /api/routes`
- **요구사항**: FR-006, FR-010

### 1.7 useRoute

- **파일 경로**: `src/hooks/useRoute.ts`
- **API 엔드포인트**: `GET /api/routes/[id]`
- **요구사항**: FR-009, FR-010

```typescript
function useRoute(id: string): {
  data: (Route & { impacts: NotamRouteImpact[]; activeNotams: Notam[] }) | undefined;
  error: Error | undefined;
  isLoading: boolean;
}
```

### 1.8 useRefBook

- **파일 경로**: `src/hooks/useRefBook.ts`
- **API 엔드포인트**: `GET /api/ref-book`
- **요구사항**: FR-011
- `mutate()`로 등록/삭제 후 목록 갱신

### 1.9 useBriefings

- **파일 경로**: `src/hooks/useBriefings.ts`
- **API 엔드포인트**: `GET /api/briefings`
- **요구사항**: FR-007, FR-008, FR-014

### 1.10 useBriefing

- **파일 경로**: `src/hooks/useBriefing.ts`
- **API 엔드포인트**: `GET /api/briefings/[id]`
- **요구사항**: FR-007, FR-008

### 1.11 useDashboard

- **파일 경로**: `src/hooks/useDashboard.ts`
- **API 엔드포인트**: `GET /api/dashboard/route-impact`
- **요구사항**: FR-006, FR-005, FR-016

```typescript
interface UseDashboardParams {
  routeId?: string;
}

interface UseDashboardReturn {
  data: {
    summary: DashboardSummary;
    routeImpacts: RouteImpactMapData[];
    criticalNotams: Notam[];
  } | undefined;
  error: Error | undefined;
  isLoading: boolean;
}
```

- SWR 설정: `refreshInterval: 30000` (30초마다 자동 갱신)

### 1.12 useAuditLog

- **파일 경로**: `src/hooks/useAuditLog.ts`
- **API 엔드포인트**: `GET /api/audit-log`
- **요구사항**: FR-017

### 1.13 useGenerateBriefing

- **파일 경로**: `src/hooks/useGenerateBriefing.ts`
- **API 엔드포인트**: `POST /api/briefings/generate`
- **요구사항**: FR-007

```typescript
function useGenerateBriefing(): {
  trigger: (params: { flightId: string; type: BriefingType }) => Promise<Briefing>;
  isMutating: boolean;
}
```

- `useSWRMutation` 사용
- Bedrock 호출로 인한 긴 응답시간 — `isMutating`으로 로딩 UI 표시 필수

### 1.14 useRouteAlternatives

- **파일 경로**: `src/hooks/useRouteAlternatives.ts`
- **API 엔드포인트**: `POST /api/routes/[id]/alternatives`
- **요구사항**: FR-009

```typescript
function useRouteAlternatives(routeId: string): {
  trigger: (notamId: string) => Promise<{ alternatives: RouteAlternative[]; reasoning: string }>;
  isMutating: boolean;
}
```

---

## 2. 컨텍스트

### 2.1 NotificationContext

- **파일 경로**: `src/contexts/NotificationContext.tsx`
- **용도**: 전역 Flashbar 알림 메시지 관리

```typescript
interface NotificationContextValue {
  notifications: FlashbarProps.MessageDefinition[];
  addNotification: (notification: FlashbarProps.MessageDefinition) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}
```

#### 동작 명세

1. `addNotification` 호출 시 notifications 배열에 추가
2. 각 notification에는 자동 생성된 id, dismissible: true 설정
3. type이 'success'인 경우 5초 후 자동 제거
4. AppLayout의 `notifications` 슬롯에서 `<Flashbar items={notifications} />` 렌더링

### 2.2 AlertContext

- **파일 경로**: `src/contexts/AlertContext.tsx`
- **용도**: Critical NOTAM 알림 배너 상태 추적
- **요구사항**: FR-016

```typescript
interface AlertContextValue {
  criticalAlerts: Notam[];
  acknowledgedIds: Set<string>;
  setCriticalAlerts: (alerts: Notam[]) => void;
  acknowledgeAlert: (notamId: string) => void;
  getUnacknowledgedAlerts: () => Notam[];
}
```

#### 동작 명세

1. DashboardPage가 마운트될 때 `GET /api/notams/alerts`로 critical NOTAM 로드
2. `setCriticalAlerts`로 상태 업데이트
3. `acknowledgeAlert` 호출 시 해당 ID를 acknowledgedIds에 추가 + `POST /api/audit-log` (action: acknowledge-alert)
4. `getUnacknowledgedAlerts`는 acknowledgedIds에 없는 criticalAlerts 반환
5. acknowledgedIds는 sessionStorage에 영속화 (새로고침 시 유지, 탭 닫으면 초기화)

### 2.3 AuthContext

- **파일 경로**: `src/contexts/AuthContext.tsx`
- **용도**: Mock 인증 — 현재 dispatcher 정보

```typescript
interface AuthContextValue {
  user: Dispatcher | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
```

#### 동작 명세

1. 앱 시작 시 `localStorage`에서 저장된 사용자 정보 복원
2. `login` 호출 시 `POST /api/auth/login` → 성공 시 user 상태 설정 + localStorage 저장
3. 프로토타입이므로 기본값으로 "김운항관리사" 자동 로그인 (편의)
4. `logout` 호출 시 user=null + localStorage 제거

---

## 3. 레이아웃

### 3.1 RootLayout

- **파일 경로**: `src/app/layout.tsx`
- **타입**: layout (Server Component)

```typescript
// "use client" 없음 — Server Component
import '@cloudscape-design/global-styles/index.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
```

- Providers는 별도 Client Component로 분리: `AuthContext` > `AlertContext` > `NotificationContext` > `SWRConfig`
- Leaflet CSS는 head에서 CDN으로 로드 (SSR 안전)

### 3.2 AppShell

- **파일 경로**: `src/components/layout/AppShell.tsx`
- **타입**: layout (`"use client"`)
- **Cloudscape 컴포넌트**: TopNavigation, AppLayout, SideNavigation, BreadcrumbGroup, Flashbar

#### TopNavigation (AppLayout 외부)

```typescript
<TopNavigation
  identity={{ title: 'NOTAM 분석 시스템', href: '/', logo: { src: '/logo.svg', alt: '제주항공' } }}
  utilities={[
    { type: 'button', iconName: 'notification', title: '알림', ariaLabel: '알림', badge: hasUnacknowledgedAlerts },
    { type: 'button', text: '교대 근무: 주간', iconName: 'user-profile' },
    {
      type: 'menu-dropdown',
      text: user?.name ?? '로그인',
      iconName: 'user-profile',
      items: [{ id: 'signout', text: '로그아웃' }],
      onItemClick: ({ detail }) => { if (detail.id === 'signout') logout(); }
    }
  ]}
/>
```

#### AppLayout

```typescript
<AppLayout
  navigation={
    <SideNavigation
      header={{ text: 'NOTAM 분석', href: '/' }}
      activeHref={pathname}
      items={sideNavItems}
      onChange={({ detail }) => router.push(detail.href)}
    />
  }
  breadcrumbs={<BreadcrumbGroup items={breadcrumbItems} />}
  notifications={<Flashbar items={notifications} />}
  content={children}
  contentType={contentType}
  toolsHide={true}
/>
```

#### SideNavigation 메뉴 구조

| 섹션 | 항목 | 경로 |
|------|------|------|
| 운항 현황 | 대시보드 | `/` |
| 운항 현황 | NOTAM 목록 | `/notams` |
| 운항 현황 | 운항편 | `/flights` |
| 항로 관리 | 항로 목록 | `/routes` |
| 문서 관리 | REF BOOK | `/ref-book` |
| 문서 관리 | 브리핑 문서 | `/briefings` |
| 관리 | 감사 로그 | `/audit-log` |

#### Breadcrumb 자동 생성

- `usePathname()` + `useParams()`로 현재 경로에서 breadcrumb 계산
- 예시: `/notams/abc-123` → `[{ text: '대시보드', href: '/' }, { text: 'NOTAM 목록', href: '/notams' }, { text: 'NOTAM 상세', href: '/notams/abc-123' }]`

---

## 4. 공유 컴포넌트

### 4.1 ImportanceBadge

- **파일 경로**: `src/components/common/ImportanceBadge.tsx`
- **요구사항**: FR-001

```typescript
interface ImportanceBadgeProps {
  level: ImportanceLevel;
}
```

| ImportanceLevel | Badge color | 한국어 라벨 |
|----------------|-------------|-------------|
| critical | red | 위험 |
| high | red | 높음 |
| medium | blue | 보통 |
| low | grey | 낮음 |
| routine | grey | 일상 |

### 4.2 NotamExpiryIndicator

- **파일 경로**: `src/components/common/NotamExpiryIndicator.tsx`
- **요구사항**: FR-019

```typescript
interface NotamExpiryIndicatorProps {
  effectiveTo: string;   // ISO-8601 또는 'PERM'
  status: NotamStatus;
}
```

#### 표시 로직

| 조건 | StatusIndicator type | 텍스트 |
|------|---------------------|--------|
| PERM | info | 영구 적용 |
| expired 또는 status='expired' | stopped | 만료됨 |
| 6시간 이내 만료 | error | `{N}시간 {M}분 남음` |
| 24시간 이내 만료 | warning | `{N}시간 남음` |
| 24시간 초과 | success | `{N}일 남음` |

### 4.3 ImportanceScoreBar

- **파일 경로**: `src/components/common/ImportanceScoreBar.tsx`
- **요구사항**: FR-001

```typescript
interface ImportanceScoreBarProps {
  score: number;       // 0.0 ~ 1.0
  showLabel?: boolean; // 기본값 true
}
```

- ProgressBar value = `score * 100`
- score >= 0.8: status="error"
- score >= 0.6: status="in-progress" (warning 색상)
- score < 0.6: status="success"
- additionalInfo: `${(score * 100).toFixed(0)}%`

### 4.4 AirportLabel

- **파일 경로**: `src/components/common/AirportLabel.tsx`

```typescript
interface AirportLabelProps {
  icaoCode: string;
  airportName?: string;
  airportNameKo?: string;
}
```

- ICAO 코드를 볼드체로 표시
- Popover로 호버 시 `airportNameKo (airportName)` 표시
- 예시: **RKSI** → 호버 → "인천국제공항 (Incheon Intl)"

### 4.5 LeafletMapWrapper

- **파일 경로**: `src/components/common/LeafletMapWrapper.tsx`
- **요구사항**: FR-006
- `"use client"` 필수

```typescript
interface LeafletMapWrapperProps {
  center: [number, number];
  zoom: number;
  height?: string;         // 기본값 '500px'
  children?: React.ReactNode;
}
```

#### 구현 핵심

1. `next/dynamic`으로 SSR 비활성화: `dynamic(() => import('./LeafletMapInner'), { ssr: false })`
2. MapContainer + TileLayer (OpenStreetMap) 기본 렌더링
3. children으로 Circle, Polyline, Marker 등 react-leaflet 컴포넌트 전달
4. Container Cloudscape 컴포넌트는 사용하지 않음 (부모에서 감싸기)

### 4.6 LoadingState

- **파일 경로**: `src/components/common/LoadingState.tsx`

```typescript
interface LoadingStateProps {
  text?: string;  // 기본값: '데이터를 불러오는 중...'
}
```

- Spinner size="large" + Box textAlign="center"

### 4.7 ErrorState

- **파일 경로**: `src/components/common/ErrorState.tsx`
- `"use client"` (onRetry 이벤트 핸들러)

```typescript
interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
}
```

- Alert type="error" + 재시도 Button (onRetry가 있을 때만)

---

## 5. 기능 컴포넌트

### 5.1 CriticalAlertBanner

- **파일 경로**: `src/components/dashboard/CriticalAlertBanner.tsx`
- **요구사항**: FR-016
- **Cloudscape 컴포넌트**: Flashbar

```typescript
// "use client"
// props 없음 — AlertContext에서 직접 읽음
```

#### Cloudscape 컴포넌트 사용

| Component | Import Path | Key Props |
|-----------|-------------|-----------|
| Flashbar | @cloudscape-design/components/flashbar | items, stackItems |

#### 동작 명세

1. 마운트 시: `AlertContext.getUnacknowledgedAlerts()`로 미확인 알림 목록 가져오기
2. 각 알림을 Flashbar MessageDefinition으로 변환:
   - type: "error"
   - header: `[위험] ${notam.locationIndicator} - ${notam.qCode}`
   - content: `notam.aiSummary ?? notam.body.substring(0, 100)`
   - action: `<Link href="/notams/${notam.id}">상세 보기</Link>`
   - dismissible: true
3. dismiss 시: `AlertContext.acknowledgeAlert(notam.id)` 호출
4. 미확인 알림이 없으면 렌더링하지 않음

### 5.2 DashboardSummaryCards

- **파일 경로**: `src/components/dashboard/DashboardSummaryCards.tsx`
- **요구사항**: FR-006, FR-005

```typescript
interface DashboardSummaryCardsProps {
  summary: DashboardSummary;
}
```

#### Cloudscape 컴포넌트 사용

| Component | Import Path | Key Props |
|-----------|-------------|-----------|
| Container | @cloudscape-design/components/container | header |
| Header | @cloudscape-design/components/header | variant="h2" |
| ColumnLayout | @cloudscape-design/components/column-layout | columns=6, variant="text-grid" |
| Box | @cloudscape-design/components/box | variant, fontSize, fontWeight, color |
| StatusIndicator | @cloudscape-design/components/status-indicator | type |

#### 카드 레이아웃

6열 ColumnLayout (text-grid variant)으로 핵심 KPI 표시:

1. **활성 NOTAM** — totalActiveNotams (info)
2. **위험 NOTAM** — criticalCount (error, 빨간색 강조)
3. **높은 중요도** — highCount (warning)
4. **영향 항로** — affectedRoutesCount (pending)
5. **영향 운항편** — affectedFlightsCount (pending)
6. **필터링 비율** — filteredVsTotalRatio (percentage 포맷)

### 5.3 RouteImpactMap

- **파일 경로**: `src/components/dashboard/RouteImpactMap.tsx`
- **요구사항**: FR-006
- `"use client"` 필수

```typescript
interface RouteImpactMapProps {
  routeImpacts: RouteImpactMapData[];
  criticalNotams: Notam[];
}
```

#### Cloudscape 컴포넌트 사용

| Component | Import Path | Key Props | Event Handlers |
|-----------|-------------|-----------|----------------|
| Container | @cloudscape-design/components/container | header | - |
| Header | @cloudscape-design/components/header | variant="h2", actions | - |
| Select | @cloudscape-design/components/select | selectedOption, options, placeholder | onChange |

#### 상태 관리

- `selectedRouteId: string | null` — 항로 선택 필터
- Select onChange: `({ detail }) => setSelectedRouteId(detail.selectedOption.value)`

#### 지도 요소

1. **NOTAM 영향 범위**: `<Circle>` — center=[lat, lng], radius=NM*1852(m 변환)
   - critical: `{ color: '#d13212', fillOpacity: 0.3 }`
   - high: `{ color: '#ff9900', fillOpacity: 0.25 }`
   - medium: `{ color: '#0972d3', fillOpacity: 0.2 }`
2. **항로 폴리라인**: `<Polyline>` — waypoints 순서대로 연결
   - 기본: `{ color: '#0972d3', weight: 2 }`
   - 선택됨: `{ color: '#0972d3', weight: 4 }`
3. **공항 마커**: `<Marker>` — 출발/도착 공항 위치
4. **교차 강조**: 영향받는 항로 구간을 `<Polyline>` 빨간색으로 오버레이
5. **NOTAM Popup**: Circle 클릭 시 Popup에 Q-Code, 요약, 링크

#### 접근성 요구사항

- 지도 Container에 `ariaLabel="항로 NOTAM 영향 지도"` 설정
- Leaflet 지도는 keyboard navigation 제한적 — Select로 항로 필터링 제공

### 5.4 RecentCriticalNotams

- **파일 경로**: `src/components/dashboard/RecentCriticalNotams.tsx`
- **요구사항**: FR-005, FR-016

```typescript
interface RecentCriticalNotamsProps {
  criticalNotams: Notam[];
}
```

- Table variant="embedded" (Container 불필요)
- enableKeyboardNavigation={true}
- 최대 10개 표시 (최근 순 정렬)
- 각 행 locationIndicator는 Link → `/notams/{id}`

### 5.5 AffectedFlightsSummary

- **파일 경로**: `src/components/dashboard/AffectedFlightsSummary.tsx`
- **요구사항**: FR-006

```typescript
interface AffectedFlightsSummaryProps {
  flights: Flight[];
}
```

- NOTAM 영향이 있는 운항편만 표시 (notamImpactCount > 0)
- flightNumber는 Link → `/flights/{id}`

### 5.6 NotamTable

- **파일 경로**: `src/components/notams/NotamTable.tsx`
- **요구사항**: FR-001, FR-002, FR-005, FR-019
- `"use client"` 필수

```typescript
interface NotamTableProps {
  notams: Notam[];
  totalCount: number;
  stats?: NotamStats;
  isLoading: boolean;
  onSelectionChange: (selectedNotam: Notam | null) => void;
}
```

#### useCollection 설정

```typescript
const { items, collectionProps, filterProps, paginationProps, propertyFilterProps } = useCollection(
  notams,
  {
    propertyFiltering: {
      filteringProperties: [
        { key: 'importanceLevel', operators: ['=', '!='], propertyLabel: '중요도', groupValuesLabel: '중요도 값' },
        { key: 'status', operators: ['=', '!='], propertyLabel: '상태', groupValuesLabel: '상태 값' },
        { key: 'locationIndicator', operators: ['=', ':'], propertyLabel: '공항', groupValuesLabel: '공항 코드' },
        { key: 'qCode', operators: ['=', ':'], propertyLabel: 'Q-Code', groupValuesLabel: 'Q-Code 값' },
        { key: 'fir', operators: ['='], propertyLabel: 'FIR', groupValuesLabel: 'FIR 값' },
        { key: 'type', operators: ['='], propertyLabel: '유형', groupValuesLabel: 'NOTAM 유형' },
      ],
    },
    sorting: {},
    pagination: { pageSize: 20 },
    selection: { trackBy: 'id' },
  }
);
```

#### 칼럼 정의 (10열)

| ID | 헤더 | 너비 | 정렬 | 셀 렌더링 |
|----|------|------|------|-----------|
| locationIndicator | 공항 | 80 | O | AirportLabel |
| qCode | Q-Code | 100 | O | 텍스트 |
| importanceScore | 점수 | 80 | O | ImportanceScoreBar |
| importanceLevel | 중요도 | 90 | O | ImportanceBadge |
| body | 내용 | 300 | - | 텍스트 (최대 100자 + ...) |
| type | 유형 | 90 | - | NOTAMN/NOTAMR/NOTAMC |
| effectiveFrom | 시작일시 | 140 | O | 날짜 포맷 |
| effectiveTo | 종료일시 | 140 | O | NotamExpiryIndicator |
| status | 상태 | 100 | - | StatusIndicator |
| fir | FIR | 70 | - | 텍스트 |

#### 이벤트 핸들러

- `onSelectionChange`: `({ detail }) => onSelectionChange(detail.selectedItems[0] ?? null)`
- `onSortingChange`: useCollection이 자동 처리

#### Header actions

- counter: `(${totalCount})` 형태
- stats 표시: `위험 ${stats.bySeverity.critical} | 높음 ${stats.bySeverity.high} | 만료임박 ${stats.expiringSoon}`

#### 빈 상태

```typescript
<Box textAlign="center" padding={{ bottom: 's' }}>
  <b>NOTAM이 없습니다</b>
  <Box variant="p">필터 조건을 변경해 보세요.</Box>
</Box>
```

### 5.7 NotamSplitPanelDetail

- **파일 경로**: `src/components/notams/NotamSplitPanelDetail.tsx`
- **요구사항**: FR-001, FR-002

```typescript
interface NotamSplitPanelDetailProps {
  notam: Notam | null;
}
```

- SplitPanel header: `${notam.locationIndicator} - ${notam.qCode}`
- closeBehavior: "hide"
- KeyValuePairs (2열): 공항, Q-Code, 중요도 점수, 중요도, 유효 기간, AI 요약
- 하단에 Link → `/notams/{id}` "전체 상세 보기"

### 5.8 NotamRawAndParsed

- **파일 경로**: `src/components/notams/NotamRawAndParsed.tsx`
- **요구사항**: FR-002, FR-012

```typescript
interface NotamRawAndParsedProps {
  notam: Notam;
}
```

- 2열 ColumnLayout
- 좌측: rawText를 `<Box variant="code">` 블록으로 표시 + CopyToClipboard
- 우측: KeyValuePairs로 파싱된 필드 (Q-Code, FIR, 교통유형, 범위, 하한/상한 고도, 좌표, 반경 등)

### 5.9 NotamAiAnalysis

- **파일 경로**: `src/components/notams/NotamAiAnalysis.tsx`
- **요구사항**: FR-001, FR-003, FR-015
- `"use client"` 필수

```typescript
interface NotamAiAnalysisProps {
  notam: Notam;
  onReanalyze: () => void;
  isAnalyzing: boolean;
}
```

#### 구조

1. Container header에 '재분석' Button (variant="normal", loading={isAnalyzing})
2. ImportanceScoreBar + ImportanceBadge 나란히
3. ExpandableSection "AI 한국어 요약" — defaultExpanded=true, content=notam.aiSummary
4. ExpandableSection "영향 분석" — defaultExpanded=false, content=notam.aiAnalysis
5. aiSummary/aiAnalysis가 null이면 StatusIndicator type="pending" + "분석 대기 중" 텍스트

### 5.10 NotamImpactSection

- **파일 경로**: `src/components/notams/NotamImpactSection.tsx`
- **요구사항**: FR-003, FR-004
- `"use client"` 필수

```typescript
interface NotamImpactSectionProps {
  notamId: string;
  affectedRoutes: NotamRouteImpact[];
  affectedFlights: NotamFlightImpact[];
}
```

- Tabs 2개: "영향받는 항로", "영향받는 운항편"
- 항로 탭 Table 칼럼: routeId (Link), overlapType, affectedSegment, distanceThroughArea, altitudeConflict (StatusIndicator)
- 운항편 탭 Table 칼럼: flightId (Link), temporalOverlap (StatusIndicator), spatialOverlap (StatusIndicator), impactSummary

### 5.11 NotamMiniMap

- **파일 경로**: `src/components/notams/NotamMiniMap.tsx`
- **요구사항**: FR-012
- `"use client"` 필수

```typescript
interface NotamMiniMapProps {
  latitude: number;
  longitude: number;
  radius: number;          // nautical miles
  locationIndicator: string;
}
```

- Container header: `"NOTAM 위치 — ${locationIndicator}"`
- LeafletMapWrapper center=[latitude, longitude], height="300px"
- Circle: radius NM*1852 변환, 빨간색 반투명
- Marker: 중심점 + Popup에 좌표, 반경 정보

### 5.12 NotamDiffView

- **파일 경로**: `src/components/notams/NotamDiffView.tsx`
- **요구사항**: FR-018

```typescript
interface NotamDiffViewProps {
  original: Notam;
  replacement: Notam;
  changes: DiffChange[];
}
```

- Container header: "NOTAM 변경 내역"
- 2열 ColumnLayout: 좌측 "원본 NOTAM", 우측 "대체 NOTAM"
- changes 배열의 각 필드를 강조: 삭제된 값은 `<Box color="text-status-error">`, 추가된 값은 `<Box color="text-status-success">`

### 5.13 FlightTable

- **파일 경로**: `src/components/flights/FlightTable.tsx`
- **요구사항**: FR-004, FR-013
- `"use client"` 필수

```typescript
interface FlightTableProps {
  flights: Flight[];
  totalCount: number;
  isLoading: boolean;
}
```

- useCollection: filtering + sorting + pagination(pageSize: 20)
- flightNumber 칼럼은 Link → `/flights/{id}`
- status 칼럼: StatusIndicator (scheduled=pending, dispatched=in-progress, in-flight=in-progress, arrived=success, cancelled=error, diverted=warning)
- notamMaxSeverity 칼럼: ImportanceBadge

### 5.14 FlightInfo

- **파일 경로**: `src/components/flights/FlightInfo.tsx`
- **요구사항**: FR-013

```typescript
interface FlightInfoProps {
  flight: Flight & { route: Route };
}
```

- Container + KeyValuePairs (3열)
- 편명, 출발 공항, 도착 공항, 출발 시간, 도착 시간, 기종, 상태, 항로명, 비행 거리

### 5.15 FlightNotamImpact

- **파일 경로**: `src/components/flights/FlightNotamImpact.tsx`
- **요구사항**: FR-004

```typescript
interface FlightNotamImpactProps {
  affectedNotams: Notam[];
}
```

- Container header: `"영향 NOTAM (${affectedNotams.length})"`
- Table with enableKeyboardNavigation
- locationIndicator, qCode, importanceLevel (ImportanceBadge), body, effectiveFrom, effectiveTo

### 5.16 FlightRouteMap

- **파일 경로**: `src/components/flights/FlightRouteMap.tsx`
- **요구사항**: FR-009
- `"use client"` 필수

```typescript
interface FlightRouteMapProps {
  route: Route;
  affectedNotams: Notam[];
  alternativeRoute: Route | null;
}
```

- Container header: "항로 지도"
- LeafletMapWrapper: 항로 waypoints 기준 자동 bounds 계산
- 원본 항로: 파란색 Polyline
- 대체 항로 (있으면): 초록색 점선 Polyline
- NOTAM 영향 범위: 빨간색 Circle
- 출발/도착 공항: Marker

### 5.17 FlightBriefingActions

- **파일 경로**: `src/components/flights/FlightBriefingActions.tsx`
- **요구사항**: FR-007, FR-008
- `"use client"` 필수

```typescript
interface FlightBriefingActionsProps {
  flightId: string;
  onBriefingGenerated: (briefing: Briefing) => void;
}
```

#### 동작 명세

1. Select로 BriefingType 선택: 운항관리사 요약 / Company NOTAM / DISP COMMENT / 승무원 브리핑
2. "브리핑 생성" Button (variant="primary", loading={isMutating})
3. 클릭 시 `useGenerateBriefing.trigger({ flightId, type })` 호출
4. 성공 시: `onBriefingGenerated(briefing)` + NotificationContext에 성공 알림
5. "전체 승무원 패키지 생성" 별도 Button → `POST /api/briefings/generate-crew`

### 5.18 RouteDeviationGuidance

- **파일 경로**: `src/components/flights/RouteDeviationGuidance.tsx`
- **요구사항**: FR-009
- `"use client"` 필수

```typescript
interface RouteDeviationGuidanceProps {
  routeId: string;
  affectedNotams: Notam[];
}
```

#### 동작 명세

1. affectedNotams 중 critical/high가 있으면 Alert type="warning" + "대체 항로 분석" Button 표시
2. Button 클릭 시 `useRouteAlternatives.trigger(highestImpactNotamId)` 호출
3. 결과 Table: 대체 항로명, 거리 차이 (+/- NM), 시간 차이 (+/- min), 회피 NOTAM 수
4. reasoning은 Alert type="info"로 표시
5. 대체 항로 없으면: "현재 항로를 유지하는 것이 최선입니다" Alert type="success"
6. critical/high NOTAM 없으면: "이 항로에 대한 중대한 NOTAM 영향이 없습니다" 텍스트

### 5.19 RouteTable

- **파일 경로**: `src/components/routes/RouteTable.tsx`
- **요구사항**: FR-010, FR-006
- `"use client"` 필수

```typescript
interface RouteTableProps {
  routes: Route[];
  totalCount: number;
  isLoading: boolean;
}
```

- useCollection: filtering + sorting + pagination(pageSize: 20)
- routeName 칼럼: Link → `/routes/{id}`
- status 칼럼: StatusIndicator (active=success, suspended=error, alternate=info)

### 5.20 RouteInfo, RouteMapVisualization, RouteNotamImpacts, RouteAlternatives

이 4개 컴포넌트는 `/routes/[id]` 상세 페이지의 하위 컴포넌트이다. Props 인터페이스와 세부 사항은 `frontend-spec.json`에 정의된 대로 구현한다.

- **RouteInfo**: KeyValuePairs로 항로 메타데이터 표시
- **RouteMapVisualization**: LeafletMapWrapper로 항로 + NOTAM 시각화
- **RouteNotamImpacts**: 영향 NOTAM 테이블 (NotamRouteImpact 기반)
- **RouteAlternatives**: 대체 항로 목록 테이블

### 5.21 RefBookTable + RefBookRegistrationModal

- **파일 경로**: `src/components/ref-book/RefBookTable.tsx`, `src/components/ref-book/RefBookRegistrationModal.tsx`
- **요구사항**: FR-011

**RefBookTable**: useCollection 기반 Table. Header actions에 "신규 등록" Button (variant="primary").

**RefBookRegistrationModal**: Modal + Form + FormField 조합.

| 필드 | 컴포넌트 | 필수 | 설명 |
|------|---------|------|------|
| notamId | Input | O | NOTAM ID (자동 채움 가능) |
| summary | Textarea | O | 요약 설명 |
| impactLevel | Select | O | 영향도 (ImportanceLevel 옵션) |
| affectedAirports | Input | O | 영향 공항 (쉼표 구분, 4자리 ICAO) |
| affectedRoutes | Input | - | 영향 항로 (쉼표 구분) |
| remarks | Textarea | - | 비고 |
| expiresAt | Input | O | 만료일시 (ISO-8601) |

- 모든 Input/Textarea는 FormField로 감싸기
- Submit 시 `POST /api/ref-book` 호출 → 성공 시 Modal 닫기 + useRefBook.mutate()

### 5.22 BriefingTable, BriefingInfo, BriefingContentPreview, BriefingApprovalActions

- **파일 경로**: `src/components/briefings/` 하위
- **요구사항**: FR-007, FR-008, FR-014

**BriefingTable**: useCollection 기반. type 칼럼 한국어 매핑: dispatcher-summary="운항관리사 요약", company-notam="Company NOTAM", disp-comment="DISP COMMENT", crew-briefing="승무원 브리핑"

**BriefingContentPreview**: Tabs로 content / dispComment / companyNotam / crewBriefing 전환. 각 탭 content는 Box padding="l"에 markdown/HTML 렌더링.

**BriefingApprovalActions**: draft/pending-review 상태에서 승인/반려 버튼 표시. approved 상태에서는 Alert type="success"로 승인 정보 표시.

### 5.23 AuditLogTable

- **파일 경로**: `src/components/audit-log/AuditLogTable.tsx`
- **요구사항**: FR-017

```typescript
interface AuditLogTableProps {
  logs: AuditLog[];
  totalCount: number;
  isLoading: boolean;
}
```

- useCollection: filtering + sorting + pagination(pageSize: 20)
- action 칼럼 한국어 매핑: view="조회", analyze="분석", approve="승인", reject="반려", register-ref-book="REF BOOK 등록", generate-briefing="브리핑 생성", acknowledge-alert="알림 확인"
- targetId 칼럼: targetType에 따라 Link 생성 (notam → /notams/{id}, flight → /flights/{id} 등)

---

## 6. 페이지 컴포넌트

### 6.1 DashboardPage (/)

- **파일 경로**: `src/app/page.tsx`
- **요구사항**: FR-006, FR-005, FR-016
- **contentType**: "dashboard"

```typescript
"use client";
// useDashboard, AlertContext 사용
```

#### 컴포넌트 구조

```
ContentLayout (header: "운항 현황 대시보드")
  SpaceBetween (size="l")
    CriticalAlertBanner
    DashboardSummaryCards (summary)
    Grid (gridDefinition)
      [colspan=8] RouteImpactMap (routeImpacts, criticalNotams)
      [colspan=4] RecentCriticalNotams (criticalNotams)
    AffectedFlightsSummary (flights from routeImpacts)
```

#### 동작 명세

1. 마운트 시: `useDashboard()` 호출 → 30초 자동 갱신
2. AlertContext.setCriticalAlerts(data.criticalNotams) 호출
3. isLoading이면 LoadingState 표시
4. error이면 ErrorState 표시 (onRetry: mutate)

### 6.2 NotamListPage (/notams)

- **파일 경로**: `src/app/notams/page.tsx`
- **요구사항**: FR-001, FR-002, FR-005, FR-019
- **contentType**: "table"

#### 동작 명세

1. `useNotams()` 호출로 NOTAM 목록 로드
2. useState로 `selectedNotam: Notam | null` 관리
3. NotamTable의 onSelectionChange로 selectedNotam 설정
4. selectedNotam이 있으면 AppLayout splitPanel에 NotamSplitPanelDetail 렌더링

### 6.3 NotamDetailPage (/notams/[id])

- **파일 경로**: `src/app/notams/[id]/page.tsx`
- **요구사항**: FR-002, FR-003, FR-012, FR-015, FR-018
- **contentType**: "default"

#### 동작 명세

1. `useNotam(id)` 호출로 NOTAM 상세 로드
2. `useNotamAnalysis()` — 재분석 기능
3. `GET /api/notams/{id}/affected-routes`, `GET /api/notams/{id}/affected-flights` — 별도 fetch
4. notam.type === 'NOTAMR' && notam.replacesNotamId 있으면 `GET /api/notams/{id}/diff` 호출 → NotamDiffView 렌더링
5. ContentLayout header: `"NOTAM 상세 — ${notam.locationIndicator} ${notam.series}${notam.number}/${notam.year}"`
6. BreadcrumbGroup: 대시보드 > NOTAM 목록 > NOTAM 상세

### 6.4 FlightListPage (/flights)

- **파일 경로**: `src/app/flights/page.tsx`
- **요구사항**: FR-004, FR-013
- **contentType**: "table"

### 6.5 FlightDetailPage (/flights/[id])

- **파일 경로**: `src/app/flights/[id]/page.tsx`
- **요구사항**: FR-004, FR-009, FR-013
- **contentType**: "default"

#### 컴포넌트 구조

```
ContentLayout (header: "운항편 상세 — {flightNumber}")
  SpaceBetween (size="l")
    FlightInfo (flight)
    FlightNotamImpact (affectedNotams)
    FlightRouteMap (route, affectedNotams, alternativeRoute)
    FlightBriefingActions (flightId, onBriefingGenerated)
    RouteDeviationGuidance (routeId, affectedNotams)
```

### 6.6 RouteListPage (/routes)

- **파일 경로**: `src/app/routes/page.tsx`
- **요구사항**: FR-010, FR-006
- **contentType**: "table"

### 6.7 RouteDetailPage (/routes/[id])

- **파일 경로**: `src/app/routes/[id]/page.tsx`
- **요구사항**: FR-009, FR-010
- **contentType**: "default"

#### 컴포넌트 구조

```
ContentLayout (header: "항로 상세 — {routeName}")
  SpaceBetween (size="l")
    RouteInfo (route)
    RouteMapVisualization (route, impacts, activeNotams)
    RouteNotamImpacts (impacts, notams)
    RouteAlternatives (routeId, alternatives, reasoning)
```

### 6.8 RefBookPage (/ref-book)

- **파일 경로**: `src/app/ref-book/page.tsx`
- **요구사항**: FR-011
- **contentType**: "table"

#### 동작 명세

1. `useRefBook()` 호출로 목록 로드
2. useState로 `modalVisible: boolean`, `prefilledNotamId: string | null` 관리
3. RefBookTable onRegisterNew: `setModalVisible(true)`
4. RefBookRegistrationModal onSubmit: `POST /api/ref-book` → mutate() → setModalVisible(false)
5. RefBookTable onDelete: `DELETE /api/ref-book/{id}` → mutate()

### 6.9 BriefingListPage (/briefings)

- **파일 경로**: `src/app/briefings/page.tsx`
- **요구사항**: FR-007, FR-008, FR-014
- **contentType**: "table"

### 6.10 BriefingDetailPage (/briefings/[id])

- **파일 경로**: `src/app/briefings/[id]/page.tsx`
- **요구사항**: FR-007, FR-008
- **contentType**: "default"

### 6.11 AuditLogPage (/audit-log)

- **파일 경로**: `src/app/audit-log/page.tsx`
- **요구사항**: FR-017
- **contentType**: "table"

---

## 공용 fetcher 함수

`src/lib/fetcher.ts`에 SWR용 공용 fetcher를 정의한다.

```typescript
/** SWR용 기본 fetcher */
export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('API 요청 실패');
    throw error;
  }
  return response.json() as Promise<T>;
}
```

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
