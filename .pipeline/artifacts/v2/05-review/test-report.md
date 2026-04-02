# E2E 테스트 리포트 v2

## 요약
- 총 테스트: 63개 (v1: 52개 + v2 신규: 11개)
- 통과: 63개
- 실패: 0개
- 이터레이션: 4회 (모두 인프라 수정, 기능 피드백 0건)
- 실행 시간: 약 35초

## v2 변경사항 테스트 범위

v2에서 추가된 FR-020 (TIFRS 의사결정 기록)에 대해 3개 신규 테스트 파일을 생성하고, navigation.spec.ts를 업데이트하였다.

### 신규 테스트 파일
| 파일 | 테스트 수 | 대상 FR | 설명 |
|------|----------|---------|------|
| `e2e/decisions.spec.ts` | 4 | FR-020 | /decisions 페이지 테이블, 컬럼, SplitPanel, 네비게이션 |
| `e2e/notam-decision.spec.ts` | 3 | FR-020 | NOTAM 상세 페이지 TIFRS 의사결정 섹션 |
| `e2e/decisions-api.spec.ts` | 3 | FR-020 | 의사결정 API 엔드포인트 계약 검증 |

### 업데이트된 테스트 파일
| 파일 | 변경 내용 |
|------|---------|
| `e2e/navigation.spec.ts` | /decisions 라우트 추가 (v1에서 이미 반영됨) |

## 테스트 생성 기준
테스트는 requirements.json의 acceptance_criteria 기반으로 생성되었다.
src/ 코드를 참조하지 않고 요구사항만으로 작성되었다.

## FR 커버리지

### P0 FR (8개) - 모든 P0에 인터랙션 테스트 포함
| FR | 제목 | AC 수 | 테스트 수 | 인터랙션 테스트 | 결과 |
|----|------|-------|----------|---------------|------|
| FR-001 | LLM 기반 NOTAM 중요도 점수 | 6 | 3 | 필터링/정렬 클릭 | PASS |
| FR-002 | Q-Code 분류 | 4 | 1 | 상세 페이지 탐색 | PASS |
| FR-003 | 공간/스케줄 기반 분석 | 6 | 1 | 영향 분석 클릭 | PASS |
| FR-004 | 운항편/항로 자동 매칭 | 5 | 1 | 운항편 상세 탐색 | PASS |
| FR-005 | 위험 NOTAM 자동 필터링 | 7 | 3 | 필터/정렬 클릭 | PASS |
| FR-006 | 항로 영향 분석 대시보드 | 12 | 4 | 줌/항로 선택 | PASS |
| FR-007 | 브리핑 문서 자동 생성 | 5 | 3 | 브리핑 생성/클릭 | PASS |
| FR-010 | NOTAM-항로 매칭 알고리즘 | 6 | 2 | 항로 클릭/탐색 | PASS |

### P1 FR (8개)
| FR | 제목 | 테스트 수 | 결과 |
|----|------|----------|------|
| FR-009 | 항로 우회 결정 가이드 | 1 | PASS |
| FR-011 | REF BOOK 관리 | 3 | PASS |
| FR-012 | NOTAM 상세 뷰 | 3 | PASS |
| FR-013 | 운항편 스케줄 개요 | 4 | PASS |
| FR-015 | NOTAM 한국어 요약 | (API 포함) | PASS |
| FR-016 | 위험 NOTAM 알림 배너 | 2 | PASS |

### P2 FR (4개)
| FR | 제목 | 테스트 수 | 결과 |
|----|------|----------|------|
| FR-017 | 운항관리사 감사 추적 | 2 | PASS |
| FR-019 | NOTAM 만료 관리 | 1 | PASS |
| FR-020 | TIFRS 의사결정 기록 | **10** | PASS |

## 이터레이션 이력

| # | 통과 | 실패 | 인프라 수정 | 기능 피드백 |
|---|------|------|-----------|-----------|
| 1 | 59 | 4 | 0건 | 0건 |
| 2 | 60 | 3 | 4건 (셀렉터/Cloudscape) | 0건 |
| 3 | 62 | 1 | 3건 (스크롤/로딩) | 0건 |
| 4 | 63 | 0 | 2건 (로딩 대기/라벨) | 0건 |

## 실패 분류 이력

### Type 1 (인프라 -- 테스트 수정)
| 테스트 | 수정 내용 | 어서션 변경 |
|--------|---------|-----------|
| dashboard.spec.ts:48 | `[class*="select"]` -> `getByRole('combobox')` + `/전체/` regex | 없음 |
| decisions.spec.ts:43 | `table tbody tr` -> `getByRole('grid')` + `getByRole('radio')` | 없음 |
| notam-decision.spec.ts:28 | TIFRS 라벨 regex 수정 + `scrollIntoViewIfNeeded` + 로딩 대기 | 없음 |
| notam-decision.spec.ts:64 | Cloudscape 폼 셀렉터 수정 + 기존 의사결정 표시 체크 추가 | 없음 |
| notam-detail.spec.ts:88 | `scrollIntoViewIfNeeded` 추가 + `getByRole('button')` 사용 | 없음 |

### Type 2 (기능 -- 앱 수정)
없음. 모든 실패가 인프라(셀렉터/타이밍) 이슈였다.

## 빌드 검증 결과
| 검증 항목 | 결과 |
|----------|------|
| `npm run build` | PASS (12 pages, 모든 라우트 정상) |
| ESLint errors | 0 errors (13 warnings - JSDoc @returns) |
| TypeScript | PASS (빌드 내 포함) |

## v1 테스트 호환성
v1의 52개 테스트 모두 v2에서 정상 통과하였다. 기존 기능에 대한 회귀(regression)가 발생하지 않았다.
단, dashboard.spec.ts:48 테스트에서 v2의 RouteImpactMap 변경("전체" 드롭다운)으로 인해 셀렉터 업데이트가 필요했다.
