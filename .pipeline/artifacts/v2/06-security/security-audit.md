# Security Audit Report v2

## Summary
- **Verdict**: PASS
- **Checks Performed**: 8/8
- **Findings**: 0 critical, 0 high, 3 medium, 3 low

## Check Results
| # | Check | Result | Findings |
|---|-------|--------|----------|
| 1 | Input Validation | PASS | 1 medium |
| 2 | Authentication | N/A (prototype) | 0 |
| 3 | XSS Prevention | PASS | 0 |
| 4 | CSRF Protection | PASS | 1 low |
| 5 | Security Headers | PASS | 1 medium, 1 low |
| 6 | Dependency Security | PASS | 0 |
| 7 | Secrets Management | PASS | 0 |
| 8 | Prototype-Specific | PASS | 1 medium, 1 low |

## npm audit Results
- Critical: 0
- High: 0
- Moderate: 0
- Low: 0

## Findings

### [MEDIUM] M-001: Briefings GET API 쿼리 파라미터 미검증
- **CWE**: CWE-20
- **File**: src/app/api/briefings/route.ts:17-29
- **검증 근거**: `grep -r 'safeParse' src/app/api/briefings/route.ts` -- 0 matches. `src/app/api/briefings/route.ts`에서 sortBy, order, page, pageSize를 zod 스키마 없이 직접 사용.
- **Description**: `GET /api/briefings` 엔드포인트가 query parameter(`sortBy`, `order`, `page`, `pageSize`, `type`, `status`)를 zod 검증 없이 `parseInt`와 타입 캐스팅으로 처리. 다른 모든 GET 엔드포인트(notams, flights, routes, decisions, audit-log)는 zod `safeParse`를 사용하나, briefings만 예외.
- **Remediation**: `briefing.validation.ts`에 `briefingQuerySchema`를 추가하고 `safeParse`를 적용. 특히 `sortBy`와 `type`은 화이트리스트 enum 검증 필요.

### [MEDIUM] M-002: CSP에 'unsafe-eval' 및 'unsafe-inline' 포함
- **CWE**: CWE-79
- **File**: src/middleware.ts:29
- **검증 근거**: `grep "Content-Security-Policy" src/middleware.ts` -- `script-src 'self' 'unsafe-eval' 'unsafe-inline'` 확인.
- **Description**: CSP의 `script-src`에 `'unsafe-eval'`과 `'unsafe-inline'`이 포함되어 XSS 방어 효과가 약화. Next.js 개발 모드와 Leaflet 라이브러리 호환을 위한 것으로 추정되나, 프로덕션에서는 nonce 기반 CSP로 전환 필요.
- **Remediation**: 프로덕션 전환 시 `'unsafe-eval'` 제거하고 `'nonce-{random}'` 기반 CSP 적용. Leaflet이 eval을 사용하지 않으므로 `'unsafe-eval'`은 즉시 제거 가능 여부 검토.

### [MEDIUM] M-003: API 에러 시 console.error로 전체 에러 객체 로깅
- **CWE**: CWE-209
- **File**: src/app/api/notams/analyze/route.ts:67, src/app/api/routes/[id]/alternatives/route.ts:48, 외 5개 파일
- **검증 근거**: `grep -r 'console.error' src/app/api/` -- 7 matches. 모두 `err` 객체를 직접 로깅.
- **Description**: 7개 API 라우트의 catch 블록에서 `console.error('...', err)`로 전체 에러 객체를 로깅. 서버 측 로그에 AWS 자격 증명 오류, Bedrock 엔드포인트, 내부 경로 등 민감 정보가 포함될 수 있음. 클라이언트에는 일반적 에러 메시지만 반환하므로 직접적 노출은 없으나, 로그 수집 시 민감 정보 유출 위험.
- **Remediation**: 에러 로깅 시 `err.message`만 기록하거나, 구조화된 로거(pino, winston)를 도입하여 민감 필드 마스킹 적용.

### [LOW] L-001: CORS Access-Control-Allow-Origin: *
- **CWE**: CWE-942
- **File**: src/middleware.ts:34
- **검증 근거**: `grep "Access-Control-Allow-Origin" src/middleware.ts` -- `*` 확인.
- **Description**: 모든 API 라우트에 `Access-Control-Allow-Origin: *`가 설정. 프로토타입에서는 무방하나, 프로덕션에서는 허용 도메인을 제한해야 함.
- **Remediation**: 프로덕션 전환 시 특정 도메인(예: `https://notam.jejuair.net`)으로 제한.

