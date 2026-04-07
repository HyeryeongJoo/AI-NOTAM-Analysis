# 프로토타입 변경 이력

## 요약

| 버전 | 날짜 | 트리거 | 요구사항 | 주요 변경 |
|------|------|--------|---------|----------|
| v1 | 2026-03-30 | `/pipeline` | FR 19개 (P0:8, P1:7, P2:4) | 초기 프로토타입 (12 페이지, 35 API, AI 7개 함수) |
| v2 | 2026-04-02 | `/iterate` | FR 20개 (P0:8, P1:8, P2:4) | 고객 데모 피드백 반영 + TIFRS 의사결정 기능 추가 |

---

## v1 — 초기 프로토타입

- **날짜**: 2026-03-30
- **트리거**: `/pipeline` (최초 전체 실행)
- **요구사항**: 19개 FR (P0: 8개, P1: 7개, P2: 4개)
- **파이프라인 단계**: domain-researcher → requirements-analyst → architect → spec-writer → code-gen-backend → code-gen-ai → code-gen-frontend → QA → reviewer → security-auditor
- **생성 파일**: 약 115개 (백엔드 46, 프론트엔드 69)
- **QA 결과**: 52/52 테스트 통과 (3회 이터레이션)
- **코드 리뷰**: PASS (9/9 카테고리, critical 0건, minor 2건)
- **보안 감사**: PASS (critical 0, high 0, medium 3, low 4)

### 구현된 주요 기능

| FR | 제목 | 우선순위 |
|----|------|---------|
| FR-001 | LLM 기반 NOTAM 중요도 분석 | P0 |
| FR-002 | Q-Code 기반 초기 분류 | P0 |
| FR-003 | 공간/스케줄 종합 분석 | P0 |
| FR-004 | 운항편/항로 자동 매칭 | P0 |
| FR-005 | 중요 NOTAM 자동 필터링 | P0 |
| FR-006 | 항로 영향 분석 대시보드 (지도) | P0 |
| FR-007 | 디스패처 브리핑 자동 생성 | P0 |
| FR-008 | 승무원 브리핑 자료 생성 | P1 |
| FR-009 | 항로 변경 의사결정 지원 | P1 |
| FR-010 | NOTAM-항로/스케줄 매칭 알고리즘 | P0 |
| FR-011 | REF BOOK 관리 | P1 |
| FR-012 | NOTAM 상세 뷰 + AI 분석 | P1 |
| FR-013 | 운항편 스케줄 조회 | P1 |
| FR-014 | 교대 근무 보고서 | P1 |
| FR-015 | AI 한국어 요약 | P1 |
| FR-016 | 긴급 NOTAM 알림 | P2 |
| FR-017 | 감사 로그 | P2 |
| FR-018 | NOTAM 변경 비교 (NOTAMR) | P2 |
| FR-019 | NOTAM 만료 관리 | P2 |

---

## v2 — 고객 데모 피드백 반영

- **날짜**: 2026-04-02
- **트리거**: `/iterate` (고객 피드백 + 신규 입력)
- **재진입 지점**: `requirements-analyst`
- **요구사항**: 20개 FR (기존 19개 유지 + FR-020 추가)
- **QA 결과**: 63/63 테스트 통과 (4회 이터레이션, v1 테스트 52개 보존 + v2 테스트 11개 추가)
- **코드 리뷰**: PASS (9/9 카테고리, critical 0건, minor 2건)

### 변경 트리거

1. **고객 데모 피드백** (13건의 직접 코드 변경, CC-001 ~ CC-013)
   - 지도 인프라 수정: Leaflet CSS import, 마커 아이콘, 래퍼 사이징 (CC-001~003)
   - 지도 UX 개선: 범례, NOTAM 팝업, 항로 전체 옵션, 중요도 색상 (CC-004~007, CC-012~013)
   - 데이터 필터링 변경: critical + high NOTAM 포함, 지도 데이터 소스 변경 (CC-008~009)
   - 상태 설명 팝오버: 항로/운항편 테이블 상태 컬럼 (CC-010~011)

2. **신규 입력**: `항공정보분석workflow.png` (워크플로우 다이어그램) 분석 → FR-020 도출

### 요구사항 변경

| 변경 유형 | FR | 설명 |
|----------|-----|------|
| 수용 기준 업데이트 | FR-005 | 대시보드 중요 NOTAM 위젯이 critical + high 포함 |
| 수용 기준 추가 | FR-006 | 지도 범례, NOTAM 팝업, 전체 옵션, 설명 Popover, 중요도 색상 |
| 수용 기준 추가 | FR-009 | 운항편 지도 NOTAM 팝업, 중요도별 색상 |
| 수용 기준 추가 | FR-010 | 항로 상태 설명 팝오버 |
| 수용 기준 추가 | FR-013 | 운항편 상태 설명 팝오버 |
| **신규 추가** | **FR-020** | **TIFRS 의사결정 문서화** — AI 기반 의사결정 사전 분석 + TIFRS 폼 + 기록 관리 |

