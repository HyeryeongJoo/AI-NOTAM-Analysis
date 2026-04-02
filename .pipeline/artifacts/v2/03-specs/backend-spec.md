# 백엔드 스펙 (v2)

> v2 이터레이션: v1 전체 백엔드 스펙을 보존하면서 TIFRS 의사결정(FR-020) 관련 컴포넌트를 추가하고, 대시보드 API의 critical+high 필터 변경을 반영한다.

## v2 변경 요약

| 변경 유형 | 대상 | 설명 |
|-----------|------|------|
| **신규** | `DecisionType` enum | no-action, monitor, route-change, schedule-change, cancel-flight, divert |
| **신규** | `DecisionRecord` interface | TIFRS 기준 의사결정 기록 |
| **신규** | `CreateDecisionRecordRequest` interface | 의사결정 생성 요청 |
| **신규** | `createDecisionRecordSchema` | zod 검증 스키마 |
| **신규** | `decisionQuerySchema` | 의사결정 목록 조회 zod 스키마 |
| **신규** | `DecisionRepository` | 의사결정 데이터 접근 레이어 |
| **신규** | `NotamDecisionAPI` | `GET,POST /api/notams/[id]/decision` |
| **신규** | `DecisionListAPI` | `GET /api/decisions` |
| **신규** | `SEED_DECISIONS` | 5건의 TIFRS 의사결정 시드 데이터 |
| **신규** | `BedrockService.analyzeTifrsDecision()` | AI TIFRS 분석 사전 입력 |
| **수정** | `AuditAction` enum | `record-decision` 값 추가 |
| **수정** | `auditLogQuerySchema`, `createAuditLogSchema` | `record-decision` 액션 추가 |
| **수정** | `SEED_AUDIT_LOGS` | 15건 -> 18건 (record-decision 3건 추가) |
| **수정** | `InMemoryStore` | `decisions: Map<string, DecisionRecord>` 추가 |
| **구현완료** | `DashboardRouteImpactAPI` | criticalNotams에 high importance 포함 (이미 코드 적용됨) |

---

## 타입 정의

### src/types/decision.ts [v2 신규]

#### 메타데이터
- **파일 경로**: `src/types/decision.ts`
- **타입**: type-definition
- **요구사항**: FR-020

#### DecisionType enum

```typescript
export type DecisionType =
  | 'no-action'
  | 'monitor'
  | 'route-change'
  | 'schedule-change'
  | 'cancel-flight'
  | 'divert';
```

#### DecisionRecord interface

```typescript
export interface DecisionRecord {
  /** 고유 식별자 */
  id: string;
  /** 대상 NOTAM ID */
  notamId: string;
  /** 의사결정자 (운항관리사 이름) */
  decidedBy: string;
  /** 의사결정 시각 (ISO-8601) */
  decidedAt: string;
  /** TIFRS - 시간 영향 평가 */
  tifrsTime: string;
  /** TIFRS - 운항 영향 심각도 */
  tifrsImpact: string;
  /** TIFRS - 영향 받는 시설 */
  tifrsFacilities: string;
  /** TIFRS - 영향 받는 항로 구간 */
  tifrsRoute: string;
  /** TIFRS - 운항 스케줄 교란 수준 */
  tifrsSchedule: string;
  /** 최종 결정 유형 */
  overallDecision: DecisionType;
  /** 의사결정 근거 (운항관리사 작성) */
  rationale: string;
  /** AI 제안 결정 유형 */
  aiSuggestedDecision: DecisionType;
  /** AI 제안 근거 */
  aiRationale: string;
}
```

#### CreateDecisionRecordRequest interface