### [LOW] L-002: Strict-Transport-Security 헤더 미설정
- **CWE**: CWE-319
- **File**: src/middleware.ts
- **검증 근거**: `grep "Strict-Transport-Security" src/middleware.ts` -- 0 matches.
- **Description**: HSTS 헤더가 설정되지 않음. 프로토타입은 HTTP 로컬 개발이므로 영향 없으나, 프로덕션 배포 시 필수.
- **Remediation**: 프로덕션 배포 시 `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` 추가.

### [LOW] L-003: Mock 인증 토큰이 Base64 인코딩 평문
- **CWE**: CWE-312
- **File**: src/app/api/auth/login/route.ts:40-41
- **검증 근거**: `grep "Buffer.from" src/app/api/auth/login/route.ts` -- 1 match. JWT 형식이 아닌 단순 Base64.
- **Description**: 로그인 API가 Base64 인코딩 JSON을 토큰으로 반환. 실제 JWT 서명이 없어 위변조 가능. 프로토타입 목적이므로 수용 가능하나, 프로덕션에서는 Cognito 또는 서명된 JWT 필요.
- **Remediation**: NFR-001에 명시된 대로 프로토타입용 mock auth. 프로덕션 전환 시 Amazon Cognito + httpOnly 쿠키 기반 세션으로 교체.

## 검증 근거 상세

### Check 1: Input Validation (OWASP A03:2021)
- `grep -r 'safeParse' src/app/api/` -- 17 matches (17개 엔드포인트에서 zod 검증)
- POST/PUT 엔드포인트 수: 12개 (모두 safeParse 사용)
- GET 엔드포인트 쿼리 검증: notams, flights, routes, decisions, audit-log는 zod 스키마 적용. **briefings는 미적용 (M-001)**
- `src/lib/validation/` 디렉토리: 9개 검증 파일 (decision, notam, route, flight, briefing, ref-book, matching, audit-log, auth)
- `grep -r 'dangerouslySetInnerHTML' src/` -- 0 matches
- 동적 라우트 `[id]` 파라미터: Next.js params로 문자열 추출 후 repository 조회, 존재하지 않으면 404 반환
- v2 신규 `decision.validation.ts`: `createDecisionRecordSchema`가 모든 TIFRS 필드에 `min(1).max(1000)` 적용, `overallDecision`은 enum 화이트리스트
- `decisionQuerySchema`: `sortBy`는 `enum(['decidedAt', 'overallDecision', 'notamId'])` 화이트리스트, `page`/`pageSize`는 coerce+positive+max(100) -- CWE-20 준수

### Check 2: Authentication (OWASP A07:2021)
- `grep -r 'localStorage' src/` -- 5 matches (AuthContext.tsx에서 mock 사용자 정보 저장)
- 저장 데이터: `{ id, name, employeeId, role }` (민감 정보 아님, 프로토타입 mock)
- API 라우트 인증 검사 없음 -- NFR-001에 "프로토타입은 mock auth" 명시
- 실제 비밀번호 검증 없음 -- "비어있지 않으면 통과" (프로토타입 의도적 설계)
- **N/A 판정**: 프로토타입 범위에서 인증은 mock으로 명시적 합의

### Check 3: XSS Prevention (OWASP A03:2021)
- `grep -r 'dangerouslySetInnerHTML' src/` -- 0 matches
- `grep -r 'eval(' src/` -- 0 matches
- `grep -r 'new Function(' src/` -- 0 matches
- `grep -r 'innerHTML' src/` -- 0 matches
- React JSX 이스케이핑: 모든 사용자 입력이 Cloudscape 컴포넌트(`Textarea`, `Input`, `Select`)를 통해 렌더링
- TIFRS 필드(tifrsTime, tifrsImpact 등)가 `{decision.tifrsTime || '-'}`로 JSX 내 직접 렌더링 -- React 자동 이스케이핑 적용
- 마크다운 렌더링 없음 -- 별도 sanitizer 불필요

