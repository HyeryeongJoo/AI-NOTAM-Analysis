# AI 기능 아키텍처

## 개요

이 시스템은 Amazon Bedrock의 Claude 모델을 활용하여 8가지 AI 기능을 제공합니다. AI-Assisted Workflow 패턴(autonomy ≤ 5)을 사용하며, 모든 AI 출력은 운항관리사의 검토를 거쳐야 합니다. 에이전트 SDK 없이 Bedrock API를 직접 호출하는 방식입니다.

## 모델 설정

| 항목 | 값 |
|------|-----|
| 모델 | Claude Sonnet 4 (`us.anthropic.claude-sonnet-4-20250514-v1:0`) |
| SDK | `@aws-sdk/client-bedrock-runtime` |
| 호출 방식 | `InvokeModelCommand` (동기 호출) |
| 프롬프트 형식 | XML 태그 기반 구조화 |
| 출력 형식 | JSON (XML 래핑) |
| 파싱 | 정규식 + JSON.parse + fallback |

### 환경 변수

```bash
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-20250514-v1:0
```

> **중요**: AI 기능은 실제 Bedrock 호출이 필수입니다. Mocking은 금지되어 있습니다.

## AI 함수 목록

### 1. NOTAM 중요도 분석 (`analyzeImportance`)

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-001 |
| API | `POST /api/notams/analyze` |
| 입력 | NOTAM rawText, Q-Code, 공항 정보 |
| 출력 | importanceScore (0.0~1.0), importanceLevel, reasoning |
| 시스템 프롬프트 | `NOTAM_IMPORTANCE_SYSTEM_PROMPT` |

NOTAM 원문을 분석하여 0~1 확률값으로 중요도를 산출합니다. Q-Code 규칙 기반 분류 결과를 입력에 포함하여 하이브리드 분석을 수행합니다.

### 2. NOTAM 필드 추출 (`extractFields`)

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-001 (파이프라인 1단계) |
| API | `POST /api/notams/[id]/process` |
| 입력 | NOTAM rawText |
| 출력 | 구조화된 필드 (공항, Q-Code, 좌표, 유효기간, 고도 등) |
| 시스템 프롬프트 | `NOTAM_FIELD_EXTRACTION_SYSTEM_PROMPT` |

비구조화된 ICAO NOTAM 텍스트에서 구조화된 필드를 AI로 추출합니다.

### 3. 한국어 요약 생성 (`generateKoreanSummary`)

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-015 |
| API | `POST /api/notams/[id]/summarize` |
| 입력 | NOTAM rawText, parsed fields |
| 출력 | 1~2문장 한국어 요약 |
| 시스템 프롬프트 | `KOREAN_SUMMARY_SYSTEM_PROMPT` |

### 4. 종합 영향 분석 (`analyzeImpact`)

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-003 |
| API | `POST /api/notams/[id]/impact-analysis` |
| 입력 | NOTAM, 공항 데이터 (활주로 수), 영향 운항편/항로 |
| 출력 | 심각도, 설명, 맥락 요인 |
| 시스템 프롬프트 | `IMPACT_ANALYSIS_SYSTEM_PROMPT` |

공간(공항 활주로 수, 위치)과 스케줄(운항 시간대) 데이터를 결합하여 종합 영향도를 분석합니다.

### 5. 대안 항로 제안 (`suggestAlternatives`)

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-009 |
| API | `POST /api/routes/[id]/alternatives` |
| 입력 | 현재 항로, 영향 NOTAM, 대체 항로 후보 |
| 출력 | 대안 항로 목록 (사유, 거리/시간 비교) |
| 시스템 프롬프트 | `ROUTE_ALTERNATIVES_SYSTEM_PROMPT` |