```typescript
export interface CreateDecisionRecordRequest {
  /** 대상 NOTAM ID */
  notamId: string;
  /** TIFRS - 시간 영향 */
  tifrsTime: string;
  /** TIFRS - 운항 영향 */
  tifrsImpact: string;
  /** TIFRS - 시설 영향 */
  tifrsFacilities: string;
  /** TIFRS - 항로 영향 */
  tifrsRoute: string;
  /** TIFRS - 스케줄 영향 */
  tifrsSchedule: string;
  /** 최종 결정 */
  overallDecision: DecisionType;
  /** 결정 근거 */
  rationale: string;
}
```

### src/types/auditLog.ts [v2 수정]

#### AuditAction enum 변경

```typescript
// v1에서 v2로 변경: 'record-decision' 추가
export type AuditAction =
  | 'view'
  | 'analyze'
  | 'approve'
  | 'reject'
  | 'register-ref-book'
  | 'generate-briefing'
  | 'acknowledge-alert'
  | 'record-decision';  // [v2] TIFRS 의사결정 기록
```

---

## 요청 검증 (zod)

### src/lib/validation/decision.validation.ts [v2 신규]

#### 메타데이터
- **파일 경로**: `src/lib/validation/decision.validation.ts`
- **타입**: validation
- **요구사항**: FR-020

#### createDecisionRecordSchema

```typescript
import { z } from 'zod';

export const createDecisionRecordSchema = z.object({
  notamId: z.string().uuid(),
  tifrsTime: z.string().min(1).max(1000),
  tifrsImpact: z.string().min(1).max(1000),
  tifrsFacilities: z.string().min(1).max(1000),
  tifrsRoute: z.string().min(1).max(1000),
  tifrsSchedule: z.string().min(1).max(1000),
  overallDecision: z.enum([
    'no-action', 'monitor', 'route-change',
    'schedule-change', 'cancel-flight', 'divert'
  ]),
  rationale: z.string().min(1).max(2000),
});
```

#### decisionQuerySchema

```typescript
export const decisionQuerySchema = z.object({
  decisionType: z.enum([
    'no-action', 'monitor', 'route-change',
    'schedule-change', 'cancel-flight', 'divert'
  ]).optional(),
  decidedBy: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['decidedAt', 'overallDecision', 'notamId']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});
```

### src/lib/validation/auditLog.validation.ts [v2 수정]

`auditLogQuerySchema`와 `createAuditLogSchema`의 `action` 필드에 `'record-decision'` 추가:

```typescript
// 기존 enum 값에 'record-decision' 추가
action: z.enum([
  'view', 'analyze', 'approve', 'reject',
  'register-ref-book', 'generate-briefing',
  'acknowledge-alert', 'record-decision'  // [v2]
]).optional()
```

---

## 시드 데이터

### src/data/decisions.ts [v2 신규]

#### 메타데이터
- **파일 경로**: `src/data/decisions.ts`
- **타입**: seed-data
- **요구사항**: FR-020
- **데이터 건수**: 5건

#### 설명
5건의 TIFRS 의사결정 시드 데이터. 기존 SEED_NOTAMS의 critical/high NOTAM ID와 연결된다.

```typescript
export const SEED_DECISIONS: DecisionRecord[] = [
  {
    id: 'dec-001',
    notamId: '/* critical NOTAM의 ID - SEED_NOTAMS에서 참조 */',
    decidedBy: 'Kim Dispatcher',
    decidedAt: '2026-03-31T09:30:00Z',
    tifrsTime: 'NOTAM 유효기간이 향후 24시간 내 시작 - 즉시 대응 필요',
    tifrsImpact: '활주로 폐쇄로 이착륙 불가 - 심각도 최고',
    tifrsFacilities: 'RKSI 활주로 33L 폐쇄, 33R 단독 운영',
    tifrsRoute: 'ICN 출도착 전 노선 영향, 특히 ICN-NRT, ICN-BKK',
    tifrsSchedule: '오전 08:00-14:00 슬롯 지연 예상, 7C101/7C201 직접 영향',
    overallDecision: 'monitor',
    rationale: '33R 단독 운영으로 처리 가능하나 지연 모니터링 필요',
    aiSuggestedDecision: 'monitor',
    aiRationale: 'ICN은 2개 활주로 보유. 1개 폐쇄 시 용량 50% 감소하나 운항 가능. 지연 모니터링 권장.'
  },
  // ... 4건 추가 (route-change, no-action, schedule-change, monitor)
];
```

