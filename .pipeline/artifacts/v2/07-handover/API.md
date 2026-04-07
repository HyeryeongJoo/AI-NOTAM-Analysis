# API 문서

## 개요

모든 API는 Next.js 15 App Router의 Route Handler로 구현되어 있습니다. 경로: `src/app/api/`

- **인증**: 프로토타입은 mock 인증 (모든 API 접근 가능)
- **검증**: POST/PUT 요청은 zod 스키마로 입력 검증
- **응답 형식**: JSON
- **에러 응답**: `{ "error": "에러 메시지" }` + 적절한 HTTP 상태 코드

---

## NOTAM API

### GET /api/notams

NOTAM 목록을 조회합니다. 필터링, 정렬, 페이지네이션을 지원합니다.

**Query Parameters:**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `page` | number | 1 | 페이지 번호 |
| `pageSize` | number | 20 | 페이지당 항목 수 (최대 100) |
| `sortBy` | string | `receivedAt` | 정렬 기준 (receivedAt, importance, airport 등) |
| `order` | string | `desc` | 정렬 방향 (asc, desc) |
| `importance` | string | - | 중요도 필터 (critical, high, medium, low, routine) |
| `status` | string | - | 상태 필터 (active, expired, cancelled, expiring-soon) |
| `airport` | string | - | 공항 ICAO 코드 필터 |
| `search` | string | - | 텍스트 검색 |

**응답 예시:**

