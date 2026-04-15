# 환경 설정 및 배포 가이드

## 로컬 개발 환경 설정

### 사전 요구사항

| 도구 | 최소 버전 | 확인 명령 |
|------|----------|----------|
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |
| AWS CLI | 2.x | `aws --version` |

### 설치 절차

```bash
# 1. 저장소 클론
git clone https://github.com/HyeryeongJoo/7c-notam-prototype.git
cd 7c-notam-prototype

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.local.example .env.local
```

`.env.local` 파일을 편집하여 AWS 자격 증명을 설정합니다:

```bash
# AWS 리전
AWS_REGION=us-east-1

# Bedrock 모델 ID
BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-6-v1:0

# 로컬 개발 시 AWS 프로파일 사용 (권장)
AWS_PROFILE=default
```

> **참고**: AWS 자격 증명은 `~/.aws/credentials` 파일 또는 환경 변수(`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)로 설정할 수 있습니다. IAM 사용자에게 `bedrock:InvokeModel` 권한이 필요합니다.

```bash
# 4. 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 에 접속하여 확인합니다.

### 유용한 명령어

```bash
npm run dev            # 개발 서버 (Turbopack)
npm run build          # 프로덕션 빌드
npm run start          # 프로덕션 서버 (포트 3000)
npm run lint           # ESLint 검사
npm run format         # Prettier 포맷팅
npm run type-check     # TypeScript 타입 체크
npm run test:e2e       # Playwright E2E 테스트
```

---

## 현재 배포 인프라

프로토타입은 다음과 같은 AWS 인프라에 배포되어 있습니다.

### 아키텍처

```
사용자 → CloudFront (d37mgks0nq05m5.cloudfront.net)
          → EC2 (us-east-1, private IP 10.4.1.200)
            → Next.js (포트 3000)
            → Amazon Bedrock (us-east-1)
```

### 인프라 구성

| 구성 요소 | 상세 |
|----------|------|
| EC2 인스턴스 | `i-0304c7e37a51a9584` (us-east-1) |
| 프로세스 관리 | systemd (`notam-prototype.service`) |
| CDN | CloudFront 배포 `E2IKESNE19WJOS` |
| 접속 URL | `https://d37mgks0nq05m5.cloudfront.net` |
| S3 배포 버킷 | `notam-prototype-deploy-163720405317` |
| 앱 경로 | `/opt/notam-prototype/` |

### systemd 서비스 설정

서비스 파일: `/etc/systemd/system/notam-prototype.service`

주요 설정:
- `KillMode=mixed` — 프로세스 종료 시 안전한 정리
- `ExecStopPost=/usr/sbin/fuser -k 3000/tcp` — 포트 3000 해제 보장
- 환경 변수: `NODE_ENV=production`, `AWS_REGION=us-east-1`, `BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-6-v1:0`

### 배포 절차

#### 1. 빌드 패키지 생성

```bash
# 제외 항목: node_modules, .git, .pipeline, test-results, .next 임시 파일, e2e
tar czf notam-prototype.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.pipeline \
  --exclude=test-results \
  --exclude='.next/dev' \
  --exclude='.next/cache' \
  --exclude='.next/diagnostics' \
  --exclude=e2e \
  .
```

#### 2. S3에 업로드

```bash
aws s3 cp notam-prototype.tar.gz \
  s3://notam-prototype-deploy-163720405317/notam-prototype.tar.gz
```

#### 3. EC2에서 배포 (SSM)

```bash
aws ssm send-command \
  --instance-ids "i-0304c7e37a51a9584" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "cd /opt/notam-prototype",
    "sudo systemctl stop notam-prototype",
    "aws s3 cp s3://notam-prototype-deploy-163720405317/notam-prototype.tar.gz /tmp/",
    "sudo tar xzf /tmp/notam-prototype.tar.gz -C /opt/notam-prototype",
    "sudo rm -rf /opt/notam-prototype/.next",
    "cd /opt/notam-prototype && sudo npm install --ignore-scripts",
    "cd /opt/notam-prototype && sudo npm run build",
    "sudo systemctl start notam-prototype"
  ]'
```

#### 4. CloudFront 캐시 무효화

```bash
aws cloudfront create-invalidation \
  --distribution-id E2IKESNE19WJOS \
  --paths "/*"
```

### 서비스 관리 명령어

```bash
# EC2에 SSM으로 접속 후
sudo systemctl status notam-prototype    # 상태 확인
sudo systemctl restart notam-prototype   # 재시작
sudo systemctl stop notam-prototype      # 중지
sudo journalctl -u notam-prototype -f    # 로그 확인 (실시간)
sudo journalctl -u notam-prototype -n 100 # 최근 100줄 로그
```

---

## 프로덕션 배포 시 권장 변경사항

### 데이터 레이어

현재 인메모리 스토어를 DynamoDB 또는 RDS로 교체합니다. Repository 패턴으로 추상화되어 있으므로 구현체만 교체하면 됩니다.

```
src/lib/db/
├── store.ts              ← 인메모리 Map (교체 대상)
├── notam.repository.ts   ← Repository 인터페이스는 유지
├── flight.repository.ts
└── ...
```

### 인증

Mock 인증을 Amazon Cognito로 교체합니다:

1. Cognito User Pool 생성
2. `src/contexts/AuthContext.tsx`의 localStorage 기반 인증을 Cognito SDK로 교체
3. `src/middleware.ts`에 JWT 검증 미들웨어 추가
4. API 라우트에 인증 미들웨어 적용

### 모니터링

- CloudWatch Logs로 서버 로그 전송
- CloudWatch Alarms로 에러 비율 모니터링
- X-Ray로 API 요청 추적
- Bedrock 모델 호출 토큰 사용량 추적