#### 의사결정 유형 분포
| DecisionType | 건수 | 시나리오 |
|-------------|------|---------|
| no-action | 1 | 낮은 중요도 NOTAM, 운항에 영향 없음 |
| monitor | 2 | 활주로 일부 폐쇄, 항행시설 점검 등 상황 주시 필요 |
| route-change | 1 | 공역 제한으로 대체 항로 사용 결정 |
| schedule-change | 1 | 시설 점검으로 운항 시간 조정 |

### src/data/auditLogs.ts [v2 수정]

- 기존 15건에 3건 추가 (총 18건)
- 추가 3건은 `action: 'record-decision'`, `targetType: 'decision'`
- SEED_DECISIONS의 ID와 연결

---

## 데이터베이스 (인메모리 스토어)

### src/lib/db/store.ts [v2 수정]

#### Store 인터페이스 변경

```typescript
interface Store {
  // ... 기존 v1 필드 모두 유지
  notams: Map<string, Notam>;
  refBookEntries: Map<string, RefBookEntry>;
  flights: Map<string, Flight>;
  routes: Map<string, Route>;
  airports: Map<string, Airport>;
  qCodes: Map<string, QCode>;
  briefings: Map<string, Briefing>;
  auditLogs: AuditLog[];
  routeImpacts: NotamRouteImpact[];
  flightImpacts: NotamFlightImpact[];
  dispatchers: Map<string, Dispatcher>;
  decisions: Map<string, DecisionRecord>;  // [v2] 신규
}
```

초기화 시 `SEED_DECISIONS`에서 `decisions` Map을 구성한다.

### src/lib/db/decision.repository.ts [v2 신규]

#### 메타데이터
- **파일 경로**: `src/lib/db/decision.repository.ts`
- **타입**: repository
- **요구사항**: FR-020

#### Repository 인터페이스

```typescript
/**
 * TIFRS 의사결정 기록 데이터 접근 레이어
 * NOTAM별 1개 의사결정 원칙 (findByNotamId로 검색)
 */

/** 필터, 정렬, 페이지네이션을 적용한 의사결정 목록 조회 */
export function findAll(params: {
  decisionType?: DecisionType;
  decidedBy?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  order?: string;
  page: number;
  pageSize: number;
}): { items: DecisionRecord[]; total: number };

/** ID로 단건 조회 */
export function findById(id: string): DecisionRecord | undefined;

/** NOTAM ID로 의사결정 조회 (NOTAM당 1건) */
export function findByNotamId(notamId: string): DecisionRecord | undefined;

/** 의사결정 생성 (AI 제안 + 운항관리사 확인) */
export function create(data: CreateDecisionRecordRequest & {
  decidedBy: string;
  aiSuggestedDecision: DecisionType;
  aiRationale: string;
}): DecisionRecord;

/** 의사결정 수정 */
export function update(
  id: string,
  data: Partial<DecisionRecord>
): DecisionRecord | undefined;
```

#### 파일 의존성
- `src/lib/db/store.ts`
- `src/types/decision.ts`

---

## 서비스

### src/lib/services/bedrock.service.ts [v2 수정]

#### 신규 함수: analyzeTifrsDecision

```typescript
/**
 * NOTAM에 대한 TIFRS 의사결정 기준을 AI가 사전 분석하여 제안
 * Amazon Bedrock Claude로 실제 LLM 호출 (모킹 금지)
 *
 * TIFRS = Time / Impact / Facilities / Route / Schedule
 */
export async function analyzeTifrsDecision(
  notam: Notam,
  affectedRoutes: NotamRouteImpact[],
  affectedFlights: NotamFlightImpact[],
  airport: Airport | undefined
): Promise<{
  suggestedDecision: DecisionType;
  tifrsTime: string;
  tifrsImpact: string;
  tifrsFacilities: string;
  tifrsRoute: string;
  tifrsSchedule: string;
  rationale: string;
}>;
```

