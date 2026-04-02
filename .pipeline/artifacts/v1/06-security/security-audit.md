# Security Audit Report v1

## Summary
- **Verdict**: PASS
- **Checks Performed**: 8/8
- **Findings**: 0 critical, 0 high, 3 medium, 4 low

## Check Results
| # | Check | Result | Findings |
|---|-------|--------|----------|
| 1 | Input Validation (OWASP A03) | PASS | 1 medium |
| 2 | Authentication (OWASP A07) | PASS (프로토타입) | 1 low |
| 3 | XSS Prevention (OWASP A03) | PASS | 0 |
| 4 | CSRF Protection | PASS | 0 |
| 5 | Security Headers | PASS | 2 medium (INFO) |
| 6 | Dependency Security | PASS | 0 |
| 7 | Secrets Management | PASS | 1 low |
| 8 | Prototype-Specific | PASS | 2 low |

## npm audit Results
- Critical: 0
- High: 0
- Moderate: 0
- Low: 0

---

## Findings

### [MEDIUM] REF BOOK GET 쿼리 파라미터 zod 검증 누락
- **CWE**: CWE-20 (Improper Input Validation)
- **File**: `src/app/api/ref-book/route.ts`:21-28
- **Description**: REF BOOK 목록 GET 라우트에서 `sortBy`, `order`, `page`, `pageSize` 쿼리 파라미터를 zod 스키마 없이 직접 파싱한다. 다른 GET API(`/api/notams`, `/api/flights`, `/api/routes`, `/api/audit-log`)는 모두 zod safeParse를 사용하지만, 이 라우트만 `sp.get()` + `parseInt()`로 직접 처리한다.
- **검증 근거**: `grep -r 'safeParse' src/app/api/` -- ref-book/route.ts GET에 safeParse 호출 없음. 반면 POST에는 `createRefBookEntrySchema.safeParse` 있음.
- **Remediation**: refBook.validation.ts에 `refBookQuerySchema`를 추가하고 GET 핸들러에서 safeParse를 적용할 것. 단, 실제 위험도는 낮음: repository의 `SORTABLE_FIELDS` 화이트리스트가 존재하여 임의 정렬 필드 주입은 방어됨.
- **실제 영향**: 인메모리 스토어 사용, SQL 없음. `sortBy`가 `SORTABLE_FIELDS` 맵에 없으면 정렬이 적용되지 않아 실질적 익스플로잇 불가. 프로토타입 맥락에서 LOW로 재조정 가능하나 패턴 일관성 차원에서 MEDIUM 유지.

### [MEDIUM] CSP에 'unsafe-eval' 포함
- **CWE**: CWE-79 (Cross-site Scripting)
- **File**: `src/middleware.ts`:29
- **Description**: Content-Security-Policy의 `script-src`에 `'unsafe-eval'`이 포함되어 있다. Next.js 개발 환경에서 필요할 수 있으나, `eval()` 호출을 허용하여 XSS 공격 표면을 확장한다.
- **검증 근거**: `grep -r "unsafe-eval" src/middleware.ts` -- 1 match. `grep -r "eval(" src/` -- 0 matches (코드에서 실제 eval 사용 없음).
- **Remediation**: 프로덕션 빌드에서는 `'unsafe-eval'`을 제거하고 nonce 기반 CSP로 전환할 것. 프로토타입에서는 Next.js 런타임 호환성을 위해 허용 가능 (INFO 수준).

### [MEDIUM] CORS Access-Control-Allow-Origin: *
- **CWE**: CWE-942 (Overly Permissive Cross-domain Whitelist)
- **File**: `src/middleware.ts`:34
- **Description**: API 라우트에 대해 `Access-Control-Allow-Origin: *`로 모든 출처를 허용한다. 프로토타입에서는 개발 편의상 허용 가능하나, 프로덕션에서는 특정 출처만 허용해야 한다.
- **검증 근거**: `grep 'Allow-Origin' src/middleware.ts` -- `'*'` 설정 확인.
- **Remediation**: 프로덕션 전환 시 허용 출처를 환경변수로 관리하고 화이트리스트 기반으로 변경할 것.

