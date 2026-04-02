# 백엔드 스펙 - 제주항공 AI NOTAM 분석 시스템

> 생성일: 2026-03-30 | 버전: v1 | 생성기: backend

---

## 목차

1. [공유 타입 정의](#1-공유-타입-정의)
2. [검증 스키마](#2-검증-스키마)
3. [시드 데이터](#3-시드-데이터)
4. [데이터 레이어 (Repository)](#4-데이터-레이어)
5. [서비스 레이어](#5-서비스-레이어)
6. [API Route Handlers](#6-api-route-handlers)
7. [미들웨어](#7-미들웨어)

---

## 1. 공유 타입 정의

프론트엔드와 백엔드가 공유하는 TypeScript 인터페이스 및 enum. 백엔드가 생성하고 프론트엔드가 import한다.

### 1.1 NOTAM 타입 (`src/types/notam.ts`)

- **파일 경로**: `src/types/notam.ts`
- **요구사항**: FR-001, FR-002, FR-005, FR-012, FR-015, FR-018, FR-019

```typescript
/** NOTAM 유형 — ICAO 표준에 따른 3가지 유형 */
export type NotamType = 'NOTAMN' | 'NOTAMR' | 'NOTAMC';

/** NOTAM 처리 상태 — 수신부터 만료/취소까지 라이프사이클 */
export type NotamStatus =
  | 'new'
  | 'active'
  | 'analyzed'
  | 'ref-book-registered'
  | 'expired'
  | 'cancelled'
  | 'replaced';

/** 중요도 등급 — AI 스코어링 결과를 5단계로 분류 */
export type ImportanceLevel = 'critical' | 'high' | 'medium' | 'low' | 'routine';

/** NOTAM 엔티티 — ICAO 형식 NOTAM의 구조화된 표현 */
export interface Notam {
  id: string;
  series: string;
  number: number;
  year: number;
  type: NotamType;
  qCode: string;
  qCodeSubject: string;
  qCodeCondition: string;
  fir: string;
  trafficType: string;
  purpose: string;
  scope: string;
  lowerLimit: string;
  upperLimit: string;
  latitude: number;
  longitude: number;
  radius: number;              // 해리(nautical miles) 단위
  locationIndicator: string;   // ICAO 공항 코드
  effectiveFrom: string;       // ISO-8601
  effectiveTo: string;         // ISO-8601 또는 'PERM'
  schedule: string | null;
  body: string;                // Field E 본문
  rawText: string;             // 전체 원문
  importanceScore: number;     // 0.0 ~ 1.0
  importanceLevel: ImportanceLevel;
  aiSummary: string | null;    // AI 생성 한국어 요약
  aiAnalysis: string | null;   // AI 생성 영향 분석
  status: NotamStatus;
  replacesNotamId: string | null; // NOTAMR인 경우 대체 대상 ID
  createdAt: string;           // ISO-8601
}

/** NOTAM 통계 — 대시보드 및 필터링 카운트용 */
export interface NotamStats {
  total: number;
  bySeverity: Record<ImportanceLevel, number>;
  byStatus: Record<NotamStatus, number>;
  expiringSoon: number;
}

/** NOTAM 변경 사항 — NOTAMR diff 뷰에 표시할 필드별 차이 */
export interface DiffChange {
  field: string;
  oldValue: string;
  newValue: string;
}
```

### 1.2 REF BOOK 타입 (`src/types/refBook.ts`)

- **파일 경로**: `src/types/refBook.ts`
- **요구사항**: FR-011

```typescript
/** REF BOOK 상태 */
export type RefBookStatus = 'active' | 'expired' | 'superseded';

/** REF BOOK 항목 — 운항관리사가 등록한 중요 NOTAM 기록 */
export interface RefBookEntry {
  id: string;
  notamId: string;
  registeredBy: string;
  registeredAt: string;        // ISO-8601
  summary: string;
  impactLevel: ImportanceLevel;
  affectedAirports: string[];  // ICAO 코드 배열
  affectedRoutes: string[];
  remarks: string;
  status: RefBookStatus;
  expiresAt: string;           // ISO-8601
}

/** REF BOOK 생성 요청 */
export interface CreateRefBookEntryRequest {
  notamId: string;
  summary: string;
  impactLevel: ImportanceLevel;
  affectedAirports: string[];
  affectedRoutes: string[];
  remarks: string;
  expiresAt: string;
}

/** REF BOOK 수정 요청 — 모든 필드 선택적 */
export interface UpdateRefBookEntryRequest {
  summary?: string;
  impactLevel?: ImportanceLevel;
  affectedAirports?: string[];
  affectedRoutes?: string[];
  remarks?: string;
  status?: RefBookStatus;
  expiresAt?: string;
}
```

### 1.3 운항편 타입 (`src/types/flight.ts`)

- **파일 경로**: `src/types/flight.ts`
- **요구사항**: FR-004, FR-013

```typescript
/** 운항편 상태 */
export type FlightStatus =
  | 'scheduled'
  | 'dispatched'
  | 'in-flight'
  | 'arrived'
  | 'cancelled'
  | 'diverted';

/** 운항편 엔티티 */
export interface Flight {
  id: string;
  flightNumber: string;        // 7C 접두사 (예: 7C101)
  departureAirport: string;    // ICAO 코드
  arrivalAirport: string;      // ICAO 코드
  scheduledDeparture: string;  // ISO-8601
  scheduledArrival: string;    // ISO-8601
  routeId: string;
  aircraftType: string;        // B737-800
  status: FlightStatus;
  notamImpactCount: number;
  notamMaxSeverity: ImportanceLevel;
}
```

### 1.4 항로 타입 (`src/types/route.ts`)

- **파일 경로**: `src/types/route.ts`
- **요구사항**: FR-006, FR-009, FR-010

```typescript
/** 항로 상태 */
export type RouteStatus = 'active' | 'suspended' | 'alternate';

/** 웨이포인트 — 항로 경유점 */
export interface Waypoint {
  id: string;
  name: string;                // 5글자 ICAO 코드
  latitude: number;
  longitude: number;
  sequenceOrder: number;
}

/** 항로 엔티티 — NAVBLUE 항로 데이터 기반 */
export interface Route {
  id: string;
  routeName: string;
  departureAirport: string;    // ICAO 코드
  arrivalAirport: string;      // ICAO 코드
  waypoints: Waypoint[];
  airways: string[];
  distance: number;            // 해리
  flightLevel: string;         // 예: FL350
  status: RouteStatus;
  alternateRouteIds: string[];
}

/** 대체 항로 제안 — AI가 생성하는 우회 항로 비교 정보 */
export interface RouteAlternative {
  route: Route;
  reason: string;
  distanceDifference: number;  // 원래 항로 대비 거리 차이 (해리)
  timeDifference: number;      // 원래 항로 대비 시간 차이 (분)
  avoidedNotams: string[];     // 회피 가능한 NOTAM ID 목록
}
```

### 1.5 공항 타입 (`src/types/airport.ts`)

- **파일 경로**: `src/types/airport.ts`
- **요구사항**: FR-003, FR-006

```typescript
/** 공항 엔티티 — ICAO/IATA 코드, 시설 정보 포함 */
export interface Airport {
  icaoCode: string;
  iataCode: string;
  name: string;
  nameKo: string;              // 한국어 공항명
  latitude: number;
  longitude: number;
  runwayCount: number;
  fir: string;
  country: string;
  timezone: string;
}
```

### 1.6 브리핑 타입 (`src/types/briefing.ts`)

- **파일 경로**: `src/types/briefing.ts`
- **요구사항**: FR-007, FR-008, FR-014

```typescript
/** 브리핑 문서 유형 */
export type BriefingType =
  | 'dispatcher-summary'
  | 'company-notam'
  | 'disp-comment'
  | 'crew-briefing';

/** 브리핑 문서 상태 */
export type BriefingStatus = 'draft' | 'pending-review' | 'approved' | 'distributed';

/** 브리핑 엔티티 — AI가 생성한 문서 */
export interface Briefing {
  id: string;
  type: BriefingType;
  flightId: string;
  generatedAt: string;
  content: string;             // 마크다운 또는 JSON (crew-package인 경우)
  notamIds: string[];
  status: BriefingStatus;
  approvedBy: string | null;
  approvedAt: string | null;
}

/** 브리핑 수정 요청 */
export interface UpdateBriefingRequest {
  content?: string;
  status?: BriefingStatus;
  approvedBy?: string;
}
```

### 1.7 감사 로그 타입 (`src/types/auditLog.ts`)

- **파일 경로**: `src/types/auditLog.ts`
- **요구사항**: FR-017

```typescript
/** 감사 로그 액션 유형 */
export type AuditAction =
  | 'view'
  | 'analyze'
  | 'approve'
  | 'reject'
  | 'register-ref-book'
  | 'generate-briefing'
  | 'acknowledge-alert';

/** 감사 로그 엔티티 — 운항관리사 행위 기록 */
export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

/** 감사 로그 생성 요청 */
export interface CreateAuditLogRequest {
  userId: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  details: string;
}
```

### 1.8 Q-Code 타입 (`src/types/qCode.ts`)

- **파일 경로**: `src/types/qCode.ts`
- **요구사항**: FR-002

```typescript
/** Q-Code 참조 데이터 — ICAO Q-Code 해석 테이블 */
export interface QCode {
  code: string;                // 5글자 (예: QMRLC)
  subject: string;             // 주제 (예: Runway)
  condition: string;           // 상태 (예: Closed)
  description: string;         // 영문 설명
  descriptionKo: string;       // 한국어 설명
  defaultImportance: ImportanceLevel;
}
```

### 1.9 영향 분석 타입 (`src/types/impact.ts`)

- **파일 경로**: `src/types/impact.ts`
- **요구사항**: FR-003, FR-004, FR-010

```typescript
/** NOTAM-항로 영향 기록 — 공간적 중첩 분석 결과 */
export interface NotamRouteImpact {
  id: string;
  notamId: string;
  routeId: string;
  overlapType: string;         // 'direct-crossing' | 'within-radius' | 'adjacent'
  affectedSegment: string;     // 'WAYPOINT1-WAYPOINT2'
  distanceThroughArea: number; // 영향 구간 거리 (해리)
  altitudeConflict: boolean;
}

/** NOTAM-운항편 영향 기록 — 시공간 중첩 분석 결과 */
export interface NotamFlightImpact {
  id: string;
  notamId: string;
  flightId: string;
  routeId: string;
  temporalOverlap: boolean;
  spatialOverlap: boolean;
  impactSummary: string;
}
```

### 1.10 인증 타입 (`src/types/auth.ts`)

- **파일 경로**: `src/types/auth.ts`
- **요구사항**: NFR-001

```typescript
/** 운항관리사 (목 인증용) */
export interface Dispatcher {
  id: string;
  name: string;
  employeeId: string;
  role: string;
}
```

### 1.11 대시보드 타입 (`src/types/dashboard.ts`)

- **파일 경로**: `src/types/dashboard.ts`
- **요구사항**: FR-006

```typescript
/** 대시보드 요약 카드 데이터 */
export interface DashboardSummary {
  totalActiveNotams: number;
  criticalCount: number;
  highCount: number;
  affectedRoutesCount: number;
  affectedFlightsCount: number;
  filteredVsTotalRatio: number;
}

/** 항로별 NOTAM 영향 지도 데이터 */
export interface RouteImpactMapData {
  route: Route;
  impacts: NotamRouteImpact[];
  notams: Notam[];
}
```

### 1.12 공통 타입 (`src/types/common.ts`)

- **파일 경로**: `src/types/common.ts`

```typescript
/** 페이지네이션 응답 공통 제네릭 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

/** API 에러 응답 공통 형식 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
```

---

## 2. 검증 스키마

모든 API 입력에 대한 zod 검증 스키마. `z.infer<typeof schema>`로 타입을 추출하여 사용한다.

### 2.1 NOTAM 검증 (`src/lib/validation/notam.validation.ts`)

- **파일 경로**: `src/lib/validation/notam.validation.ts`
- **요구사항**: FR-001, FR-005

```typescript
import { z } from 'zod';

/** NOTAM 분석 요청 검증 */
export const analyzeNotamSchema = z.object({
  notamId: z.string().uuid(),
});

/** NOTAM 목록 쿼리 검증 */
export const notamQuerySchema = z.object({
  importance: z.enum(['critical', 'high', 'medium', 'low', 'routine']).optional(),
  status: z.enum(['new', 'active', 'analyzed', 'ref-book-registered', 'expired', 'cancelled', 'replaced']).optional(),
  airport: z.string().length(4).optional(),
  qCode: z.string().optional(),
  expiryStatus: z.enum(['expiring-soon', 'expired', 'active']).optional(),
  sortBy: z.enum(['importanceScore', 'effectiveFrom', 'effectiveTo', 'locationIndicator', 'createdAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});
```

### 2.2 REF BOOK 검증 (`src/lib/validation/refBook.validation.ts`)

- **파일 경로**: `src/lib/validation/refBook.validation.ts`
- **요구사항**: FR-011

```typescript
import { z } from 'zod';

/** REF BOOK 생성 요청 검증 */
export const createRefBookEntrySchema = z.object({
  notamId: z.string().uuid(),
  summary: z.string().min(1).max(2000),
  impactLevel: z.enum(['critical', 'high', 'medium', 'low', 'routine']),
  affectedAirports: z.array(z.string().length(4)).min(1),
  affectedRoutes: z.array(z.string()).optional().default([]),
  remarks: z.string().max(1000).optional().default(''),
  expiresAt: z.string().datetime(),
});

/** REF BOOK 수정 요청 검증 */
export const updateRefBookEntrySchema = z.object({
  summary: z.string().min(1).max(2000).optional(),
  impactLevel: z.enum(['critical', 'high', 'medium', 'low', 'routine']).optional(),
  affectedAirports: z.array(z.string().length(4)).optional(),
  affectedRoutes: z.array(z.string()).optional(),
  remarks: z.string().max(1000).optional(),
  status: z.enum(['active', 'expired', 'superseded']).optional(),
  expiresAt: z.string().datetime().optional(),
});
```

### 2.3 브리핑 검증 (`src/lib/validation/briefing.validation.ts`)

- **파일 경로**: `src/lib/validation/briefing.validation.ts`
- **요구사항**: FR-007, FR-008, FR-014

```typescript
import { z } from 'zod';

/** 브리핑 생성 요청 검증 */
export const generateBriefingSchema = z.object({
  flightId: z.string().uuid(),
  type: z.enum(['dispatcher-summary', 'company-notam', 'disp-comment', 'crew-briefing']),
});

/** 승무원 브리핑 생성 요청 검증 */
export const generateCrewBriefingSchema = z.object({
  flightId: z.string().uuid(),
});

/** 브리핑 수정 요청 검증 */
export const updateBriefingSchema = z.object({
  content: z.string().min(1).optional(),
  status: z.enum(['draft', 'pending-review', 'approved', 'distributed']).optional(),
  approvedBy: z.string().optional(),
});

/** 교대 인수인계 보고서 요청 검증 */
export const shiftHandoverSchema = z.object({
  shiftStartTime: z.string().datetime(),
  shiftEndTime: z.string().datetime(),
});
```

### 2.4 항로 검증 (`src/lib/validation/route.validation.ts`)

- **파일 경로**: `src/lib/validation/route.validation.ts`
- **요구사항**: FR-009, FR-010

```typescript
import { z } from 'zod';

/** 대체 항로 요청 검증 */
export const routeAlternativesSchema = z.object({
  notamId: z.string().uuid(),
});

/** 항로 목록 쿼리 검증 */
export const routeQuerySchema = z.object({
  status: z.enum(['active', 'suspended', 'alternate']).optional(),
  sortBy: z.enum(['routeName', 'departureAirport', 'distance']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});
```

### 2.5 운항편 검증 (`src/lib/validation/flight.validation.ts`)

- **파일 경로**: `src/lib/validation/flight.validation.ts`
- **요구사항**: FR-013

```typescript
import { z } from 'zod';

/** 운항편 목록 쿼리 검증 */
export const flightQuerySchema = z.object({
  airport: z.string().length(4).optional(),
  route: z.string().optional(),
  date: z.string().optional(),
  impactStatus: z.enum(['affected', 'clear', 'all']).optional(),
  sortBy: z.enum(['flightNumber', 'scheduledDeparture', 'departureAirport', 'notamImpactCount']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});
```

### 2.6 매칭 검증 (`src/lib/validation/matching.validation.ts`)

- **파일 경로**: `src/lib/validation/matching.validation.ts`
- **요구사항**: FR-010

```typescript
import { z } from 'zod';

/** 매칭 계산 요청 검증 */
export const matchingCalculateSchema = z.object({
  notamId: z.string().uuid().optional(),
});
```

### 2.7 감사 로그 검증 (`src/lib/validation/auditLog.validation.ts`)

- **파일 경로**: `src/lib/validation/auditLog.validation.ts`
- **요구사항**: FR-017

```typescript
import { z } from 'zod';

/** 감사 로그 조회 쿼리 검증 */
export const auditLogQuerySchema = z.object({
  userId: z.string().optional(),
  action: z.enum(['view', 'analyze', 'approve', 'reject', 'register-ref-book', 'generate-briefing', 'acknowledge-alert']).optional(),
  targetType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});

/** 감사 로그 생성 요청 검증 */
export const createAuditLogSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(['view', 'analyze', 'approve', 'reject', 'register-ref-book', 'generate-briefing', 'acknowledge-alert']),
  targetType: z.string().min(1),
  targetId: z.string().min(1),
  details: z.string().max(2000).optional().default(''),
});
```

### 2.8 인증 검증 (`src/lib/validation/auth.validation.ts`)

- **파일 경로**: `src/lib/validation/auth.validation.ts`
- **요구사항**: NFR-001

```typescript
import { z } from 'zod';

/** 로그인 요청 검증 */
export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
```

---

## 3. 시드 데이터

NFR-007에 따라 최소 50개 NOTAM, 12개 항로, 30개 운항편, 15개 공항을 시드한다. 모든 데이터는 현실적인 ICAO 형식과 제주항공 운항 데이터를 기반으로 한다.

### 3.1 공항 데이터 (`src/data/airports.ts`)

- **파일 경로**: `src/data/airports.ts`
- **export**: `SEED_AIRPORTS: Airport[]`
- **개수**: 15개
- **내용**: 제주항공 취항지 — 한국 국내 (RKSI/ICN, RKSS/GMP, RKPC/CJU, RKPK/PUS, RKTN/TAE, RKJJ/KWJ, RKJY/RSU) + 일본 (RJTT/HND, RJAA/NRT, RJBB/KIX, RJFF/FUK) + 동남아 (VVNB/HAN, VTBS/BKK, RPLL/MNL) + 중국 (ZSSS/SHA)
- **핵심 필드**: icaoCode, iataCode, name, nameKo, latitude, longitude, runwayCount, fir, country, timezone
- **FIR 매핑**: RKRR (한국), RJJJ (일본), VTBB (태국), VVHN (베트남), RPHI (필리핀), ZSHA (중국)

### 3.2 항로 데이터 (`src/data/routes.ts`)

- **파일 경로**: `src/data/routes.ts`
- **export**: `SEED_ROUTES: Route[]`
- **개수**: 12개
- **내용**: 제주항공 주요 항로 (각 항로에 5~10개 웨이포인트 포함)
  - ICN-CJU (국내 단거리), ICN-PUS (국내), GMP-CJU (국내)
  - ICN-NRT, ICN-KIX, CJU-NRT, CJU-KIX, PUS-NRT (일본 노선)
  - ICN-BKK, ICN-HAN (동남아 중거리)
  - ICN-MNL, ICN-SHA (기타 국제선)
- **웨이포인트 예시** (ICN-NRT): RKSI → OLMEN → AKETA → PIMOL → SAZAN → RJAA
- **대체 항로**: 국제선 항로는 1~2개 대체 항로 지정 (alternateRouteIds)

### 3.3 운항편 데이터 (`src/data/flights.ts`)

- **파일 경로**: `src/data/flights.ts`
- **export**: `SEED_FLIGHTS: Flight[]`
- **개수**: 30개
- **내용**: 제주항공 7C 편명 (7C101~7C960), B737-800 기종
  - 상태 분포: scheduled 12, dispatched 8, in-flight 6, arrived 4
  - 오늘/내일 기준 운항 스케줄
  - 각 운항편에 routeId 연결
  - notamImpactCount, notamMaxSeverity는 시드 영향 데이터 기반으로 사전 계산

### 3.4 NOTAM 데이터 (`src/data/notams.ts`)

- **파일 경로**: `src/data/notams.ts`
- **export**: `SEED_NOTAMS: Notam[]`
- **개수**: 50개
- **내용**: ICAO 형식 현실적 NOTAM
  - Q-Code 분포: QMRLC(활주로 폐쇄) 8, QNVAS(VOR 장애) 6, QFALC(공역 제한) 5, QMAXX(비행장 일반) 7, QMXLC(유도로 폐쇄) 4, QICAS(ILS 장애) 4, QLLAS(조명 장애) 3, QWMLW(사격/미사일) 3, QPICH(절차 변경) 3, 기타 7
  - 중요도 분포: critical 5, high 10, medium 15, low 12, routine 8
  - 상태 분포: new 5, active 20, analyzed 15, ref-book-registered 5, expired 3, replaced 2
  - NOTAMR 2건 포함 (replacesNotamId 연결)
  - 위치: 한국/일본/태국/베트남 FIR 내 실제 공항 및 항로상 좌표
  - rawText 예시:

```
A0123/26 NOTAMN
Q) RKRR/QMRLC/IV/NBO/A/000/999/3727N12658E005
A) RKSI
B) 2603281000
C) 2604012359
E) RWY 15L/33R CLSD DUE TO RESURFACING WORK
F) SFC
G) UNL
```

### 3.5 Q-Code 데이터 (`src/data/qCodes.ts`)

- **파일 경로**: `src/data/qCodes.ts`
- **export**: `SEED_Q_CODES: QCode[]`
- **개수**: 25개
- **내용**: ICAO Q-Code 참조 테이블 (한국어 설명 포함)
  - QMRLC: Runway Closed / 활주로 폐쇄 / critical
  - QMALC: Aerodrome Closed / 비행장 폐쇄 / critical
  - QFALC: Airspace Closed / 공역 폐쇄 / critical
  - QNVAS: VOR Unserviceable / VOR 사용 불가 / high
  - QICAS: ILS Unserviceable / ILS 사용 불가 / high
  - QMXLC: Taxiway Closed / 유도로 폐쇄 / medium
  - 등등

### 3.6 REF BOOK 데이터 (`src/data/refBookEntries.ts`)

- **파일 경로**: `src/data/refBookEntries.ts`
- **export**: `SEED_REF_BOOK_ENTRIES: RefBookEntry[]`
- **개수**: 8개
- **내용**: critical/high NOTAM에 대한 REF BOOK 등록 기록. 등록자: Kim Dispatcher.

### 3.7 브리핑 데이터 (`src/data/briefings.ts`)

- **파일 경로**: `src/data/briefings.ts`
- **export**: `SEED_BRIEFINGS: Briefing[]`
- **개수**: 5개
- **내용**: 2 dispatcher-summary, 1 company-notam, 1 disp-comment, 1 crew-briefing. 상태 혼합 (draft 2, approved 2, pending-review 1).

### 3.8 감사 로그 데이터 (`src/data/auditLogs.ts`)

- **파일 경로**: `src/data/auditLogs.ts`
- **export**: `SEED_AUDIT_LOGS: AuditLog[]`
- **개수**: 15개

### 3.9 항로 영향 데이터 (`src/data/routeImpacts.ts`)

- **파일 경로**: `src/data/routeImpacts.ts`
- **export**: `SEED_ROUTE_IMPACTS: NotamRouteImpact[]`
- **개수**: 20개
- **내용**: NOTAM 영역과 항로 폴리라인의 사전 계산된 공간적 중첩 기록.

### 3.10 운항편 영향 데이터 (`src/data/flightImpacts.ts`)

- **파일 경로**: `src/data/flightImpacts.ts`
- **export**: `SEED_FLIGHT_IMPACTS: NotamFlightImpact[]`
- **개수**: 25개

### 3.11 운항관리사 데이터 (`src/data/dispatchers.ts`)

- **파일 경로**: `src/data/dispatchers.ts`
- **export**: `SEED_DISPATCHERS: Dispatcher[]`
- **개수**: 3개
- **내용**: Kim Dispatcher (오전조), Lee Dispatcher (오후조), Park Dispatcher (야간조)

---

## 4. 데이터 레이어

인메모리 Map 기반 스토어 + 리소스별 Repository 패턴. 추후 DynamoDB로 교체 가능하도록 추상화한다.

### 4.1 인메모리 스토어 (`src/lib/db/store.ts`)

- **파일 경로**: `src/lib/db/store.ts`
- **요구사항**: 전체 (데이터 영속성 레이어)

```typescript
/**
 * 인메모리 스토어 — 싱글턴 패턴
 * 모듈 레벨 변수로 서버 라이프사이클 동안 유지.
 * 첫 접근 시 시드 데이터에서 초기화.
 */
interface Store {
  notams: Map<string, Notam>;
  refBookEntries: Map<string, RefBookEntry>;
  flights: Map<string, Flight>;
  routes: Map<string, Route>;
  airports: Map<string, Airport>;    // key: icaoCode
  qCodes: Map<string, QCode>;       // key: code
  briefings: Map<string, Briefing>;
  auditLogs: AuditLog[];            // 추가 전용 배열
  routeImpacts: NotamRouteImpact[];
  flightImpacts: NotamFlightImpact[];
  dispatchers: Map<string, Dispatcher>;
}

/** 스토어 싱글턴 접근자 */
export function getStore(): Store;
```

**동작 명세**:
1. 모듈 최상위에 `let store: Store | null = null` 선언
2. `getStore()` 호출 시 store가 null이면 시드 데이터 import 후 Map 초기화
3. 이후 호출에서는 동일한 store 인스턴스 반환
4. 각 시드 배열을 Map으로 변환 (id 기반 키, Airport는 icaoCode, QCode는 code)

### 4.2 NOTAM Repository (`src/lib/db/notam.repository.ts`)

- **파일 경로**: `src/lib/db/notam.repository.ts`

**export 함수들**:

| 함수명 | 시그니처 | 설명 |
|--------|---------|------|
| `findAll` | `(params) => { items: Notam[]; total: number; stats: NotamStats }` | 필터링(importance, status, airport, qCode, expiryStatus) + 정렬 + 페이지네이션 |
| `findById` | `(id: string) => Notam \| undefined` | ID로 단일 NOTAM 조회 |
| `update` | `(id: string, data: Partial<Notam>) => Notam \| undefined` | NOTAM 필드 업데이트 (AI 분석 결과 저장용) |
| `findAlerts` | `() => Notam[]` | critical 등급 + new/active 상태인 NOTAM 목록 |
| `getStats` | `() => NotamStats` | 전체 NOTAM 통계 집계 |
| `findByReplacesId` | `(replacesNotamId: string) => Notam \| undefined` | 대체 NOTAM 조회 (diff 뷰용) |

**핵심 로직 (findAll)**:
1. store.notams에서 Map.values()를 배열로 변환
2. importance 필터: importanceLevel 일치 여부 (쉼표 구분 다중 값 지원)
3. status 필터: 쉼표 구분 다중 값 지원
4. airport 필터: locationIndicator 일치
5. qCode 필터: qCode 시작값 일치 (부분 매칭)
6. expiryStatus 필터: 'expiring-soon'이면 effectiveTo가 24시간 이내, 'expired'이면 effectiveTo 과거, 'active'이면 미만료
7. 정렬: sortBy 필드 기준 asc/desc
8. 페이지네이션: total 계산 후 slice
9. stats: bySeverity, byStatus 카운트 + expiringSoon(24시간 이내 만료) 계산

### 4.3 Flight Repository (`src/lib/db/flight.repository.ts`)

- **파일 경로**: `src/lib/db/flight.repository.ts`

| 함수명 | 시그니처 | 설명 |
|--------|---------|------|
| `findAll` | `(params) => { items: Flight[]; total: number }` | 공항/항로/날짜/영향상태 필터 + 정렬 + 페이지네이션 |
| `findById` | `(id: string) => Flight \| undefined` | ID로 단일 운항편 조회 |

### 4.4 Route Repository (`src/lib/db/route.repository.ts`)

- **파일 경로**: `src/lib/db/route.repository.ts`

| 함수명 | 시그니처 | 설명 |
|--------|---------|------|
| `findAll` | `(params) => { items: Route[]; total: number }` | 상태 필터 + 정렬 + 페이지네이션 |
| `findById` | `(id: string) => Route \| undefined` | ID로 단일 항로 조회 (웨이포인트 포함) |
| `findAlternates` | `(routeId: string) => Route[]` | alternateRouteIds로 대체 항로 조회 |

### 4.5 Airport Repository (`src/lib/db/airport.repository.ts`)

- **파일 경로**: `src/lib/db/airport.repository.ts`

| 함수명 | 시그니처 | 설명 |
|--------|---------|------|
| `findByIcao` | `(icaoCode: string) => Airport \| undefined` | ICAO 코드로 공항 조회 |
| `findAll` | `() => Airport[]` | 전체 공항 목록 |

### 4.6 QCode Repository (`src/lib/db/qCode.repository.ts`)

- **파일 경로**: `src/lib/db/qCode.repository.ts`

| 함수명 | 시그니처 | 설명 |
|--------|---------|------|
| `findAll` | `() => QCode[]` | 전체 Q-Code 참조 테이블 |
| `findByCode` | `(code: string) => QCode \| undefined` | 코드로 단일 Q-Code 조회 |

### 4.7 RefBook Repository (`src/lib/db/refBook.repository.ts`)

- **파일 경로**: `src/lib/db/refBook.repository.ts`

| 함수명 | 시그니처 | 설명 |
|--------|---------|------|
| `findAll` | `(params) => { items: RefBookEntry[]; total: number }` | 상태 필터 + 정렬 + 페이지네이션 |
| `findById` | `(id: string) => RefBookEntry \| undefined` | ID로 단일 항목 조회 |
| `create` | `(data) => RefBookEntry` | 새 REF BOOK 항목 생성 (UUID 자동 생성, registeredAt 자동 설정) |
| `update` | `(id, data) => RefBookEntry \| undefined` | 항목 수정 |
| `remove` | `(id: string) => boolean` | 항목 삭제 |

### 4.8 Briefing Repository (`src/lib/db/briefing.repository.ts`)

- **파일 경로**: `src/lib/db/briefing.repository.ts`

| 함수명 | 시그니처 | 설명 |
|--------|---------|------|
| `findAll` | `(params) => { items: Briefing[]; total: number }` | flightId/type/status 필터 + 정렬 + 페이지네이션 |
| `findById` | `(id: string) => Briefing \| undefined` | ID로 단일 브리핑 조회 |
| `create` | `(data) => Briefing` | 새 브리핑 생성 |
| `update` | `(id, data) => Briefing \| undefined` | 브리핑 수정 (상태 변경, 내용 편집) |

### 4.9 AuditLog Repository (`src/lib/db/auditLog.repository.ts`)

- **파일 경로**: `src/lib/db/auditLog.repository.ts`

| 함수명 | 시그니처 | 설명 |
|--------|---------|------|
| `findAll` | `(params) => { items: AuditLog[]; total: number }` | userId/action/targetType/날짜 필터 + 페이지네이션 |
| `create` | `(data) => AuditLog` | 새 감사 로그 추가 (추가 전용, UUID + timestamp 자동) |

### 4.10 Impact Repository (`src/lib/db/impact.repository.ts`)

- **파일 경로**: `src/lib/db/impact.repository.ts`

| 함수명 | 시그니처 | 설명 |
|--------|---------|------|
| `findRouteImpactsByNotam` | `(notamId: string) => NotamRouteImpact[]` | 특정 NOTAM의 항로 영향 |
| `findFlightImpactsByNotam` | `(notamId: string) => NotamFlightImpact[]` | 특정 NOTAM의 운항편 영향 |
| `findRouteImpactsByRoute` | `(routeId: string) => NotamRouteImpact[]` | 특정 항로의 NOTAM 영향 |
| `findFlightImpactsByFlight` | `(flightId: string) => NotamFlightImpact[]` | 특정 운항편의 NOTAM 영향 |
| `createRouteImpact` | `(data) => NotamRouteImpact` | 항로 영향 기록 생성 |
| `createFlightImpact` | `(data) => NotamFlightImpact` | 운항편 영향 기록 생성 |
| `findAll` | `(params) => { routeImpacts; flightImpacts }` | notamId/routeId/flightId 조합 필터 |

---

## 5. 서비스 레이어

비즈니스 로직과 외부 서비스 연동.

### 5.1 Bedrock 서비스 (`src/lib/services/bedrock.service.ts`)

- **파일 경로**: `src/lib/services/bedrock.service.ts`
- **요구사항**: FR-001, FR-003, FR-007, FR-008, FR-009, FR-014, FR-015
- **의존성**: `@aws-sdk/client-bedrock-runtime`
- **모델**: `anthropic.claude-3-5-sonnet-20241022-v2:0`
- **리전**: `us-west-2`

**중요**: AI 기능은 **실제 Amazon Bedrock 호출**이며 Mock이 아니다.

```typescript
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: 'us-west-2' });
const MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0';
```

#### `analyzeNotamImportance`

- **시그니처**: `(notam: Notam, qCode: QCode | undefined, airport: Airport | undefined) => Promise<{ importanceScore: number; importanceLevel: ImportanceLevel; aiSummary: string; aiAnalysis: string }>`
- **프롬프트 전략**:
  - 시스템 프롬프트: "항공 안전 전문가 역할. NOTAM을 분석하여 제주항공 운항에 대한 중요도 평가."
  - 입력: rawText, Q-Code 분류(있을 경우), 공항 활주로 수, NOTAM 유효 기간
  - 출력 형식: JSON `{ score: number, level: string, summary: string, analysis: string }`
  - summary는 한국어, analysis도 한국어
  - temperature: 0.3 (일관성 중시)
  - maxTokens: 2048

#### `generateKoreanSummary`

- **시그니처**: `(notam: Notam) => Promise<string>`
- **프롬프트 전략**:
  - "ICAO NOTAM 원문을 항공 운항관리사가 즉시 이해할 수 있는 한국어 요약으로 변환"
  - 약어 풀이, 운항 영향 설명 포함
  - 3~5문장 이내

#### `generateImpactAnalysis`

- **시그니처**: `(notam: Notam, affectedRoutes: NotamRouteImpact[], affectedFlights: NotamFlightImpact[], airport: Airport | undefined) => Promise<string>`
- **프롬프트 전략**:
  - 공항 맥락 (활주로 수, 위치)과 운항 스케줄을 종합한 영향도 분석
  - 예: "인천공항 4개 활주로 중 15L/33R 폐쇄 — 50% 용량 감소. 7C101편 등 5개 운항편 영향."

#### `generateBriefingContent`

- **시그니처**: `(flight: Flight, notams: Notam[], briefingType: BriefingType) => Promise<string>`
- **프롬프트 전략**:
  - briefingType별 포맷 분기:
    - `dispatcher-summary`: 운항관리사용 종합 요약
    - `company-notam`: Company NOTAM 형식
    - `disp-comment`: DISP COMMENT 형식 (운항관리사 의견/권고)
    - `crew-briefing`: 승무원용 간결한 브리핑
  - 해당 운항편의 관련 NOTAM 목록, 중요도 순 정렬

#### `generateCrewPackage`

- **시그니처**: `(flight: Flight, notams: Notam[]) => Promise<{ dispComment: string; companyNotam: string; crewBriefing: string }>`
- **프롬프트 전략**:
  - 3개 문서를 한 번의 호출로 생성 (JSON 응답)
  - 각 문서는 항공 용어와 표준 형식 준수

#### `generateShiftHandoverReport`

- **시그니처**: `(notams: Notam[], shiftStartTime: string, shiftEndTime: string) => Promise<string>`
- **프롬프트 전략**:
  - 교대 기간 내 신규/변경/중요 NOTAM 요약
  - 중요도별 그룹핑, 처리 상태 표시

#### `suggestRouteAlternatives`

- **시그니처**: `(route: Route, notam: Notam, alternateRoutes: Route[]) => Promise<{ alternatives: RouteAlternative[]; reasoning: string }>`
- **프롬프트 전략**:
  - 현재 항로의 NOTAM 영향과 대체 항로 비교
  - 거리/시간 차이, 회피되는 NOTAM 목록 포함
  - reasoning은 한국어 의사결정 가이드

**공통 에러 처리**:
- Bedrock API 실패 시: 재시도 1회 후 에러 메시지 반환
- 타임아웃: 15초 (NFR-002 준수)
- 응답 파싱 실패 시: 기본값 반환 (score: 0.5, level: 'medium')

### 5.2 매칭 서비스 (`src/lib/services/matching.service.ts`)

- **파일 경로**: `src/lib/services/matching.service.ts`
- **요구사항**: FR-004, FR-010

#### `haversineDistance`

- **시그니처**: `(lat1: number, lng1: number, lat2: number, lng2: number) => number`
- 두 좌표 간 대원거리 (해리)

```
a = sin^2(dlat/2) + cos(lat1) * cos(lat2) * sin^2(dlng/2)
c = 2 * atan2(sqrt(a), sqrt(1-a))
distance = R * c  (R = 3440.065 해리)
```

#### `pointToSegmentDistance`

- **시그니처**: `(point: { lat; lng }, segStart: { lat; lng }, segEnd: { lat; lng }) => number`
- 점에서 선분까지 최소 거리 (해리)
- 선분의 양 끝점과 수선의 발 중 최소값

#### `calculateSpatialOverlap`

- **시그니처**: `(notam: Notam, route: Route) => { overlaps: boolean; overlapType: string; affectedSegment: string; distanceThroughArea: number; altitudeConflict: boolean }`
- **알고리즘**:
  1. 항로의 연속 웨이포인트 쌍으로 선분 목록 생성
  2. 각 선분에 대해 NOTAM 중심점까지의 최소 거리 계산 (pointToSegmentDistance)
  3. 최소 거리 < NOTAM radius이면 overlaps = true
  4. overlapType 결정: 직접 교차(direct-crossing), 반경 내(within-radius), 인접(adjacent)
  5. affectedSegment: 영향받는 구간의 웨이포인트 이름 (예: "OLMEN-AKETA")
  6. distanceThroughArea: 반경 내 구간 길이 근사치
  7. 고도 충돌: NOTAM lowerLimit/upperLimit과 항로 flightLevel 비교

#### `calculateTemporalOverlap`

- **시그니처**: `(notam: Notam, flight: Flight) => boolean`
- NOTAM effectiveFrom~effectiveTo 구간과 flight scheduledDeparture~scheduledArrival 구간의 중첩 여부

#### `calculateAllImpacts`

- **시그니처**: `(notamId?: string) => { routeImpacts: NotamRouteImpact[]; flightImpacts: NotamFlightImpact[] }`
- **알고리즘**:
  1. notamId 지정 시 해당 NOTAM만, 미지정 시 active 상태 전체 NOTAM
  2. 각 NOTAM에 대해 모든 active 항로와 calculateSpatialOverlap 실행
  3. overlaps=true인 항로에 대해 해당 항로의 운항편과 calculateTemporalOverlap 실행
  4. 결과를 ImpactRepository에 저장
  5. 생성된 impact 목록 반환

### 5.3 Q-Code 서비스 (`src/lib/services/qCode.service.ts`)

- **파일 경로**: `src/lib/services/qCode.service.ts`
- **요구사항**: FR-002

#### `parseQLine`

- **시그니처**: `(qLine: string) => { fir; qCode; subject; condition; trafficType; purpose; scope; lowerLimit; upperLimit; coordinates; radius }`
- Q-line 형식: `Q) FIR/QCODE/TRAFFIC/PURPOSE/SCOPE/LOWER/UPPER/COORDSRADIUS`
- 슬래시(/) 구분자로 파싱
- 좌표 형식: `DDMMN/DDDMME` → 위/경도 10진수 변환
- 반경: 마지막 3자리 (해리)

#### `classifyByQCode`

- **시그니처**: `(qCode: string) => { subject; condition; defaultImportance; description; descriptionKo }`
- QCodeRepository에서 조회, 매칭 없을 시 기본값 ('medium')

### 5.4 NOTAM Diff 서비스 (`src/lib/services/notamDiff.service.ts`)

- **파일 경로**: `src/lib/services/notamDiff.service.ts`
- **요구사항**: FR-018

#### `calculateDiff`

- **시그니처**: `(original: Notam, replacement: Notam) => DiffChange[]`
- 비교 대상 필드: body, effectiveFrom, effectiveTo, lowerLimit, upperLimit, latitude, longitude, radius, schedule
- 값이 다른 필드만 DiffChange 배열로 반환

---

## 6. API Route Handlers

모든 API 라우트는 Next.js 15 App Router의 Route Handler 형식. `NextRequest`/`NextResponse` 사용.

### 6.1 NOTAM API

#### GET `/api/notams` — NOTAM 목록 조회

- **파일 경로**: `src/app/api/notams/route.ts`
- **요구사항**: FR-001, FR-005, FR-019

| 항목 | 값 |
|------|---|
| Method | GET |
| Query Params | importance, status, airport, qCode, sortBy, order, page, pageSize, expiryStatus |
| Validation | notamQuerySchema |
| Response | `{ items: Notam[]; total: number; stats: NotamStats }` |

**처리 흐름**:
1. URL searchParams 추출 → notamQuerySchema 검증
2. NotamRepository.findAll() 호출
3. 성공: 200 + JSON 응답
4. 검증 실패: 400 + ApiErrorResponse

#### GET `/api/notams/[id]` — NOTAM 상세 조회

- **파일 경로**: `src/app/api/notams/[id]/route.ts`
- **요구사항**: FR-002, FR-012

| 항목 | 값 |
|------|---|
| Method | GET |
| Response | `Notam` |

**처리 흐름**:
1. params에서 id 추출
2. NotamRepository.findById() 호출
3. 미발견: 404 + ApiErrorResponse

#### POST `/api/notams/analyze` — NOTAM AI 분석

- **파일 경로**: `src/app/api/notams/analyze/route.ts`
- **요구사항**: FR-001, FR-003

| 항목 | 값 |
|------|---|
| Method | POST |
| Request Body | `{ notamId: string }` |
| Validation | analyzeNotamSchema |
| Response | `{ importanceScore: number; importanceLevel: ImportanceLevel; aiSummary: string; aiAnalysis: string }` |

**처리 흐름**:
1. 요청 본문 파싱 → analyzeNotamSchema 검증
2. NotamRepository.findById(notamId) → 미발견 시 404
3. QCodeService.classifyByQCode(notam.qCode) 호출 (규칙 기반 사전 분류)
4. AirportRepository.findByIcao(notam.locationIndicator) 호출 (공항 맥락)
5. BedrockService.analyzeNotamImportance(notam, qCode, airport) 호출 (실제 LLM)
6. NotamRepository.update() 로 분석 결과 저장
7. 200 + 분석 결과 반환

**에러 처리**:
- 400: 검증 실패
- 404: NOTAM 미발견
- 500: Bedrock API 오류 (에러 메시지 포함)

#### POST `/api/notams/[id]/summarize` — NOTAM 한국어 요약

- **파일 경로**: `src/app/api/notams/[id]/summarize/route.ts`
- **요구사항**: FR-015

| 항목 | 값 |
|------|---|
| Method | POST |
| Response | `{ summary: string }` |

**처리 흐름**:
1. NOTAM 조회 → BedrockService.generateKoreanSummary() → NOTAM.aiSummary 업데이트 → 반환

#### POST `/api/notams/[id]/impact-analysis` — NOTAM 종합 영향 분석

- **파일 경로**: `src/app/api/notams/[id]/impact-analysis/route.ts`
- **요구사항**: FR-003

| 항목 | 값 |
|------|---|
| Method | POST |
| Response | `{ affectedRoutes: NotamRouteImpact[]; affectedFlights: NotamFlightImpact[]; contextualSeverity: string }` |

**처리 흐름**:
1. NOTAM 조회
2. ImpactRepository에서 기존 영향 데이터 조회
3. 없으면 MatchingService.calculateAllImpacts(notamId) 실행
4. 공항 맥락 조회
5. BedrockService.generateImpactAnalysis() 호출
6. 영향 데이터 + AI 분석 결과 반환

#### GET `/api/notams/[id]/affected-flights` — 영향받는 운항편

- **파일 경로**: `src/app/api/notams/[id]/affected-flights/route.ts`
- **요구사항**: FR-004

#### GET `/api/notams/[id]/affected-routes` — 영향받는 항로

- **파일 경로**: `src/app/api/notams/[id]/affected-routes/route.ts`
- **요구사항**: FR-004

#### GET `/api/notams/[id]/diff` — NOTAM 변경 비교

- **파일 경로**: `src/app/api/notams/[id]/diff/route.ts`
- **요구사항**: FR-018

| 항목 | 값 |
|------|---|
| Method | GET |
| Response | `{ original: Notam; replacement: Notam; changes: DiffChange[] }` |

**처리 흐름**:
1. 현재 NOTAM 조회
2. replacesNotamId가 있으면 → 현재가 replacement, original 조회
3. replacesNotamId가 없으면 → 현재가 original, findByReplacesId로 replacement 조회
4. 둘 다 없으면 404 (diff 대상 없음)
5. NotamDiffService.calculateDiff() 호출
6. 두 NOTAM + 변경사항 반환

#### GET `/api/notams/alerts` — 긴급 NOTAM 알림

- **파일 경로**: `src/app/api/notams/alerts/route.ts`
- **요구사항**: FR-016

#### GET `/api/notams/stats` — NOTAM 통계

- **파일 경로**: `src/app/api/notams/stats/route.ts`
- **요구사항**: FR-005

### 6.2 Q-Code API

#### GET `/api/q-codes` — Q-Code 참조 테이블

- **파일 경로**: `src/app/api/q-codes/route.ts`
- **요구사항**: FR-002

### 6.3 Flight API

#### GET `/api/flights` — 운항편 목록

- **파일 경로**: `src/app/api/flights/route.ts`
- **요구사항**: FR-013

| 항목 | 값 |
|------|---|
| Method | GET |
| Query Params | airport, route, date, impactStatus, sortBy, order, page, pageSize |
| Validation | flightQuerySchema |
| Response | `{ items: Flight[]; total: number }` |

#### GET `/api/flights/[id]` — 운항편 상세

- **파일 경로**: `src/app/api/flights/[id]/route.ts`
- **요구사항**: FR-004, FR-013

| 항목 | 값 |
|------|---|
| Method | GET |
| Response | `Flight & { route: Route; affectedNotams: Notam[] }` |

**처리 흐름**:
1. Flight 조회
2. Route 조회 (routeId)
3. FlightImpact 조회 → NOTAM ID 추출 → NOTAM 상세 조회
4. 확장된 Flight 객체 반환

### 6.4 Route API

#### GET `/api/routes` — 항로 목록

- **파일 경로**: `src/app/api/routes/route.ts`
- **요구사항**: FR-006, FR-010

#### GET `/api/routes/[id]` — 항로 상세

- **파일 경로**: `src/app/api/routes/[id]/route.ts`
- **요구사항**: FR-010

| 항목 | 값 |
|------|---|
| Method | GET |
| Response | `Route & { impacts: NotamRouteImpact[]; activeNotams: Notam[] }` |

#### POST `/api/routes/[id]/alternatives` — 대체 항로 제안

- **파일 경로**: `src/app/api/routes/[id]/alternatives/route.ts`
- **요구사항**: FR-009

| 항목 | 값 |
|------|---|
| Method | POST |
| Request Body | `{ notamId: string }` |
| Validation | routeAlternativesSchema |
| Response | `{ alternatives: RouteAlternative[]; reasoning: string }` |

**처리 흐름**:
1. 항로 + NOTAM 조회
2. RouteRepository.findAlternates()로 대체 항로 목록
3. BedrockService.suggestRouteAlternatives() 호출
4. AI 추천 + 비교 데이터 반환

#### GET `/api/routes/[id]/impact` — 항로 NOTAM 영향

- **파일 경로**: `src/app/api/routes/[id]/impact/route.ts`
- **요구사항**: FR-010

### 6.5 Matching API

#### POST `/api/matching/calculate` — 매칭 계산

- **파일 경로**: `src/app/api/matching/calculate/route.ts`
- **요구사항**: FR-010

#### GET `/api/matching/results` — 매칭 결과 조회

- **파일 경로**: `src/app/api/matching/results/route.ts`
- **요구사항**: FR-010

### 6.6 REF BOOK API

#### GET/POST `/api/ref-book` — REF BOOK CRUD

- **파일 경로**: `src/app/api/ref-book/route.ts`
- **요구사항**: FR-011

**GET 처리**: RefBookRepository.findAll() + 페이지네이션

**POST 처리**:
1. createRefBookEntrySchema 검증
2. RefBookRepository.create()
3. NotamRepository.update(notamId, { status: 'ref-book-registered' })
4. AuditLogRepository.create() (감사 기록)
5. 201 + 생성된 항목

#### PUT/DELETE `/api/ref-book/[id]` — REF BOOK 항목 수정/삭제

- **파일 경로**: `src/app/api/ref-book/[id]/route.ts`
- **요구사항**: FR-011

### 6.7 Briefing API

#### GET `/api/briefings` — 브리핑 목록

- **파일 경로**: `src/app/api/briefings/route.ts`
- **요구사항**: FR-007, FR-008

#### POST `/api/briefings/generate` — 브리핑 생성

- **파일 경로**: `src/app/api/briefings/generate/route.ts`
- **요구사항**: FR-007

**처리 흐름**:
1. generateBriefingSchema 검증
2. Flight 조회 + 해당 운항편 관련 NOTAM 조회 (ImpactRepository 경유)
3. BedrockService.generateBriefingContent(flight, notams, type)
4. BriefingRepository.create() (status: 'draft')
5. AuditLogRepository.create() (감사 기록)
6. 201 + 생성된 브리핑

#### POST `/api/briefings/generate-crew` — 승무원 브리핑 패키지 생성

- **파일 경로**: `src/app/api/briefings/generate-crew/route.ts`
- **요구사항**: FR-008

#### GET/PUT `/api/briefings/[id]` — 브리핑 상세/수정

- **파일 경로**: `src/app/api/briefings/[id]/route.ts`
- **요구사항**: FR-007, FR-008

**PUT 특수 로직**: status가 'approved'로 변경될 경우 approvedBy, approvedAt 자동 설정

#### GET `/api/briefings/[id]/crew-package` — 승무원 브리핑 패키지 조회

- **파일 경로**: `src/app/api/briefings/[id]/crew-package/route.ts`
- **요구사항**: FR-008

### 6.8 Report API

#### POST `/api/reports/shift-handover` — 교대 인수인계 보고서 생성

- **파일 경로**: `src/app/api/reports/shift-handover/route.ts`
- **요구사항**: FR-014

**처리 흐름**:
1. shiftHandoverSchema 검증
2. 교대 시간 내 신규/변경 NOTAM 조회
3. BedrockService.generateShiftHandoverReport()
4. BriefingRepository.create() (type: 'dispatcher-summary')
5. 201 + 생성된 보고서

#### GET `/api/reports/shift-handover/[id]` — 인수인계 보고서 조회

- **파일 경로**: `src/app/api/reports/shift-handover/[id]/route.ts`
- **요구사항**: FR-014

### 6.9 Dashboard API

#### GET `/api/dashboard/route-impact` — 대시보드 데이터

- **파일 경로**: `src/app/api/dashboard/route-impact/route.ts`
- **요구사항**: FR-006

| 항목 | 값 |
|------|---|
| Method | GET |
| Query Params | routeId (선택) |
| Response | `{ summary: DashboardSummary; routeImpacts: RouteImpactMapData[]; criticalNotams: Notam[] }` |

**처리 흐름**:
1. NotamRepository.getStats() → 통계
2. 전체 active 항로 조회
3. 각 항로에 대해 ImpactRepository.findRouteImpactsByRoute() + NOTAM 상세 조회
4. RouteImpactMapData[] 구성
5. routeId 지정 시 해당 항로만 필터
6. DashboardSummary 계산 (totalActiveNotams, criticalCount, highCount, affectedRoutesCount, affectedFlightsCount, filteredVsTotalRatio)
7. criticalNotams = NotamRepository.findAlerts()

### 6.10 Audit Log API

#### GET/POST `/api/audit-log` — 감사 로그 조회/생성

- **파일 경로**: `src/app/api/audit-log/route.ts`
- **요구사항**: FR-017

### 6.11 Auth API

#### POST `/api/auth/login` — 목 로그인

- **파일 경로**: `src/app/api/auth/login/route.ts`
- **요구사항**: NFR-001

| 항목 | 값 |
|------|---|
| Method | POST |
| Request Body | `{ username: string; password: string }` |
| Validation | loginSchema |
| Response | `{ token: string; user: Dispatcher }` |

**처리 흐름**:
1. loginSchema 검증
2. SEED_DISPATCHERS에서 username으로 조회 (employeeId 또는 name 매칭)
3. 비밀번호는 비어있지 않으면 통과 (목 인증)
4. 토큰: Base64 인코딩된 `{ userId, name, role, exp }` JSON
5. 200 + { token, user }

---

## 7. 미들웨어

### 7.1 보안 헤더 미들웨어 (`src/middleware.ts`)

- **파일 경로**: `src/middleware.ts`
- **요구사항**: NFR-005

```typescript
import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js 미들웨어 — 모든 라우트에 보안 헤더 추가
 */
export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org; " +
    "connect-src 'self'; font-src 'self'"
  );

  return response;
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
```

**CSP 특이사항**:
- `img-src`에 OpenStreetMap 타일 서버 허용 (Leaflet 지도용)
- `unsafe-eval`과 `unsafe-inline`은 Next.js 개발 모드 호환성을 위해 포함 (프로덕션에서는 nonce 기반으로 교체 권장)

---

## 파일 의존성 그래프 (생성 순서)

```
1. src/types/*              ← 의존성 없음 (가장 먼저 생성)
2. src/lib/validation/*     ← types import
3. src/data/*               ← types import
4. src/lib/db/store.ts      ← types + data import
5. src/lib/db/*.repository  ← store + types import
6. src/lib/services/*       ← repositories + types + @aws-sdk import
7. src/app/api/**/route.ts  ← repositories + services + validation import
8. src/middleware.ts         ← next/server import만
```

---

## 에러 처리 공통 패턴

모든 API Route Handler는 다음 패턴을 준수한다:

```typescript
try {
  // 검증 + 비즈니스 로직
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation Error', message: error.errors[0].message, statusCode: 400 },
      { status: 400 }
    );
  }
  console.error(`[API] ${path} error:`, error);
  return NextResponse.json(
    { error: 'Internal Server Error', message: '서버 오류가 발생했습니다.', statusCode: 500 },
    { status: 500 }
  );
}
```

---

## 요구사항 커버리지 매트릭스

| FR | API Routes | Services | Repository |
|----|-----------|----------|------------|
| FR-001 | notams, notams/analyze | BedrockService | NotamRepository |
| FR-002 | notams/[id], q-codes | QCodeService | NotamRepository, QCodeRepository |
| FR-003 | notams/[id]/impact-analysis | BedrockService, MatchingService | NotamRepository, ImpactRepository |
| FR-004 | notams/[id]/affected-flights, affected-routes, flights/[id] | MatchingService | ImpactRepository |
| FR-005 | notams, notams/stats | - | NotamRepository |
| FR-006 | dashboard/route-impact, routes | - | RouteRepository, ImpactRepository, NotamRepository |
| FR-007 | briefings/generate, briefings/[id] | BedrockService | BriefingRepository |
| FR-008 | briefings/generate-crew, briefings/[id]/crew-package | BedrockService | BriefingRepository |
| FR-009 | routes/[id]/alternatives | BedrockService | RouteRepository |
| FR-010 | matching/calculate, matching/results, routes/[id]/impact | MatchingService | ImpactRepository, RouteRepository |
| FR-011 | ref-book, ref-book/[id] | - | RefBookRepository |
| FR-012 | notams/[id] | - | NotamRepository |
| FR-013 | flights, flights/[id] | - | FlightRepository |
| FR-014 | reports/shift-handover | BedrockService | BriefingRepository, NotamRepository |
| FR-015 | notams/[id]/summarize | BedrockService | NotamRepository |
| FR-016 | notams/alerts | - | NotamRepository |
| FR-017 | audit-log | - | AuditLogRepository |
| FR-018 | notams/[id]/diff | NotamDiffService | NotamRepository |
| FR-019 | notams (expiryStatus filter) | - | NotamRepository |
