# 리비전 영향도 분석: v1 -> v2

## 분석 개요

| 항목 | 값 |
|------|-----|
| 분석 일시 | 2026-04-01 |
| 트리거 | `/iterate` (데모 중 피드백 + 신규 입력) |
| 신규 입력 파일 | 1건 (항공정보분석workflow.png) |
| 직접 코드 변경 | 13건 (CC-001 ~ CC-013) |
| 영향받는 FR | 5건 (FR-005, FR-006, FR-009, FR-010, FR-013) |
| 영향받는 코드 파일 | 8건 (이미 적용 완료) |
| 변경 없는 파일 | 107건 |

---

## 1. 입력 변경 요약

| 파일 | 상태 | 유형 | 비고 |
|------|------|------|------|
| JejuAir-AI-Powered-NOTAM-Analysis-System-Requirements.pdf | 변경 없음 | 요구사항 문서 | v1 입력 그대로 |
| 항공정보분석workflow.png | **추가됨** | 워크플로우 다이어그램 | 274KB, 2026-03-31 추가 |

### 신규 입력 분석

`항공정보분석workflow.png`는 항공 정보 분석 워크플로우 다이어그램으로, v1 manifest에 포함되지 않은 신규 입력이다. 파일명 인코딩 문제로 내용을 직접 확인할 수 없었으며, **requirements-analyst 단계에서 시각적 분석이 필요하다**.

이 다이어그램이 포함할 수 있는 내용:
- 현재 운항관리사의 NOTAM 분석 워크플로우 (as-is)
- AI 기반 분석 시스템의 목표 워크플로우 (to-be)
- 새로운 프로세스 단계나 요구사항

---

## 2. 직접 코드 변경 분석 (13건)

데모 중 사용자 피드백에 기반하여 파이프라인 외부에서 직접 수행된 코드 변경이다.

### 2-1. 지도 인프라 수정 (CC-001 ~ CC-003) -- 버그 수정

| ID | 변경 내용 | 영향 파일 |
|----|----------|----------|
| CC-001 | Leaflet CSS를 CDN 링크에서 모듈 import로 변경 | `layout.tsx`, `LeafletMapInner.tsx` |
| CC-002 | Leaflet 마커 아이콘 webpack 호환성 수정 | `LeafletMapInner.tsx` |
| CC-003 | 지도 래퍼 div에 position:relative 추가 | `RouteImpactMap.tsx` |

- **유형**: 버그 수정 (지도 렌더링 불량)
- **요구사항 영향**: 없음 (구현 세부사항)
- **아키텍처 영향**: LeafletMapInner 컴포넌트 내부 변경만

### 2-2. 지도 UX 개선 (CC-004 ~ CC-007, CC-012, CC-013) -- 기능 강화

| ID | 변경 내용 | 영향 컴포넌트 |
|----|----------|-------------|
| CC-004 | 지도 범례 추가 (Critical/High/Other 색상 + 항로 선) | RouteImpactMap |
| CC-005 | 대시보드 지도에 NOTAM 원형 클릭 팝업 추가 | RouteImpactMap |
| CC-006 | 운항편 상세 지도에 동일 팝업 패턴 적용 | FlightRouteMap |
| CC-007 | 항로 드롭다운에 "전체" 옵션 추가 | RouteImpactMap |
| CC-012 | 대시보드 지도 헤더에 설명 팝오버 추가 | RouteImpactMap |
| CC-013 | 운항편 지도에 중요도별 NOTAM 색상 적용 | FlightRouteMap |

- **유형**: UI/UX 개선 (사용성 강화)
- **요구사항 영향**: FR-006 (지도 대시보드) 수용 기준 확장 필요
- **아키텍처 영향**: RouteImpactMap과 FlightRouteMap에 Popover 컴포넌트 추가

### 2-3. 데이터 필터링 변경 (CC-008, CC-009) -- 요구사항 수정

| ID | 변경 내용 | 영향 컴포넌트 |
|----|----------|-------------|
| CC-008 | 대시보드 criticalNotams API를 critical+high로 확장 | dashboard API, RecentCriticalNotams |
| CC-009 | 지도 NOTAM 소스를 criticalNotams에서 routeImpacts.notams로 변경 | RouteImpactMap |

