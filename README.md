# AI NOTAM 분석 시스템 프로토타입

> 운항관리사의 NOTAM 분석 업무를 AI로 자동화하는 웹 애플리케이션 프로토타입

## 빠른 시작

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일에 AWS 자격 증명 설정 (아래 환경 변수 섹션 참조)

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 을 열어 확인합니다.

프로토타입 로그인 화면에서 아무 사번/비밀번호를 입력하면 진입됩니다 (mock 인증).

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 15 (App Router) | 풀스택 프레임워크 |
| React | 19 | UI 라이브러리 |
| TypeScript | 5+ (strict mode) | 타입 안전성 |
| Cloudscape Design System | v3+ | AWS 스타일 UI 컴포넌트 |
| Amazon Bedrock | Claude Sonnet | AI NOTAM 분석 (실제 호출) |
| Leaflet + react-leaflet | 1.9 / 5.0 | 항로/NOTAM 지도 시각화 |
| SWR | 2.4 | 클라이언트 데이터 패칭 |
| zod | 4.3 | API 입력 검증 |

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지 및 API
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 대시보드 (홈)
│   ├── notams/             # NOTAM 목록/상세
│   ├── flights/            # 운항편 목록/상세
│   ├── routes/             # 항로 목록/상세
│   ├── ref-book/           # REF BOOK 관리
│   ├── briefings/          # 브리핑 문서
│   ├── decisions/          # 의사결정 기록
│   ├── audit-log/          # 감사 로그
│   └── api/                # API Route Handlers (33개)
├── components/             # Cloudscape UI 컴포넌트
│   ├── common/             # 공용 컴포넌트 (ImportanceBadge 등)
│   ├── dashboard/          # 대시보드 위젯
│   ├── notams/             # NOTAM 관련
│   ├── flights/            # 운항편 관련
│   ├── routes/             # 항로 관련
│   ├── briefings/          # 브리핑 관련
│   ├── decisions/          # 의사결정 관련
│   ├── ref-book/           # REF BOOK 관련
│   ├── audit-log/          # 감사 로그 관련
│   └── layout/             # AppShell, Providers
├── types/                  # 공유 TypeScript 인터페이스 (13개)
├── lib/
│   ├── ai/                 # Bedrock 프롬프트 및 파서
│   ├── db/                 # 인메모리 리포지토리 (11개)
│   ├── services/           # 비즈니스 로직 (bedrock, matching, qCode, notamDiff)
│   └── validation/         # zod 검증 스키마 (9개)
├── data/                   # 시드 데이터 (50 NOTAMs, 12 항로, 30 운항편, 15 공항)
├── hooks/                  # SWR 기반 API 호출 훅 (18개)
├── contexts/               # React Context (Auth, Alert, Notification)
└── middleware.ts           # 보안 헤더 미들웨어
```

## 주요 페이지

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | 대시보드 | 항로 영향도 지도, 중요 NOTAM 알림, 영향 운항편 요약 |
| `/notams` | NOTAM 목록 | PropertyFilter 기반 필터링, 중요도 배지, Split Panel 상세 |
| `/notams/[id]` | NOTAM 상세 | 원문/파싱, AI 분석, 영향 항로/운항편, 미니맵, 의사결정 |
| `/flights` | 운항편 목록 | 운항편 테이블, NOTAM 영향 상태 |
| `/flights/[id]` | 운항편 상세 | 운항 정보, NOTAM 영향 지도, 대체 항로 제안 |
| `/routes` | 항로 목록 | 항로 테이블, 상태 설명 팝오버 |
| `/routes/[id]` | 항로 상세 | 항로 정보, 지도, NOTAM 영향, 대체 항로 |
| `/ref-book` | REF BOOK | 중요 NOTAM 등재/관리 |
| `/briefings` | 브리핑 문서 | 출발/도착 브리핑 자동 생성, 승무원 패키지 |
| `/decisions` | 의사결정 기록 | TIFRS 기반 의사결정 목록, 상세 조회 |
| `/audit-log` | 감사 로그 | 모든 운항관리사 행동 기록 |

## API 엔드포인트

### NOTAM
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/notams` | NOTAM 목록 (필터링, 정렬, 페이지네이션) |
| GET | `/api/notams/stats` | NOTAM 중요도별 통계 |
| GET | `/api/notams/alerts` | Critical NOTAM 알림 목록 |
| POST | `/api/notams/analyze` | AI 중요도 분석 실행 |
| POST | `/api/notams/process-all` | 전체 NOTAM 일괄 처리 |
| GET | `/api/notams/[id]` | NOTAM 상세 조회 |
| POST | `/api/notams/[id]/process` | 개별 NOTAM 3단계 파이프라인 처리 |
| POST | `/api/notams/[id]/summarize` | AI 한국어 요약 생성 |
| POST | `/api/notams/[id]/impact-analysis` | AI 종합 영향 분석 |
| GET | `/api/notams/[id]/affected-flights` | 영향 운항편 조회 |
| GET | `/api/notams/[id]/affected-routes` | 영향 항로 조회 |
| GET | `/api/notams/[id]/diff` | NOTAMR 변경 비교 |
| GET/POST | `/api/notams/[id]/decision` | TIFRS 의사결정 조회/기록 |