### 6. 브리핑 문서 생성 (`generateBriefing`)

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-007 |
| API | `POST /api/briefings/generate` |
| 입력 | 운항편, 관련 NOTAM, 영향 분석 |
| 출력 | 브리핑 마크다운 (출발/도착 구분) |
| 시스템 프롬프트 | `getBriefingSystemPrompt(type)` |

### 7. 승무원 패키지 생성 (`generateCrewPackage`)

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-008 |
| API | `POST /api/briefings/generate-crew` |
| 입력 | 운항편, NOTAM, 항공 용어 |
| 출력 | DISP COMMENT, Company NOTAM |
| 파서 | `parseCrewPackageResult` |

### 8. TIFRS 의사결정 분석 (`analyzeTifrsDecision`)

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-020 (v2) |
| API | `GET /api/notams/[id]/decision` (AI 사전 분석) |
| 입력 | NOTAM, 영향 분석 결과 |
| 출력 | 의사결정 유형, TIFRS 5개 기준 값 |
| 시스템 프롬프트 | `TIFRS_DECISION_SYSTEM_PROMPT` |

TIFRS(시간-정보-운항-위험-안전) 기준으로 NOTAM 대응 의사결정을 AI가 사전 분석합니다.

### 교대 근무 보고서 생성 (`generateShiftHandover`)

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-014 |
| API | `POST /api/reports/shift-handover` |
| 입력 | 근무 시간 내 NOTAM 변경, 의사결정, 브리핑 |
| 출력 | 교대 인수인계 보고서 |
| 시스템 프롬프트 | `SHIFT_HANDOVER_SYSTEM_PROMPT` |

## 프롬프트 구조

모든 프롬프트는 XML 태그 기반으로 구조화되어 있습니다.

### 파일 위치

```
src/lib/ai/
├── prompts/
│   ├── system.ts       — 시스템 프롬프트 8개 (역할, 규칙, 출력 형식)
│   └── templates.ts    — 메시지 템플릿 9개 (입력 데이터 구조화)
├── parsers.ts          — AI 출력 JSON 파싱 (정규식 + fallback)
└── types.ts            — AI 입출력 TypeScript 인터페이스
```

### 프롬프트 패턴 예시

```xml
<system>
항공 NOTAM 분석 전문가 역할을 수행합니다.
<rules>
1. 중요도 점수는 0.0~1.0 범위
2. 분류: critical(0.8+), high(0.6~0.8), medium(0.4~0.6), low(0.2~0.4), routine(0~0.2)
</rules>
<output_format>
JSON으로 응답하세요: { "importanceScore": number, "importanceLevel": string, "reasoning": string }
</output_format>
</system>

<user>
<notam>
<raw_text>{NOTAM 원문}</raw_text>
<q_code>{Q-Code}</q_code>
<airport>{공항 정보}</airport>
</notam>
</user>
```

### JSON 파싱 전략

AI 출력은 항상 JSON 파싱을 시도하며, 실패 시 정규식으로 fallback합니다:

1. `JSON.parse(response)` 시도
2. 실패 시 `/{.*}/s` 정규식으로 JSON 블록 추출
3. 여전히 실패 시 기본값 반환

## 프로덕션 전환 시 고려사항

| 항목 | 현재 (프로토타입) | 권장 (프로덕션) |
|------|-----------------|----------------|
| 호출 방식 | 동기 InvokeModel | 스트리밍 InvokeModelWithResponseStream |
| Rate Limiting | 없음 | API 라우트별 제한 필요 |
| 에러 처리 | console.error + 일반 메시지 | 구조화 로깅 + 재시도 로직 |
| 프롬프트 관리 | 코드 내 하드코딩 | 프롬프트 레지스트리 또는 Bedrock Prompt Management |
| 비용 관리 | 없음 | 토큰 사용량 추적 + 예산 알림 |
| 캐싱 | 없음 | 동일 NOTAM 분석 결과 캐싱 |
| Few-shot 학습 | 프롬프트 내 예시 | 3년 REF BOOK 이력 RAG |