- **유형**: 요구사항 변경 (데이터 범위 확대)
- **요구사항 영향**: FR-005, FR-006 수용 기준 업데이트 필요
- **아키텍처 영향**: API 응답 구조 및 컴포넌트 데이터 소스 변경

### 2-4. 상태 설명 팝오버 (CC-010, CC-011) -- UX 개선

| ID | 변경 내용 | 영향 컴포넌트 |
|----|----------|-------------|
| CC-010 | RouteTable "상태" 컬럼에 active/suspended/alternate 설명 팝오버 | RouteTable |
| CC-011 | FlightTable "상태" 컬럼에 상태값 설명 팝오버 | FlightTable |

- **유형**: UX 개선 (정보 접근성)
- **요구사항 영향**: FR-010, FR-013에 "상태 설명 제공" 수용 기준 추가 가능
- **아키텍처 영향**: 두 테이블 컴포넌트에 Popover 추가

---

## 3. 요구사항 영향 분석

### 수정 필요 요구사항

| FR | 변경 유형 | 변경 내용 | 관련 코드 변경 |
|----|----------|----------|--------------|
| FR-005 | 수용 기준 업데이트 | "중요 NOTAM" 위젯이 critical+high를 포함하도록 명시 | CC-008 |
| FR-006 | 수용 기준 추가 | 지도 범례, NOTAM 팝업, 항로 전체 옵션, 설명 팝오버, 중요도별 색상 반영 | CC-004/005/007/009/012 |
| FR-009 | 수용 기준 추가 | 운항편 지도에 NOTAM 팝업 및 중요도 색상 반영 | CC-006/013 |
| FR-010 | 수용 기준 추가 | 항로 상태 설명 팝오버 제공 | CC-010 |
| FR-013 | 수용 기준 추가 | 운항편 상태 설명 팝오버 제공 | CC-011 |

### 잠재적 신규 요구사항

- `항공정보분석workflow.png`에서 추가 요구사항이 도출될 수 있음 (requirements-analyst에서 분석 필요)

---

## 4. 아키텍처 영향 분석

### 수정 필요 컴포넌트 (6건)

| 컴포넌트 | 경로 | 변경 내용 |
|----------|------|----------|
| RouteImpactMap | `src/components/dashboard/RouteImpactMap.tsx` | 범례, 팝업, 전체 옵션, 데이터 소스 변경, 설명 팝오버, 래퍼 div |
| FlightRouteMap | `src/components/flights/FlightRouteMap.tsx` | 팝업, 중요도 색상 |
| LeafletMapInner | `src/components/common/LeafletMapInner.tsx` | CSS import, 마커 아이콘 수정 |
| RouteTable | `src/components/routes/RouteTable.tsx` | 상태 팝오버 |
| FlightTable | `src/components/flights/FlightTable.tsx` | 상태 팝오버 |
| RecentCriticalNotams | `src/components/dashboard/RecentCriticalNotams.tsx` | critical+high 데이터 표시 |

### Cloudscape 컴포넌트 추가

- `Popover`: RouteImpactMap, RouteTable, FlightTable에 신규 추가 (architecture.json의 cloudscape_components에 반영 필요)

### 수정 필요 API

| API 경로 | 변경 내용 |
|----------|----------|
| `GET /api/dashboard/route-impact` | criticalNotams 필터를 critical+high로 확장 |

---

## 5. 스펙 영향 분석

| 스펙 파일 | 영향 범위 | 수정 내용 |
|----------|----------|----------|
| frontend-spec.json | 6개 컴포넌트 | RouteImpactMap, FlightRouteMap, LeafletMapInner, RouteTable, FlightTable, RecentCriticalNotams 스펙 업데이트 |
| backend-spec.json | 1개 API | dashboard-route-impact-api 필터 조건 업데이트 |

---

## 6. 코드 영향 분석

### 이미 수정된 파일 (8건) -- 재생성 불필요