### 운항편/항로
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/flights` | 운항편 목록 |
| GET | `/api/flights/[id]` | 운항편 상세 |
| GET | `/api/routes` | 항로 목록 |
| GET | `/api/routes/[id]` | 항로 상세 |
| POST | `/api/routes/[id]/alternatives` | AI 대체 항로 제안 |
| GET | `/api/routes/[id]/impact` | 항로 NOTAM 영향도 |

### 대시보드/매칭
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/dashboard/route-impact` | 대시보드 항로 영향도 데이터 |
| POST | `/api/matching/calculate` | NOTAM-항로/운항편 매칭 실행 |
| GET | `/api/matching/results` | 매칭 결과 조회 |

### 문서/기록
| Method | Path | 설명 |
|--------|------|------|
| GET/POST | `/api/briefings` | 브리핑 목록/생성 |
| POST | `/api/briefings/generate` | AI 운항관리사 브리핑 생성 |
| POST | `/api/briefings/generate-crew` | AI 승무원 브리핑 생성 |
| GET | `/api/briefings/[id]` | 브리핑 상세 |
| GET | `/api/briefings/[id]/crew-package` | 승무원 패키지 조회 |
| GET/POST | `/api/ref-book` | REF BOOK 목록/등록 |
| PUT/DELETE | `/api/ref-book/[id]` | REF BOOK 수정/삭제 |
| GET/POST | `/api/reports/shift-handover` | 교대근무 보고서 목록/생성 |
| GET | `/api/reports/shift-handover/[id]` | 교대근무 보고서 상세 |
| GET | `/api/decisions` | 의사결정 기록 목록 |
| GET | `/api/audit-log` | 감사 로그 목록 |
| POST | `/api/audit-log` | 감사 로그 기록 |
| GET | `/api/q-codes` | Q-Code 참조 데이터 |
| POST | `/api/auth/login` | 로그인 (mock) |

## 환경 변수

`.env.local.example` 파일을 `.env.local`로 복사하고 설정합니다.

| 변수 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| `AWS_REGION` | O | `us-west-2` | Bedrock 모델 배포 리전 |
| `AWS_PROFILE` | - | `default` | 로컬 개발 시 AWS 프로파일 |
| `BEDROCK_MODEL_ID` | O | `us.anthropic.claude-sonnet-4-20250514-v1:0` | Bedrock 모델 ID |

AI 기능은 실제 Amazon Bedrock 호출을 사용합니다. AWS 자격 증명이 필요합니다:
- 로컬 개발: `aws configure` 또는 `AWS_PROFILE` 환경 변수
- EC2 배포: IAM Instance Role (권장)

필요한 IAM 권한: `bedrock:InvokeModel` (해당 모델에 대해)

## 주요 npm 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (Turbopack) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npm run lint` | ESLint 검사 |
| `npm run format` | Prettier 포맷팅 |
| `npm run type-check` | TypeScript 타입 검사 |
| `npm run test:e2e` | Playwright E2E 테스트 (63개) |

## 배포 현황

현재 프로토타입은 다음 인프라에 배포되어 있습니다:

| 항목 | 값 |
|------|-----|
| URL | https://d37mgks0nq05m5.cloudfront.net |
| EC2 | `i-0304c7e37a51a9584` (us-east-1) |
| 앱 경로 | `/opt/notam-prototype/` |
| 프로세스 관리 | systemd (`notam-prototype.service`) |
| CDN | CloudFront (`E2IKESNE19WJOS`) |
| 배포 버킷 | `notam-prototype-deploy-163720405317` (S3) |

배포 상세는 `docs/SETUP.md`를 참조하세요.