### [LOW] Mock 인증 토큰이 base64 평문
- **CWE**: CWE-312 (Cleartext Storage of Sensitive Information)
- **File**: `src/app/api/auth/login/route.ts`:40-41
- **Description**: 로그인 API가 반환하는 mock JWT는 base64로 인코딩된 평문 JSON이다. 서명 없이 페이로드만 인코딩하여, 누구든 토큰을 생성/변조할 수 있다.
- **검증 근거**: `Buffer.from(JSON.stringify(payload)).toString('base64')` -- 서명 없는 base64 인코딩 확인.
- **Remediation**: 프로토타입 목 인증이므로 현재 수준에서 수용 가능. 프로덕션에서는 Amazon Cognito 또는 실제 JWT 서명(RS256/HS256)을 적용할 것.

### [LOW] localStorage에 인증 정보 저장
- **CWE**: CWE-922 (Insecure Storage of Sensitive Information)
- **File**: `src/contexts/AuthContext.tsx`:48-69
- **Description**: 사용자 인증 정보(dispatcher 객체)가 localStorage에 저장된다. XSS 공격 시 접근 가능하나, 목 인증이며 민감 정보(비밀번호, 토큰)는 저장하지 않는다.
- **검증 근거**: `grep -r 'localStorage' src/` -- AuthContext.tsx에서만 사용. 저장 내용은 `{ id, name, employeeId, role }` 구조체.
- **Remediation**: 프로덕션에서는 httpOnly 쿠키 기반 세션으로 전환할 것.

### [LOW] console.error에 에러 객체 전체 출력
- **CWE**: CWE-209 (Information Exposure Through Error Message)
- **Files**: `src/app/api/notams/analyze/route.ts`:67, `src/app/api/briefings/generate/route.ts`:70, 외 5개 API 라우트
- **Description**: 7개 API 라우트의 catch 블록에서 `console.error('...', err)`로 에러 객체를 서버 로그에 출력한다. 클라이언트에는 일반적인 에러 메시지(`'Failed to generate...'`)만 반환하므로 직접적인 정보 노출은 없으나, 서버 로그에 Bedrock API 에러 상세(요청 ID, 계정 정보 등)가 기록될 수 있다.
- **검증 근거**: `grep -r 'console.error' src/` -- 7 matches. 모두 catch 블록 내에서 사용. 클라이언트 응답에는 스택 트레이스 미포함 확인.
- **Remediation**: 프로덕션에서는 구조화된 로깅(Winston/Pino)으로 전환하고, 에러 객체 중 민감 필드를 필터링할 것. 프로토타입에서는 허용.

### [LOW] Strict-Transport-Security 헤더 미설정
- **CWE**: CWE-319 (Cleartext Transmission of Sensitive Information)
- **File**: `src/middleware.ts`
- **Description**: HSTS(Strict-Transport-Security) 헤더가 설정되지 않았다. 로컬 개발/프로토타입 환경에서는 HTTPS가 아닐 수 있어 합리적이나, 프로덕션 배포 시 필수.
- **검증 근거**: `grep 'Strict-Transport' src/middleware.ts` -- 0 matches.
- **Remediation**: 프로덕션 배포 시 `Strict-Transport-Security: max-age=31536000; includeSubDomains` 추가할 것.

---

## Detailed Check Analysis

### 1. Input Validation (OWASP A03:2021 -- Injection)

**Result**: PASS (1 medium finding)