#### 프롬프트 설계 가이드라인

시스템 프롬프트에 포함할 내용:
1. **역할**: 항공 운항관리 전문가로서 NOTAM 분석 수행
2. **TIFRS 프레임워크 설명**: 각 기준(Time, Impact, Facilities, Route, Schedule)의 의미와 평가 관점
3. **DecisionType 선택 기준**:
   - `no-action`: 운항에 영향 없음 (routine/low importance)
   - `monitor`: 상황 주시 필요 (medium importance 또는 간접 영향)
   - `route-change`: 항로 변경 필요 (공역 제한, 경로 상 장애)
   - `schedule-change`: 시간 조정 필요 (시설 점검 시간대 회피)
   - `cancel-flight`: 운항 취소 필요 (복수 심각한 제한)
   - `divert`: 회항/목적지 변경 필요 (목적 공항 사용 불가)
4. **입력 컨텍스트**: NOTAM 원문, Q-Code 분류, 공항 정보(활주로 수), 영향 항로/편 수
5. **출력 형식**: JSON 구조화 응답 (각 TIFRS 필드 한국어, suggestedDecision 영어 enum)

#### 파일 의존성 추가
- `src/types/decision.ts` (기존 의존성에 추가)

---

## API 라우트

### /api/notams/[id]/decision [v2 신규]

#### 메타데이터
- **파일 경로**: `src/app/api/notams/[id]/decision/route.ts`
- **타입**: api-route
- **요구사항**: FR-020, FR-017

#### 엔드포인트

| Method | Path | 설명 | Request Body | Response |
|--------|------|------|-------------|----------|
| GET | `/api/notams/[id]/decision` | 해당 NOTAM의 의사결정 조회 | - | `DecisionRecord` |
| POST | `/api/notams/[id]/decision` | TIFRS 의사결정 기록 | `CreateDecisionRecordRequest` | `DecisionRecord` |

#### GET 동작 명세
1. URL params에서 NOTAM `id` 추출
2. `DecisionRepository.findByNotamId(id)` 호출
3. 결과 없으면 404 반환
4. 결과 있으면 `DecisionRecord` 반환

#### POST 동작 명세
1. 요청 본문을 `createDecisionRecordSchema`로 검증
2. `NotamRepository.findById(id)`로 NOTAM 존재 확인 (없으면 404)
3. `ImpactRepository.findRouteImpactsByNotam(id)` + `findFlightImpactsByNotam(id)` 호출
4. `AirportRepository.findByIcao(notam.locationIndicator)` 호출
5. `BedrockService.analyzeTifrsDecision(notam, routeImpacts, flightImpacts, airport)` 호출하여 AI 제안 획득
6. `DecisionRepository.create()` 호출하여 레코드 생성
   - 운항관리사 입력: 요청 본문의 TIFRS 필드 + overallDecision + rationale
   - AI 제안: analyzeTifrsDecision 결과의 suggestedDecision + rationale
   - decidedBy: 인증 컨텍스트에서 추출
7. `AuditLogRepository.create()` 호출하여 감사 기록 추가
   - action: `'record-decision'`
   - targetType: `'decision'`
   - targetId: 생성된 DecisionRecord.id
8. 생성된 `DecisionRecord` 반환

#### 에러 처리
- 400: zod 유효성 검증 실패
- 404: NOTAM 미발견 또는 의사결정 미존재 (GET)
- 500: Bedrock 호출 실패 시 서버 오류

#### 파일 의존성
- `src/lib/db/notam.repository.ts`
- `src/lib/db/decision.repository.ts`
- `src/lib/db/impact.repository.ts`
- `src/lib/db/airport.repository.ts`
- `src/lib/db/auditLog.repository.ts`
- `src/lib/services/bedrock.service.ts`
- `src/lib/validation/decision.validation.ts`