### Check 4: CSRF Protection
- 상태 변경 작업: 모든 POST/PUT/DELETE 사용 (GET으로 상태 변경 없음)
- `grep -r 'export async function GET' src/app/api/` 중 상태 변경 있는 것: 없음
- Content-Type 헤더 강제 검증: Next.js API Route는 `request.json()`이 Content-Type 무시하고 파싱 시도 -- 명시적 검증은 없으나 zod 스키마가 구조 검증
- Server Actions 미사용 (API Route 방식)

### Check 5: Security Headers
- `grep "X-Frame-Options" src/middleware.ts` -- `DENY` 확인
- `grep "X-Content-Type-Options" src/middleware.ts` -- `nosniff` 확인
- `grep "Referrer-Policy" src/middleware.ts` -- `strict-origin-when-cross-origin` 확인
- `grep "Permissions-Policy" src/middleware.ts` -- `camera=(), microphone=(), geolocation=()` 확인
- `grep "Content-Security-Policy" src/middleware.ts` -- 존재, 단 `unsafe-eval`/`unsafe-inline` 포함 (M-002)
- `grep "Strict-Transport-Security" src/middleware.ts` -- 0 matches (L-002, 프로토타입 INFO)
- Middleware matcher: `/((?!_next/static|_next/image|favicon.ico).*)` -- 모든 라우트 적용

### Check 6: Dependency Security
- `npm audit --json` 실행 결과: 0 critical, 0 high, 0 moderate, 0 low
- 전체 의존성: 610개 (prod 157, dev 418, optional 83)
- 취약점 총 0건

### Check 7: Secrets Management
- `grep -ri 'api[_-]\?key\|secret\|password\|token\|credential' src/ --include='*.ts' --include='*.tsx'` -- 하드코딩된 실제 키/비밀번호 0건
- `process.env` 사용: `AWS_REGION`, `BEDROCK_MODEL_ID` (2건, 모두 기본값 존재)
- `.env*`가 `.gitignore`에 포함 확인
- `.env.local.example`에 실제 자격 증명 없음 (가이드만 제공)
- 클라이언트 코드에서 `process.env` 사용: 0건 (서버 측에만 존재)
- Mock 토큰 `Buffer.from(JSON.stringify(payload)).toString('base64')`: 실제 자격 증명과 무관한 프로토타입용 (L-003)

### Check 8: Prototype-Specific
- `grep -r '@.*\.\(com\|net\|org\|co\.kr\)' src/data/` -- 0 matches (실제 이메일 없음)
- `grep -r '010-[0-9]\{4\}-[0-9]\{4\}' src/` -- 0 matches (실제 전화번호 없음)
- `grep -ri 'admin.*password\|root.*password' src/` -- 0 matches (기본 관리자 자격 증명 없음)
- `console.error` 사용: 7건 (모두 서버 측 API 라우트, 클라이언트 노출 없음, M-003)
- 에러 응답: 모든 catch 블록이 일반적 에러 메시지 반환 (내부 경로/스택 미노출)
- 파일 업로드 핸들러: 없음
- Mock 데이터: 운항관리사 이름은 가상 한국 이름 (`김운항관리사`), PII 아님

## Production Readiness Notes
프로토타입으로 수용 가능하나, 프로덕션 전환 시 반드시 처리해야 할 항목:

1. **인증 시스템 구현**: Amazon Cognito 기반 실제 인증 + httpOnly 쿠키 세션. API 라우트에 인증 미들웨어 추가 (현재 모든 API가 인증 없이 접근 가능)
2. **CSP 강화**: `'unsafe-eval'`과 `'unsafe-inline'` 제거, nonce 기반 CSP 전환
3. **CORS 제한**: `Access-Control-Allow-Origin: *`를 특정 도메인으로 제한
4. **HSTS 헤더 추가**: HTTPS 배포 시 `Strict-Transport-Security` 헤더 필수
5. **API Rate Limiting 추가**: 현재 모든 API 엔드포인트에 속도 제한 없음
6. **구조화 로깅 도입**: `console.error` 대신 pino/winston으로 민감 정보 마스킹
7. **Briefings API 쿼리 검증**: zod 스키마 적용하여 다른 엔드포인트와 일관성 확보
8. **localStorage 사용 제거**: 프로덕션에서는 httpOnly 쿠키 기반 세션으로 교체
9. **실제 데이터 소스 연결**: 인메모리 시드 데이터를 RDS/DynamoDB로 교체