검증 방법 및 결과:
- `grep -r 'safeParse' src/app/api/` -- 15 matches: POST/PUT 핸들러에 zod 검증 적용 확인
- GET API 라우트 중 `/api/notams`, `/api/flights`, `/api/routes`, `/api/audit-log` -- zod querySchema 사용
- `/api/ref-book` GET -- zod 미사용 (MEDIUM finding, 단 repository 화이트리스트로 실질적 방어)
- `grep -r 'dangerouslySetInnerHTML' src/` -- 0 matches
- `grep -r 'eval(' src/` -- 0 matches
- `grep -r 'new Function(' src/` -- 0 matches
- 동적 라우트 `[id]` 파라미터: UUID 형식 검증은 없으나, findById()에서 Map.get()으로 조회하여 존재하지 않으면 404 반환. SQL injection 벡터 없음 (인메모리 스토어).
- AI 프롬프트 주입: NOTAM 데이터는 시드 데이터에서 로드되며, 사용자가 직접 NOTAM 원문을 입력하는 경로 없음. `rawText` 필드는 XML 태그로 구조화되어 프롬프트에 삽입됨 (`<raw_text>...</raw_text>`). 프로토타입에서 사용자 입력이 프롬프트에 직접 주입되는 엔드포인트 없음.

### 2. Authentication Patterns (OWASP A07:2021)

**Result**: PASS (프로토타입 맥락, 1 low finding)

검증 방법 및 결과:
- NFR-001 명세: "Simple login with dispatcher role -- prototype uses mock auth (no Cognito). Single role: dispatcher."
- API 라우트에 인증 미들웨어 미적용: 프로토타입 요구사항에 부합
- Mock 토큰은 base64 평문 (LOW finding)
- localStorage에 `{ id, name, employeeId, role }` 저장 -- 비밀번호/토큰 미저장
- 시드 데이터에 기본 비밀번호 없음: 로그인 시 비어있지 않은 password만 검사
- `grep -r 'localStorage' src/` -- AuthContext.tsx에서만 5회 사용

### 3. XSS Prevention (OWASP A03:2021)

**Result**: PASS (0 findings)

검증 방법 및 결과:
- `grep -r 'dangerouslySetInnerHTML' src/` -- 0 matches
- `grep -r 'innerHTML' src/` -- 0 matches
- `grep -r 'eval(' src/` -- 0 matches
- `grep -r 'new Function(' src/` -- 0 matches
- React JSX 기본 이스케이핑 사용 확인: 모든 컴포넌트가 JSX 표현식으로 데이터 렌더링
- 마크다운 렌더링: 브리핑 content에 마크다운이 포함되나, 별도 마크다운 파서/렌더러 미사용. 텍스트로 표시.
- 사용자 입력 렌더링 경로: FormField 기반 입력 -> API POST -> 서버 처리. 클라이언트에서 사용자 입력을 직접 HTML로 렌더링하는 경로 없음.

### 4. CSRF Protection

**Result**: PASS (0 findings)

검증 방법 및 결과:
- 상태 변경 API (생성/수정/삭제): 모두 POST/PUT/DELETE 사용
- `grep -rn 'GET.*create\|GET.*update\|GET.*delete' src/app/api/` -- 0 matches (GET으로 상태 변경 없음)
- Next.js Server Actions 미사용: `grep -r "use server" src/` -- 0 matches
- SameSite 쿠키 미사용 (쿠키 기반 인증 없음, 목 인증이므로 해당 없음)
- CORS `Access-Control-Allow-Origin: *`가 잠재적 CSRF 벡터이나, 인증 미적용 프로토타입이므로 실질적 위험 없음

### 5. Security Headers

**Result**: PASS (2 medium findings -- INFO 수준)

설정된 헤더:
- X-Frame-Options: DENY -- PASS
- X-Content-Type-Options: nosniff -- PASS
- X-XSS-Protection: 1; mode=block -- PASS
- Referrer-Policy: strict-origin-when-cross-origin -- PASS
- Permissions-Policy: camera=(), microphone=(), geolocation=() -- PASS
- Content-Security-Policy: 설정됨 (default-src 'self') -- PASS (unsafe-eval 포함은 MEDIUM)