---

### /api/decisions [v2 신규]

#### 메타데이터
- **파일 경로**: `src/app/api/decisions/route.ts`
- **타입**: api-route
- **요구사항**: FR-020

#### 엔드포인트

| Method | Path | 설명 | Request Body | Response |
|--------|------|------|-------------|----------|
| GET | `/api/decisions` | 의사결정 기록 목록 조회 | - | `{ items: DecisionRecord[]; total: number }` |

#### 쿼리 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| decisionType | DecisionType | N | 의사결정 유형 필터 |
| decidedBy | string | N | 의사결정자 필터 |
| startDate | string (ISO-8601) | N | 시작 날짜 |
| endDate | string (ISO-8601) | N | 종료 날짜 |
| sortBy | 'decidedAt' \| 'overallDecision' \| 'notamId' | N | 정렬 기준 |
| order | 'asc' \| 'desc' | N | 정렬 방향 |
| page | number | N | 페이지 번호 (기본 1) |
| pageSize | number | N | 페이지 크기 (기본 20, 최대 100) |

#### GET 동작 명세
1. 쿼리 파라미터를 `decisionQuerySchema`로 검증
2. `DecisionRepository.findAll()` 호출
3. 페이지네이션된 결과 반환

#### 에러 처리
- 400: 쿼리 파라미터 유효성 실패
- 500: 서버 오류

#### 파일 의존성
- `src/lib/db/decision.repository.ts`
- `src/lib/validation/decision.validation.ts`

---

### /api/dashboard/route-impact [v2 구현완료]

#### 메타데이터
- **파일 경로**: `src/app/api/dashboard/route-impact/route.ts`
- **타입**: api-route
- **요구사항**: FR-006
- **v2 상태**: 구현완료 (코드 이미 적용됨)

#### v2 변경 사항
- `criticalNotams` 응답 필드가 **critical + high** importance NOTAM을 모두 포함하도록 변경
- v1에서는 critical importance만 포함했음
- 이 변경은 CC-008에서 직접 코드 수정으로 이미 적용됨

---

### /api/audit-log [v2 수정]

#### 메타데이터
- **파일 경로**: `src/app/api/audit-log/route.ts`
- **타입**: api-route
- **요구사항**: FR-017
- **v2 변경**: `record-decision` 액션 타입 지원 추가

#### v2 변경 사항
- 감사 로그 조회 시 `action` 필터에 `'record-decision'` 값 사용 가능
- 감사 로그 생성 시 `action` 필드에 `'record-decision'` 사용 가능
- TIFRS 의사결정 기록(FR-020) 시 자동으로 감사 로그 생성됨

---

## v1 유지 API 목록 (변경 없음)

다음 API 라우트는 v1에서 변경 없이 유지된다:

