ㅈ# 스펙 요약 — 제주항공 AI NOTAM 분석 시스템 v2

> 생성일: 2026-04-01 | 버전: v2

## 전체 개요

| 구분 | 스펙 수 | 비고 |
|------|--------|------|
| 백엔드 스펙 | 45 | types, validation, data, db, services, api, middleware |
| 프론트엔드 스펙 | 44 | hooks 17, contexts 3, layout 2, shared 8, feature 26, pages 12 |
| **합계** | **89** | v1(80) + v2 delta(9) |

## v2 변경 요약

### 신규 요구사항

- **FR-020**: TIFRS 기반 의사결정 기록 — Time/Impact/Facilities/Route/Schedule 기준으로 NOTAM 운항 결정을 문서화

### 백엔드 추가 사항 (backend-spec.json)

1. **DecisionRecord 타입** (`src/types/decision.ts`) — TIFRS 5개 필드 + 종합 결정 + AI 제안
2. **DecisionType 열거형** — no-action, monitor, route-change, schedule-change, cancel-flight, divert
3. **의사결정 검증 스키마** (`src/lib/validation/decision.ts`) — zod 기반 요청 검증
4. **의사결정 시드 데이터** (`src/data/decisions.ts`) — 5~10개 샘플 결정 기록
5. **의사결정 Repository** (`src/lib/db/decision.repository.ts`) — 인메모리 CRUD
6. **NOTAM 의사결정 API** (`src/app/api/notams/[id]/decision/route.ts`) — GET/POST
7. **의사결정 목록 API** (`src/app/api/decisions/route.ts`) — GET with 필터링

### 프론트엔드 추가 사항 (frontend-spec.json)

1. **useDecisions** 훅 — 의사결정 목록 조회 (GET /api/decisions)
2. **useNotamDecision** 훅 — 특정 NOTAM의 의사결정 조회 (GET /api/notams/[id]/decision)
3. **useRecordDecision** 훅 — 의사결정 기록 (POST /api/notams/[id]/decision)
4. **DecisionTypeBadge** 공유 컴포넌트 — DecisionType 색상 배지
5. **NotamDecisionSection** 기능 컴포넌트 — NOTAM 상세에 내장된 TIFRS 폼
6. **DecisionTable** 기능 컴포넌트 — 의사결정 목록 Table + SplitPanel
7. **DecisionSplitPanelDetail** 기능 컴포넌트 — 의사결정 상세 SplitPanel
8. **DecisionListPage** 페이지 — /decisions 라우트

### 기존 컴포넌트 변경

| 컴포넌트 | 변경 유형 | 내용 |
|---------|----------|------|
| AppShell | SideNav 수정 | "의사결정 기록" 링크 추가 (관리 섹션) |
| NotamDetailPage | children 추가 | NotamDecisionSection 추가, FR-020 요구사항 추가 |
| AuditLogTable | 매핑 추가 | record-decision 액션 한국어 라벨 추가 |
| 8개 컴포넌트 | v2_status:implemented | 이미 코드 적용 완료 (데모 피드백 반영) |

## 요구사항 커버리지

20개 FR 전체 커버됨. 미커버 요구사항 없음.

| FR | 백엔드 | 프론트엔드 |
|----|--------|-----------|
| FR-001 | notam-types, analyzeNotamSchema, notam-repository, bedrock-service, notam-analyze-api | useNotams, useNotamAnalysis, NotamTable, NotamAiAnalysis, ImportanceBadge, ImportanceScoreBar |
| FR-002 | notam-types, qcode-types, qcode-service, notam-detail-api, qcode-api | useNotam, NotamTable, NotamRawAndParsed, NotamSplitPanelDetail |
| FR-003 | impact-types, bedrock-service, notam-impact-analysis-api | NotamAiAnalysis, NotamImpactSection |
| FR-004 | impact-types, flight-types, matching-service | useFlights, useFlight, FlightTable, FlightNotamImpact, NotamImpactSection |
| FR-005 | notam-repository, notam-list-api, notam-stats-api | useNotams, useDashboard, NotamTable, DashboardSummaryCards, RecentCriticalNotams |
| FR-006 | dashboard-types, route-types, dashboard-route-impact-api | useDashboard, useRoutes, RouteImpactMap, DashboardSummaryCards, LeafletMapWrapper |
| FR-007 | briefing-types, bedrock-service, briefing-generate-api | useBriefings, useGenerateBriefing, BriefingTable, FlightBriefingActions |
| FR-008 | briefing-types, briefing-generate-crew-api | BriefingContentPreview, FlightBriefingActions |
| FR-009 | route-types, bedrock-service, route-alternatives-api | useRouteAlternatives, RouteDeviationGuidance, FlightRouteMap |
| FR-010 | impact-types, matching-service, route-list-api | useRoutes, useRoute, RouteTable, RouteInfo, RouteNotamImpacts |
| FR-011 | refbook-types, refbook-repository, refbook-api | useRefBook, RefBookTable, RefBookRegistrationModal |
| FR-012 | notam-detail-api | useNotam, NotamRawAndParsed, NotamMiniMap |
| FR-013 | flight-types, flight-list-api, flight-detail-api | useFlights, useFlight, FlightTable, FlightInfo |
| FR-014 | briefing-types, shift-handover-api | useBriefings, BriefingTable |
| FR-015 | notam-summarize-api | NotamAiAnalysis |
| FR-016 | notam-alerts-api | AlertContext, CriticalAlertBanner, RecentCriticalNotams |
| FR-017 | auditlog-types, auditlog-api | useAuditLog, AuditLogTable |
| FR-018 | notam-diff-api | NotamDiffView |
| FR-019 | notam-list-api | useNotams, NotamTable, NotamExpiryIndicator |
| **FR-020** | **decision-types, decision-validation, decision-repository, decision-api** | **useDecisions, useNotamDecision, useRecordDecision, DecisionTypeBadge, NotamDecisionSection, DecisionTable, DecisionSplitPanelDetail, DecisionListPage** |

## 생성 순서

```
[백엔드]  types → validation → data → db → services → api → middleware
[프론트엔드]  hooks → contexts → layout → shared → feature → page
```

프론트엔드는 백엔드 types를 import하므로, 백엔드가 먼저 생성되어야 한다.