미설정 헤더:
- Strict-Transport-Security: 미설정 (프로토타입 INFO, 프로덕션 필수)

### 6. Dependency Security

**Result**: PASS (0 findings)

검증 방법 및 결과:
- `npm audit --json` 실행 결과:
  - Critical: 0
  - High: 0
  - Moderate: 0
  - Low: 0
  - Total dependencies: 610 (prod: 157, dev: 418)

### 7. Secrets Management

**Result**: PASS (1 low finding)

검증 방법 및 결과:
- `grep -ri '(password|secret|api[_-]?key|token)\s*[:=]\s*['\''"]' src/` -- 0 matches (하드코딩된 시크릿 없음)
- `grep -r 'process.env' src/` -- 2 matches (AWS_REGION, BEDROCK_MODEL_ID) -- 환경변수 사용 확인
- `.env.local.example` 존재: AWS_REGION, BEDROCK_MODEL_ID만 포함, 실제 키 없음
- `.gitignore`에 `.env*` 포함 확인
- 클라이언트 코드에 시크릿 없음: `process.env` 사용은 서버 파일(bedrock.service.ts)에만 존재

### 8. Prototype-Specific Checks

**Result**: PASS (2 low findings)

검증 방법 및 결과:
- 목 데이터 PII 검사:
  - `grep -r '@(gmail|yahoo|hotmail|naver|daum)' src/data/` -- 0 matches (이메일 없음)
  - `grep -rE '\d{3}[-.]?\d{3,4}[-.]?\d{4}' src/data/` -- NOTAM 좌표만 매칭 (전화번호 아님)
  - 운항관리사 이름: '김운항', '이관제', '박항로' -- 가상 이름, 실제 PII 아님
- 기본 자격 증명:
  - `grep -ri 'admin.*admin\|root.*password' src/data/` -- 0 matches
  - 로그인은 dispatcher 이름/사번으로 조회, 비밀번호는 non-empty 검증만
- console.error 민감정보:
  - 7개 console.error 호출 -- Bedrock API 에러 객체 출력 (서버 로그만, 클라이언트 미노출)
  - 클라이언트 응답: `{ error: 'AI Error', message: 'Failed to generate...' }` 형식 -- 내부 경로/스택 미노출
- 파일 업로드: 파일 업로드 핸들러 없음

---

## Production Readiness Notes

프로토타입에서 수용 가능하나, 프로덕션 전환 시 반드시 해결해야 할 사항:

1. **실제 인증 구현**: Amazon Cognito 또는 OIDC 기반 인증으로 전환. Mock JWT를 실제 서명된 JWT로 교체. API 라우트에 인증 미들웨어 적용.
2. **CORS 출처 제한**: `Access-Control-Allow-Origin: *`를 특정 도메인으로 제한.
3. **CSP 강화**: `'unsafe-eval'`과 `'unsafe-inline'`을 제거하고 nonce/hash 기반 CSP로 전환.
4. **HSTS 헤더 추가**: HTTPS 배포 시 `Strict-Transport-Security` 헤더 설정.
5. **구조화된 로깅**: console.error를 Winston/Pino 등 구조화 로거로 교체. 민감 필드 필터링 적용.
6. **Rate Limiting**: API 라우트에 요청 속도 제한 적용 (특히 Bedrock 호출 엔드포인트).
7. **httpOnly 쿠키**: localStorage 기반 인증을 httpOnly 쿠키 세션으로 전환.
8. **REF BOOK GET 쿼리 검증**: refBookQuerySchema를 추가하여 일관된 입력 검증 패턴 유지.
9. **프롬프트 주입 방어 강화**: 사용자가 NOTAM 데이터를 직접 입력하는 기능 추가 시, 입력 새니타이징 및 프롬프트 격리 필수.
10. **실제 데이터 소스**: 인메모리 스토어를 데이터베이스로 교체 시 SQL injection 방어(Parameterized Query) 필수 적용.