```json
{
  "data": [
    {
      "id": "notam-001",
      "series": "A",
      "number": 1234,
      "year": 2026,
      "type": "NOTAMN",
      "qCode": "QMRLC",
      "importance": 92,
      "importanceLevel": "critical",
      "rawText": "A1234/26 NOTAMN ...",
      "aiAnalysis": {
        "summary": "인천공항 활주로 33L 야간 폐쇄",
        "importance": 92,
        "importanceLevel": "critical",
        "rationale": "..."
      }
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

### GET /api/notams/stats

NOTAM 중요도별 통계를 반환합니다.

```json
{
  "total": 50,
  "byImportance": {
    "critical": 5,
    "high": 8,
    "medium": 15,
    "low": 12,
    "routine": 10
  },
  "active": 42,
  "expired": 8
}
```

### GET /api/notams/alerts

Critical 중요도 NOTAM 알림 목록을 반환합니다.

### POST /api/notams/analyze

NOTAM에 대해 AI 중요도 분석을 실행합니다.

**요청:**
```json
{
  "notamId": "notam-001"
}
```

**응답:**
```json
{
  "importance": 92,
  "importanceLevel": "critical",
  "rationale": "인천공항(RKSI) 활주로 33L 폐쇄...",
  "summary": "인천공항 활주로 33L 야간 폐쇄 (22:00-06:00 KST)"
}
```

### POST /api/notams/[id]/process

개별 NOTAM에 대해 3단계 파이프라인을 실행합니다:
1. 필드 추출 (좌표, 반경, 고도, Q-Code)
2. 중요도 분석 (0-100 점수, 등급, 근거)
3. 항로/운항편 매칭

### POST /api/notams/[id]/impact-analysis

NOTAM에 대한 종합 영향 분석을 실행합니다. 공항 시설, 활주로 수, 운항 스케줄을 고려합니다.

### POST /api/notams/[id]/summarize

NOTAM 한국어 요약을 생성합니다. ICAO 약어와 Q-Code를 일반어로 변환합니다.

### GET /api/notams/[id]/affected-flights

해당 NOTAM에 영향받는 운항편 목록을 반환합니다.

### GET /api/notams/[id]/affected-routes

해당 NOTAM에 영향받는 항로 목록을 반환합니다.

### GET /api/notams/[id]/diff

NOTAMR(교체 NOTAM)인 경우 원본과의 변경 비교 결과를 반환합니다.

---

## 의사결정 API

### GET /api/notams/[id]/decision

특정 NOTAM에 대한 TIFRS 의사결정 기록을 조회합니다.

### POST /api/notams/[id]/decision

TIFRS 의사결정을 기록합니다.

**요청:**
```json
{
  "tifrsTime": "야간 시간대 활주로 폐쇄로 21:00-06:00 운항 영향",
  "tifrsImpact": "인천공항 출발 3개 운항편 지연 가능",
  "tifrsFacilities": "활주로 33L 폐쇄, 33R 사용 가능",
  "tifrsRoute": "ICN-NRT 노선 영향 없음",
  "tifrsSchedule": "7C101, 7C103, 7C105 편 스케줄 조정 필요",
  "overallDecision": "monitor",
  "rationale": "33R 활주로로 운항 전환 가능하므로 모니터링 지속",
  "useAiSuggestion": true
}
```

**`overallDecision` 값:**
- `no-action` — 조치 불필요
- `monitor` — 모니터링 지속
- `route-change` — 항로 변경 필요

### GET /api/decisions

전체 의사결정 기록 목록을 조회합니다. 정렬 및 페이지네이션 지원.

---

## 운항편 API

### GET /api/flights

운항편 목록을 조회합니다.

**Query Parameters:** `page`, `pageSize`, `sortBy`, `order`, `status`, `airport`, `search`

### GET /api/flights/[id]

운항편 상세 정보를 반환합니다. NOTAM 영향 정보 포함.

---

## 항로 API

### GET /api/routes

항로 목록을 조회합니다.

### GET /api/routes/[id]

항로 상세 정보 (waypoint 목록 포함)를 반환합니다.

### POST /api/routes/[id]/alternatives

AI가 NOTAM 영향을 고려한 대체 항로를 제안합니다.

**응답 예시:**
```json
{
  "alternatives": [
    {
      "name": "대체 항로 A",
      "reason": "NOTAM 영향 구역 회피",
      "distanceDiff": "+45km",
      "timeDiff": "+12min",
      "waypoints": ["RKSI", "GOBIT", "SADLI", "RJTT"]
    }
  ]
}
```

### GET /api/routes/[id]/impact

항로에 영향을 미치는 NOTAM 목록과 영향도를 반환합니다.

---

## 대시보드 API

### GET /api/dashboard/route-impact

대시보드 항로 영향도 데이터를 반환합니다. 지도 시각화에 필요한 모든 데이터 포함:
- 항로별 NOTAM 영향 목록 (모든 중요도)
- Critical + High NOTAM 목록
- 요약 통계 (총 NOTAM 수, 영향 항로 수, 영향 운항편 수)
- 영향받는 운항편 목록

---

## 매칭 API

### POST /api/matching/calculate

NOTAM-항로/운항편 매칭 알고리즘을 실행합니다. 공간적(좌표/반경), 시간적(유효기간), 고도 기반 교차 분석.

### GET /api/matching/results

매칭 결과를 조회합니다.

---

## 브리핑 API

### POST /api/briefings/generate

운항관리사용 브리핑 문서를 AI로 생성합니다.

**요청:**
```json
{
  "flightId": "flight-001",
  "type": "departure"
}
```

### POST /api/briefings/generate-crew

승무원 브리핑 패키지를 AI로 생성합니다.

### GET /api/briefings/[id]/crew-package

승무원 브리핑 패키지를 조회합니다.

---

## REF BOOK API

### GET /api/ref-book

REF BOOK 등재 항목 목록을 조회합니다.

### POST /api/ref-book

NOTAM을 REF BOOK에 등재합니다.

**요청:**
```json
{
  "notamId": "notam-001",
  "notes": "인천공항 활주로 폐쇄 — 야간 정비",
  "registeredBy": "dispatcher-001"
}
```

### PUT /api/ref-book/[id]

REF BOOK 항목을 수정합니다.

### DELETE /api/ref-book/[id]

REF BOOK 항목을 삭제합니다.

---

## 보고서 API

### POST /api/reports/shift-handover

교대근무 핸드오버 보고서를 AI로 생성합니다.

### GET /api/reports/shift-handover/[id]

교대근무 보고서 상세를 조회합니다.

---

## 기타 API

### GET /api/q-codes

Q-Code 참조 데이터를 반환합니다. ICAO 표준 Q-Code와 한국어 설명 매핑.

### POST /api/auth/login

Mock 로그인. 비어있지 않은 사번/비밀번호 입력 시 Base64 토큰 반환.

### GET/POST /api/audit-log

감사 로그 조회/기록. 모든 운항관리사 행동 추적.

---

## 에러 코드

| HTTP 코드 | 의미 | 사용 상황 |
|-----------|------|----------|
| 200 | 성공 | GET 요청 |
| 201 | 생성 성공 | POST 요청 (리소스 생성) |
| 400 | 잘못된 요청 | zod 검증 실패, 잘못된 파라미터 |
| 404 | 미발견 | 존재하지 않는 리소스 ID |
| 500 | 서버 에러 | Bedrock 호출 실패 등 |