| API | 메서드 | 경로 | 요구사항 |
|-----|--------|------|---------|
| NotamListAPI | GET | `/api/notams` | FR-001, FR-005, FR-019 |
| NotamDetailAPI | GET | `/api/notams/[id]` | FR-002, FR-012 |
| NotamAnalyzeAPI | POST | `/api/notams/analyze` | FR-001, FR-003 |
| NotamSummarizeAPI | POST | `/api/notams/[id]/summarize` | FR-015 |
| NotamImpactAnalysisAPI | POST | `/api/notams/[id]/impact-analysis` | FR-003 |
| NotamAffectedFlightsAPI | GET | `/api/notams/[id]/affected-flights` | FR-004 |
| NotamAffectedRoutesAPI | GET | `/api/notams/[id]/affected-routes` | FR-004 |
| NotamDiffAPI | GET | `/api/notams/[id]/diff` | FR-018 |
| NotamAlertsAPI | GET | `/api/notams/alerts` | FR-016 |
| NotamStatsAPI | GET | `/api/notams/stats` | FR-005 |
| QCodeListAPI | GET | `/api/q-codes` | FR-002 |
| FlightListAPI | GET | `/api/flights` | FR-013 |
| FlightDetailAPI | GET | `/api/flights/[id]` | FR-004, FR-013 |
| RouteListAPI | GET | `/api/routes` | FR-006, FR-010 |
| RouteDetailAPI | GET | `/api/routes/[id]` | FR-010 |
| RouteAlternativesAPI | POST | `/api/routes/[id]/alternatives` | FR-009 |
| RouteImpactAPI | GET | `/api/routes/[id]/impact` | FR-010 |
| MatchingCalculateAPI | POST | `/api/matching/calculate` | FR-010 |
| MatchingResultsAPI | GET | `/api/matching/results` | FR-010 |
| RefBookAPI | GET, POST | `/api/ref-book` | FR-011 |
| RefBookDetailAPI | PUT, DELETE | `/api/ref-book/[id]` | FR-011 |
| BriefingListAPI | GET | `/api/briefings` | FR-007, FR-008 |
| BriefingGenerateAPI | POST | `/api/briefings/generate` | FR-007 |
| BriefingGenerateCrewAPI | POST | `/api/briefings/generate-crew` | FR-008 |
| BriefingDetailAPI | GET, PUT | `/api/briefings/[id]` | FR-007, FR-008 |
| BriefingCrewPackageAPI | GET | `/api/briefings/[id]/crew-package` | FR-008 |
| ShiftHandoverAPI | POST | `/api/reports/shift-handover` | FR-014 |
| ShiftHandoverDetailAPI | GET | `/api/reports/shift-handover/[id]` | FR-014 |
| AuthLoginAPI | POST | `/api/auth/login` | NFR-001 |

---

## v1 유지 컴포넌트 목록 (변경 없음)

### 타입 (v1 유지)
- `src/types/notam.ts` — Notam, NotamType, NotamStatus, ImportanceLevel, NotamStats, DiffChange
- `src/types/refBook.ts` — RefBookEntry, RefBookStatus, CreateRefBookEntryRequest, UpdateRefBookEntryRequest
- `src/types/flight.ts` — Flight, FlightStatus
- `src/types/route.ts` — Route, Waypoint, RouteStatus, RouteAlternative
- `src/types/airport.ts` — Airport
- `src/types/briefing.ts` — Briefing, BriefingType, BriefingStatus, UpdateBriefingRequest
- `src/types/qCode.ts` — QCode
- `src/types/impact.ts` — NotamRouteImpact, NotamFlightImpact
- `src/types/auth.ts` — Dispatcher
- `src/types/dashboard.ts` — DashboardSummary, RouteImpactMapData
- `src/types/common.ts` — PaginatedResponse, ApiErrorResponse

### 검증 스키마 (v1 유지)
- `src/lib/validation/notam.validation.ts` — analyzeNotamSchema, notamQuerySchema
- `src/lib/validation/refBook.validation.ts` — createRefBookEntrySchema, updateRefBookEntrySchema
- `src/lib/validation/briefing.validation.ts` — generateBriefingSchema, generateCrewBriefingSchema, updateBriefingSchema, shiftHandoverSchema
- `src/lib/validation/route.validation.ts` — routeAlternativesSchema, routeQuerySchema
- `src/lib/validation/matching.validation.ts` — matchingCalculateSchema
- `src/lib/validation/flight.validation.ts` — flightQuerySchema
- `src/lib/validation/auth.validation.ts` — loginSchema

### 시드 데이터 (v1 유지)
- `src/data/airports.ts` — 15건
- `src/data/routes.ts` — 12건
- `src/data/flights.ts` — 30건
- `src/data/notams.ts` — 50건
- `src/data/qCodes.ts` — 25건
- `src/data/refBookEntries.ts` — 8건
- `src/data/briefings.ts` — 5건
- `src/data/routeImpacts.ts` — 20건
- `src/data/flightImpacts.ts` — 25건
- `src/data/dispatchers.ts` — 3건