| 파일 | 변경 유형 | 관련 CC |
|------|----------|---------|
| `src/app/layout.tsx` | CDN 링크 제거 | CC-001 |
| `src/components/common/LeafletMapInner.tsx` | CSS import + 마커 수정 | CC-001/002 |
| `src/components/dashboard/RouteImpactMap.tsx` | 대규모 리워크 (6건 반영) | CC-003/004/005/007/009/012 |
| `src/components/flights/FlightRouteMap.tsx` | 팝업 + 색상 | CC-006/013 |
| `src/components/routes/RouteTable.tsx` | 팝오버 추가 | CC-010 |
| `src/components/flights/FlightTable.tsx` | 팝오버 추가 | CC-011 |
| `src/app/api/dashboard/route-impact/route.ts` | 필터 변경 | CC-008 |
| `src/components/dashboard/RecentCriticalNotams.tsx` | 데이터 범위 변경 | CC-008 |

### 변경 없는 파일 (107건) -- 보존

- 백엔드: 46건 (types, repositories, services, API routes, middleware, seed data)
- 프론트엔드: 61건 (hooks, contexts, layout, 나머지 컴포넌트, pages)

---

## 7. 권장 재진입 지점

### `requirements-analyst`

**이유:**

1. **신규 입력 분석 필요**: `항공정보분석workflow.png`는 v1에서 처리되지 않은 새 입력이며, 워크플로우 다이어그램에서 추가 요구사항이 도출될 수 있다.

2. **요구사항 정합성 복구**: 13건의 직접 코드 변경 중 CC-008/CC-009는 FR-005/FR-006의 수용 기준을 실질적으로 변경했다. 현재 requirements.json은 이 변경을 반영하지 않아 아티팩트 간 불일치가 있다.

3. **정합성 원칙**: 코드가 먼저 변경되었더라도, 아티팩트 체인(requirements -> architecture -> specs -> code)의 정합성을 유지하려면 requirements부터 업데이트해야 한다.

### 재진입 전략

```
requirements-analyst (incremental)
    -> 항공정보분석workflow.png 분석
    -> FR-005/006/009/010/013 수용 기준 업데이트
    -> 신규 FR 추가 여부 판단

architect (incremental)
    -> 6개 컴포넌트의 cloudscape_components 업데이트
    -> Popover 추가 반영
    -> 데이터 소스 변경 반영

spec-writer (incremental)
    -> frontend-spec.json 6개 컴포넌트 스펙 업데이트
    -> backend-spec.json 1개 API 스펙 업데이트

code-generator
    -> 8개 파일은 이미 수정 완료 -- 재생성 스킵
    -> 워크플로우 다이어그램에서 신규 요구사항 발생 시에만 추가 생성
```

---

## 8. 주의사항

- **코드 보존**: 13건의 직접 코드 변경은 데모 피드백에 기반한 검증된 수정이므로, 파이프라인 재실행 시 이 변경을 덮어쓰지 않도록 주의해야 한다.
- **워크플로우 다이어그램**: 파일명 인코딩 문제로 현재 내용 확인이 불가하며, requirements-analyst 단계에서 반드시 시각적으로 분석해야 한다.
- **테스트 영향**: v1의 52개 E2E 테스트 중 지도 관련 테스트는 직접 코드 변경으로 인해 재검증이 필요할 수 있다.
- **빌드 검증**: 직접 코드 변경 후 빌드 성공 여부를 확인해야 한다.

---

## 9. 변경 규모 요약

| 구분 | 추가 | 수정 | 삭제 | 변경 없음 |
|------|------|------|------|----------|
| 요구사항 (FR) | 0 (잠재 TBD) | 5 | 0 | 14 |
| 아키텍처 컴포넌트 | 0 | 6 | 0 | ~40 |
| 스펙 | 0 | 2 | 0 | 0 |
| 코드 파일 | 0 | 8 (적용 완료) | 0 | 107 |

**전체 범위**: **medium** -- 기존 요구사항의 수용 기준 확장 + 신규 입력 분석. 구조적 변경(새 페이지, 새 라우트, 새 엔티티)은 없으며 기존 컴포넌트의 동작 개선이 주 내용이다.
