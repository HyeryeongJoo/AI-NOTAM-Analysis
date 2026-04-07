# 프로덕션 전환 체크리스트

프로토타입을 프로덕션 시스템으로 발전시키기 위해 필요한 작업 목록입니다. 보안 감사 결과(v1)와 코드 리뷰 결과(v2)를 기반으로 작성되었습니다.

## 필수 (P0) — 프로덕션 배포 전 반드시 완료

### 인증/인가

- [ ] Amazon Cognito User Pool 기반 실제 인증 구현
- [ ] Mock JWT(base64 평문)를 실제 서명된 JWT(RS256/HS256)로 교체
- [ ] API 라우트에 인증 미들웨어 적용 (모든 보호 라우트)
- [ ] localStorage 기반 인증을 httpOnly 쿠키 세션으로 전환
- [ ] 역할 기반 접근 제어(RBAC) 구현 (운항관리사, 관리자 등)
- [ ] 세션 만료 및 자동 로그아웃 구현

### 데이터 레이어

- [ ] 인메모리 스토어(`src/lib/db/store.ts`)를 실제 DB로 교체
  - 권장: Amazon DynamoDB (NoSQL) 또는 Amazon RDS (PostgreSQL)
  - Repository 인터페이스(`src/lib/db/*.repository.ts`)는 동일하게 유지 — 구현체만 교체
- [ ] 시드 데이터(`src/data/`)를 실제 데이터 마이그레이션 스크립트로 교체
- [ ] 데이터 백업 및 복구 전략 수립

### 보안 (보안 감사 결과 반영)

- [ ] **CORS 출처 제한**: `Access-Control-Allow-Origin: *`를 특정 도메인으로 제한 (`src/middleware.ts`:34)
- [ ] **CSP 강화**: `'unsafe-eval'` 제거, nonce/hash 기반 CSP로 전환 (`src/middleware.ts`:29)
- [ ] **HSTS 헤더 추가**: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- [ ] **REF BOOK GET 쿼리 검증**: `refBookQuerySchema` 추가하여 일관된 zod 검증 패턴 유지
- [ ] Rate Limiting 적용 (특히 Bedrock 호출 엔드포인트: `/api/notams/analyze`, `/api/briefings/generate` 등)
- [ ] 환경 변수로 모든 설정값 분리 (하드코딩된 값 제거)

### 인프라

- [ ] CI/CD 파이프라인 구성 (GitHub Actions 또는 AWS CodePipeline)
- [ ] 환경별 설정 분리 (dev / staging / prod)
- [ ] 모니터링/로깅 설정 (CloudWatch Logs + Alarms)
- [ ] 에러 트래킹 연동 (Sentry 또는 CloudWatch RUM)
- [ ] Auto Scaling 설정 (EC2 Auto Scaling Group 또는 ECS/Fargate 전환)
- [ ] 블루-그린 또는 롤링 배포 전략 구현

---

## 필수 (P1) — 프로덕션 안정성 확보

### 테스트

- [ ] 단위 테스트 추가 (Repository 로직, AI 파서, 매칭 알고리즘)
- [ ] API 통합 테스트 추가 (35개 엔드포인트)
- [ ] E2E 테스트 보강 (현재 63개 → 핵심 비즈니스 플로우 100% 커버리지)
- [ ] 성능 테스트 (Bedrock 호출 지연 시간, 동시 사용자 처리)

### 에러 처리 및 로깅

- [ ] `console.error`를 구조화 로거(Winston/Pino)로 교체 (현재 7개 API 라우트)
- [ ] Bedrock API 에러 상세 필드 필터링 (서버 로그에서 민감 정보 제거)
- [ ] API 응답 에러 메시지 표준화
- [ ] Bedrock 호출 실패 시 재시도 로직 추가 (exponential backoff)

### AI 기능 강화

- [ ] 프롬프트 주입 방어 강화 (사용자가 NOTAM 데이터를 직접 입력하는 기능 추가 시)
- [ ] Bedrock 토큰 사용량 추적 및 비용 알림
- [ ] 동일 NOTAM 분석 결과 캐싱 (중복 호출 방지)
- [ ] 스트리밍 응답 적용 (InvokeModelWithResponseStream)
- [ ] 3년 REF BOOK 이력 기반 RAG 구현 (Few-shot 학습 강화)

### 데이터 통합

- [ ] 실시간 NOTAM 수신 연동 (AFTN/AMHS 인터페이스)
- [ ] 운항 스케줄 시스템 연동 (실시간 운항편 데이터)
- [ ] NAVBLUE 항로 데이터 연동 (실제 웨이포인트)
- [ ] 공항 데이터 자동 업데이트

---

## 선택 (P2) — 개선 사항

### UX 개선

- [ ] 다크모드 지원 (Cloudscape applyMode)
- [ ] 접근성 감사 (WCAG 2.1 AA 전수 검사)
- [ ] 성능 최적화 (이미지 최적화, 번들 사이즈 분석)
- [ ] 오프라인 지원 (Service Worker)
- [ ] 모바일 반응형 최적화

### 기능 확장

- [ ] 다국어 지원 (i18n — 영어/한국어)
- [ ] 사용자 설정 (대시보드 위젯 커스터마이징)
- [ ] 알림 채널 확장 (이메일, SMS, Slack)
- [ ] 보고서 PDF 내보내기
- [ ] 통계/분석 대시보드 (중요도 분류 정확도, 처리 시간 추이)

### 운영

- [ ] 장애 대응 런북(Runbook) 작성
- [ ] SLA 정의 및 모니터링
- [ ] 정기 보안 스캔 (npm audit, SAST/DAST)
- [ ] 데이터 보존 정책 수립 (NOTAM, 감사 로그)
- [ ] 재해 복구(DR) 계획

---

## 보안 감사 요약 (v1)

| 심각도 | 건수 | 주요 내용 |
|--------|------|----------|
| Critical | 0 | - |
| High | 0 | - |
| Medium | 3 | REF BOOK GET 쿼리 검증 누락, CSP `unsafe-eval`, CORS `*` |
| Low | 4 | Mock JWT 평문, localStorage 인증, console.error 에러 객체, HSTS 미설정 |

> 프로토타입 맥락에서 모두 수용 가능하나, 프로덕션 전환 시 위 체크리스트의 보안 항목을 반드시 처리해야 합니다.

## QA 결과 요약

| 버전 | 테스트 수 | 통과 | 이터레이션 |
|------|----------|------|-----------|
| v1 | 52 | 52/52 (100%) | 3회 |
| v2 | 63 | 63/63 (100%) | 4회 |

코드 리뷰: 9/9 카테고리 PASS, critical 이슈 0건.