### Repository (v1 유지)
- `src/lib/db/notam.repository.ts`
- `src/lib/db/flight.repository.ts`
- `src/lib/db/route.repository.ts`
- `src/lib/db/airport.repository.ts`
- `src/lib/db/qCode.repository.ts`
- `src/lib/db/refBook.repository.ts`
- `src/lib/db/briefing.repository.ts`
- `src/lib/db/auditLog.repository.ts`
- `src/lib/db/impact.repository.ts`

### 서비스 (v1 유지)
- `src/lib/services/matching.service.ts`
- `src/lib/services/qCode.service.ts`
- `src/lib/services/notamDiff.service.ts`

### 미들웨어 (v1 유지)
- `src/middleware.ts` — 보안 헤더 (CSP, X-Frame-Options, X-Content-Type-Options 등)

---

## 생성 순서

```
1. types          — DecisionType, DecisionRecord, CreateDecisionRecordRequest 추가
                    AuditAction에 'record-decision' 추가
2. validation     — decision.validation.ts 신규 생성
                    auditLog.validation.ts에 'record-decision' 추가
3. data           — decisions.ts 신규 생성 (5건)
                    auditLogs.ts에 3건 추가
4. db             — store.ts에 decisions Map 추가
                    decision.repository.ts 신규 생성
5. services       — bedrock.service.ts에 analyzeTifrsDecision() 추가
6. api            — notams/[id]/decision/route.ts 신규 생성
                    decisions/route.ts 신규 생성
                    dashboard/route-impact/route.ts (구현완료, 변경 불필요)
                    audit-log/route.ts (validation 변경으로 자동 반영)
7. middleware     — 변경 없음
```

---

## 요구사항 커버리지 (백엔드)

| 요구사항 | 백엔드 스펙 | 상태 |
|---------|------------|------|
| FR-001 | NotamListAPI, NotamAnalyzeAPI | v1 유지 |
| FR-002 | NotamDetailAPI, QCodeListAPI | v1 유지 |
| FR-003 | NotamAnalyzeAPI, NotamImpactAnalysisAPI | v1 유지 |
| FR-004 | NotamAffectedFlightsAPI, NotamAffectedRoutesAPI, FlightDetailAPI | v1 유지 |
| FR-005 | NotamListAPI, NotamStatsAPI, DashboardRouteImpactAPI | v2 구현완료 (대시보드) |
| FR-006 | DashboardRouteImpactAPI, RouteListAPI | v2 구현완료 (대시보드) |
| FR-007 | BriefingGenerateAPI, BriefingDetailAPI, BriefingListAPI | v1 유지 |
| FR-008 | BriefingGenerateCrewAPI, BriefingCrewPackageAPI, BriefingDetailAPI | v1 유지 |
| FR-009 | RouteAlternativesAPI | v1 유지 |
| FR-010 | MatchingCalculateAPI, MatchingResultsAPI, RouteDetailAPI, RouteImpactAPI | v1 유지 |
| FR-011 | RefBookAPI, RefBookDetailAPI | v1 유지 |
| FR-012 | NotamDetailAPI | v1 유지 |
| FR-013 | FlightListAPI, FlightDetailAPI | v1 유지 |
| FR-014 | ShiftHandoverAPI, ShiftHandoverDetailAPI | v1 유지 |
| FR-015 | NotamSummarizeAPI | v1 유지 |
| FR-016 | NotamAlertsAPI | v1 유지 |
| FR-017 | AuditLogAPI | v2 수정 (record-decision) |
| FR-018 | NotamDiffAPI | v1 유지 |
| FR-019 | NotamListAPI | v1 유지 |
| **FR-020** | **NotamDecisionAPI, DecisionListAPI, BedrockService.analyzeTifrsDecision** | **v2 신규** |