### v2 신규 파일 (14개)

| 파일 유형 | 파일 | 설명 |
|----------|------|------|
| 페이지 | `src/app/decisions/page.tsx` | 의사결정 기록 목록 |
| 컴포넌트 | `src/components/notams/NotamDecisionSection.tsx` | TIFRS 의사결정 폼 |
| 컴포넌트 | `src/components/decisions/DecisionTable.tsx` | 의사결정 테이블 |
| 컴포넌트 | `src/components/decisions/DecisionSplitPanelDetail.tsx` | 의사결정 상세 패널 |
| 컴포넌트 | `src/components/common/DecisionTypeBadge.tsx` | 의사결정 유형 배지 |
| API | `src/app/api/notams/[id]/decision/route.ts` | NOTAM 의사결정 CRUD |
| API | `src/app/api/decisions/route.ts` | 의사결정 목록 조회 |
| 훅 | `src/hooks/useDecisions.ts` | 의사결정 목록 훅 |
| 훅 | `src/hooks/useNotamDecision.ts` | NOTAM 의사결정 조회 훅 |
| 훅 | `src/hooks/useRecordDecision.ts` | 의사결정 기록 뮤테이션 훅 |
| 타입 | `src/types/decision.ts` | DecisionRecord, DecisionType |
| Repository | `src/lib/db/decision.repository.ts` | 의사결정 데이터 접근 |
| Validation | `src/lib/validation/decision.validation.ts` | 의사결정 Zod 스키마 |
| 시드 데이터 | `src/data/decisions.ts` | TIFRS 의사결정 5건 |

### v2 수정 파일 (11개)

| 파일 | 변경 내용 |
|------|----------|
| `src/components/dashboard/RouteImpactMap.tsx` | 범례, 팝업, 전체 옵션, 데이터 소스 변경, Popover |
| `src/components/flights/FlightRouteMap.tsx` | NOTAM 팝업, 중요도별 색상 |
| `src/components/common/LeafletMapInner.tsx` | CSS ES module import, 마커 아이콘 수정 |
| `src/components/routes/RouteTable.tsx` | 상태 컬럼 info Popover |
| `src/components/flights/FlightTable.tsx` | 상태 컬럼 info Popover |
| `src/components/dashboard/RecentCriticalNotams.tsx` | critical + high 표시 |
| `src/app/api/dashboard/route-impact/route.ts` | critical + high 필터 |
| `src/app/layout.tsx` | Leaflet CDN 링크 제거 |
| `src/components/layout/AppShell.tsx` | 의사결정 메뉴 추가 |
| `src/app/notams/[id]/page.tsx` | 의사결정 섹션 추가 |
| `src/lib/services/bedrock.service.ts` | TIFRS 분석 함수 추가 |

### 보존된 파일

- v1에서 생성된 115개 파일 중 104개는 변경 없이 보존
- 데모 피드백으로 수정된 8개 + v2 기능 추가로 수정된 3개 = 총 11개 수정

---

## 의사결정 기록

프로토타입 과정에서의 주요 설계 결정:

| 결정 | 버전 | 이유 |
|------|------|------|
| 인메모리 스토어 사용 | v1 | 프로토타입 속도 — DB 설정 없이 즉시 실행. Repository 패턴으로 추상화하여 교체 용이 |
| Bedrock 직접 API 호출 (Strands SDK 미사용) | v1 | AI-Assisted 패턴(autonomy ≤ 5)으로 도구 체인 불필요. 구조화 프롬프트 + JSON 파싱으로 충분 |
| SWR 선택 (React Query 대신) | v1 | 경량, React 19 호환, Next.js App Router와 자연스러운 통합 |
| 대시보드 critical + high 필터로 변경 | v2 | 고객 요청: critical만으로는 중요 NOTAM이 너무 적게 표시됨 |
| 지도 데이터 소스를 routeImpacts.notams로 변경 | v2 | 고객 요청: 전체 항로의 모든 NOTAM을 지도에 표시하여 상황 인식 향상 |
| TIFRS 의사결정 기능 추가 (FR-020) | v2 | 워크플로우 다이어그램 분석에서 도출: 운항관리사의 의사결정 근거 체계적 문서화 필요 |
| Mock 인증 유지 | v1~v2 | 프로토타입 목적 — 인증 구현보다 도메인 기능에 집중. 프로덕션 전환 시 Cognito로 교체 |
