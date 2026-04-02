# 도메인 리서치: Aviation / LCC -- NOTAM 분석 및 운항관리

## 산업 개요

NOTAM(Notice to Air Missions)은 항공기 운항에 영향을 줄 수 있는 시설, 서비스, 절차, 위험 요소의 변경사항을 항공 관련자에게 통지하는 공식 문서이다. ICAO 표준에 따라 정형화된 약어와 코드(Q-Code)로 작성되며, AFTN(항공고정통신망)을 통해 전 세계적으로 배포된다.

제주항공은 대한민국 최초이자 최대 규모의 저비용항공사(LCC)로, Boeing 737 계열 45대를 운영하며 41개 노선(국내선 + 일본/중국/동남아/오세아니아 국제선)을 운항한다. 본사는 제주시에 있으며, 김해/제주/김포/인천 4개 공항을 거점으로 운영한다.

현재 제주항공 통제센터팀은 운항관리사 3명이 24시간 교대 근무로 하루 수천 건의 NOTAM을 수동 모니터링하고 있으며, 비정형 텍스트 해석, REF BOOK 수기 등재, 브리핑 자료 수작업 등에 과도한 업무 시간이 소모되고 있다. AI 기반 자동화 시스템을 통해 이 병목을 해소하는 것이 핵심 과제이다.

## 핵심 엔티티 및 데이터 모델

### NOTAM (항공고시보)
- **주요 속성**: ID, 시리즈, 번호, 연도, 유형(N/R/C), Q코드, FIR, 교통유형, 목적, 범위, 하한/상한 고도, 위경도, 반경, 위치식별자, 유효시작/종료, 본문, 중요도 점수
- **상태값**: new, active, analyzed, ref-book-registered, expired, cancelled, replaced
- **ICAO 표준 형식**:
  - Q-line: `Q) FIR/QCODE/TRAFFIC/PURPOSE/SCOPE/LOWER/UPPER/COORDINATES-RADIUS`
  - Field A: ICAO 위치식별자
  - Field B: 유효 시작일시 (YYMMDDHHmm UTC)
  - Field C: 유효 종료일시 또는 PERM
  - Field D: 선택적 일간 스케줄
  - Field E: 본문 설명 (ICAO 약어 사용)
  - Field F/G: 하한/상한 고도

### RefBookEntry (REF BOOK 등재 기록)
- 운항관리사가 중요하다고 판단하여 등재한 NOTAM 기록
- **속성**: 등재자, 등재일, 요약, 영향도, 영향 공항/노선, 비고

### Flight (운항편)
- **속성**: 편명, 출발/도착 공항, 예정 시각, 항로ID, 기종, 상태

### Route (항로)
- NAVBLUE 데이터 기반 항로 정보
- **속성**: 항로명, 출발/도착 공항, 웨이포인트 목록, 항공로, 거리, 비행고도, 대체항로

### Airport (공항)
- **속성**: ICAO코드, IATA코드, 이름, 위경도, 활주로 수, FIR, 국가

### Briefing (브리핑 문서)
- AI가 자동 생성하는 문서 (운항관리사 결재문서, Company NOTAM, DISP COMMENT, 승무원 브리핑)
- **유형**: dispatcher-summary, company-notam, disp-comment, crew-briefing

### 관계
- NOTAM은 여러 공항/항로/운항편에 영향을 미침
- NOTAM은 선택적으로 REF BOOK에 등재됨
- NOTAMR은 기존 NOTAM을 대체 (자기참조)
- Route는 여러 Waypoint를 포함하고 여러 Flight에 사용됨
- Briefing은 여러 NOTAM을 포함하며 특정 Flight에 연결됨

## 업계 표준 워크플로우

### 1. NOTAM 수신 및 분류 (Intake & Triage)
1. AFTN을 통해 NOTAM 전문 수신
2. ICAO 형식 파싱 (Q-line, Field A-G 분리)
3. Q-Code 추출 및 기본 분류 (예: QMRLC = 활주로 폐쇄)
4. 공간 데이터 추출 (위경도, 반경)
5. 시간 데이터 추출 (유효 기간)
6. AI 중요도 점수화 (0~1 확률값)
7. 중요도 등급 분류 (critical/high/medium/low/routine)
8. 운항관리사에게 전달

### 2. 영향 분석 (Impact Analysis)
1. 영향받는 공항 매칭
2. 영향받는 FIR 매칭
3. 자사 항로와 교차 분석
4. 운항 스케줄과 교차 분석
5. 공간적 겹침 계산 (NOTAM 영역 vs 항로 경로)
6. 영향받는 운항편 식별
7. 운항 영향도 평가
8. 영향 보고서 생성

### 3. REF BOOK 등재
1. 운항관리사 검토
2. AI가 REF BOOK 등재 제안
3. 운항관리사 확인/수정
4. REF BOOK 등재
5. 관련 부서 통보

### 4. 브리핑 문서 생성
1. 해당 운항편 관련 NOTAM 수집
2. 운항관리사용 요약 생성
3. Company NOTAM 생성
4. DISP COMMENT 생성
5. 승무원 브리핑 패키지 생성
6. 운항관리사 검토 및 승인
7. 브리핑 배포

### 5. 항로 우회 결정
1. 고영향 NOTAM 식별
2. 영향받는 항로 구간 평가
3. AI가 대체 항로 제안 (예: 인천-방콕 1번 대신 98번 루트)
4. 운항관리사 대안 평가
5. 항로 변경 승인
6. 비행 계획 업데이트
7. 승무원 통보

## 핵심 KPI

| KPI | 계산 방식 | 일반적 목표 | 프로토타입 적용 |
|-----|----------|-----------|---------------|
| NOTAM 처리 시간 | 수신~분류 완료 소요 시간 | 루틴 < 5분, 긴급 < 1분 | 대시보드 핵심 지표 -- 현재 15-30분 대비 개선 효과 표시 |
| 중요 NOTAM 탐지율 | AI 탐지 건수 / 실제 중요 건수 x 100 | 99.5%+ | 안전 핵심 지표 -- AI가 놓치면 안 됨 |
| 오탐율 (False Positive) | 비중요인데 중요로 분류된 건수 / 중요 분류 건수 x 100 | < 10% | 알림 피로 방지 지표 |
| 일일 NOTAM 수신량 | 24시간 총 수신 건수 | 추적용 (수천 건/일) | 대시보드 위젯 -- 시스템 부하 표시 |
| 필터링 비율 | 주의 필요 건수 / 총 수신 건수 x 100 | 5-15%가 주의 필요 | 자동화 효과 지표 |
| REF BOOK 등재 정확도 | AI 제안 수락 건수 / 총 AI 제안 건수 x 100 | > 85% | AI 제안 품질 지표 |
| 브리핑 생성 시간 | 요청~완성 소요 시간 | < 2분 (수동 20-30분 대비) | 핵심 시간 절감 지표 |
| 항로 영향 분석 커버리지 | 분석 완료 항로 / 전체 운항 항로 x 100 | 100% | 분석 누락 방지 |

## 유사 제품 공통 기능

| 기능 | 고객 브리프에 있는가 | 제안 |
|------|-------------------|------|
| NOTAM 텍스트 파싱 및 구조화 | 있음 | Q-Code 기반 자동 파싱 및 구조화 저장 |
| 지도 기반 NOTAM 시각화 | 있음 | NOTAM 영역을 지도 위에 표시, 항로 오버레이 |
| NOTAM 변경 추적 (diff view) | 없음 | NOTAMR 발생 시 변경 전후 비교 표시 |
| NOTAM 만료 자동 관리 | 없음 | 만료 카운트다운, 자동 아카이브 |
| 커스텀 필터 프로파일 | 없음 | 운항관리사별 필터 프리셋 저장 |
| NOTAM 평문 번역 | 있음 (LLM 활용) | 약어 가득한 NOTAM을 한국어 요약으로 변환 |
| 교대 인수인계 보고서 | 없음 | 교대 시점 이후 변경된 NOTAM 자동 요약 |
| NOTAM 통계 및 트렌드 | 없음 | 기간별 NOTAM 추이, 공항/항로별 분석 |
| 실시간 알림 (푸시) | 없음 | 임계치 초과 NOTAM에 대한 즉시 알림 |

## 도메인 용어

| 용어 | 설명 |
|------|------|
| NOTAM | Notice to Air Missions -- 항공 위험요소/변경사항 공식 통지 |
| Q-Code | NOTAM Q-line의 5글자 한정 코드 (예: QMRLC). 2-3번째 글자 = 대상, 4-5번째 글자 = 상태 |
| AFTN | Aeronautical Fixed Telecommunication Network -- 항공고정통신망 |
| FIR | Flight Information Region -- 비행정보구역 |
| ICAO | International Civil Aviation Organization -- 국제민간항공기구 |
| REF BOOK | 제주항공 내부 중요 NOTAM 기록 장부 |
| Company NOTAM | 항공사 자체 제작 승무원용 NOTAM 브리핑 문서 |
| DISP COMMENT | Dispatcher Comment -- 운항관리사 운항 참고사항 |
| J-FOS | Jeju Air Flight Operations System -- 제주항공 운항관리 시스템 |
| NAVBLUE | Airbus 자회사, 항로 계획 및 항법 데이터 제공 |
| NOTAMN / NOTAMR / NOTAMC | 신규(N), 대체(R), 취소(C) NOTAM 유형 |
| Q-line | NOTAM 형식의 한정자 라인: FIR/QCODE/교통유형/목적/범위/하한/상한/좌표-반경 |
| SFC / UNL | Surface(지표면) / Unlimited(무한) -- NOTAM 고도 표현 |
| UTC (Zulu) | 협정세계시 -- 항공 운영의 표준 시간 기준 |
| Waypoint | 항로 정의에 사용되는 명명된 지리적 지점 (5글자 ICAO 코드) |
| Flight Level | 표준기압 기준 고도 (예: FL350 = 35,000피트) |
| AIP | Aeronautical Information Publication -- 항공정보간행물 |
| PIB | Pre-flight Information Bulletin -- 비행 전 정보 브리핑 |
| SNOWTAM | 활주로 적설/결빙 상태 보고 특수 NOTAM |
| ASHTAM | 화산재 활동 보고 특수 NOTAM |
| BIRDTAM | 조류 활동 위험 보고 NOTAM |

## Q-Code 주요 예시

| Q-Code | 의미 |
|--------|------|
| QMRLC | 활주로 폐쇄 (Runway Closed) |
| QMRXX | 활주로 상태 변경 (일반) |
| QMXLC | 유도로 폐쇄 (Taxiway Closed) |
| QMALC | 공항 폐쇄 (Aerodrome Closed) |
| QMAXX | 공항 상태 변경 (일반) |
| QNBAS | NDB 장비 운용 불가 |
| QNVAS | VOR 장비 운용 불가 |
| QFALT | 공역 제한 (Airspace Limited) |
| QFALC | 공역 폐쇄 (Airspace Closed) |
| QWMLW | 미사일/사격/로켓 발사 |
| QWPLW | 낙하산 강하 |
| QLLAS | 활주로 조명 운용 불가 |
| QICAS | ILS 운용 불가 |
| QPICH | SID/STAR 절차 변경 |

## 규제/컴플라이언스

| 규정 | 설명 | 관련성 |
|------|------|--------|
| ICAO Annex 15 | 항공정보서비스 표준 -- NOTAM 형식/배포 요건 정의 | NOTAM 파싱 시 준수 필수 |
| ICAO Doc 8126 | 항공정보서비스 매뉴얼 -- NOTAM 처리 절차 상세 | NOTAM 생애주기 처리 참조 |
| ICAO Doc 8400 | ICAO 약어 및 코드 -- Q-Code 표준 | Q-Code 해석의 기준 문서 |
| 항공안전법 (한국) | 대한민국 항공안전 관련 국내법 | 제주항공 운항의 법적 프레임워크 |
| 국토교통부 항공정보관리 기준 | 한국 항공정보 관리 표준 | 국내 항공사의 NOTAM 처리 요건 |

## 제안 요구사항

고객이 명시하지 않았지만 도메인 표준으로 볼 때 포함하면 좋은 기능:

1. **교대 인수인계 보고서 자동 생성** (should-have)
   - 3명 24시간 교대 근무 체제에서 교대 시점 이후 신규/변경/긴급 NOTAM을 자동 요약하여 인수인계 누락 방지

2. **NOTAM 평문 한국어 요약** (should-have)
   - LLM이 이미 활용되므로, 약어 가득한 NOTAM 원문을 한국어 요약문으로 자동 변환하는 기능은 저비용 고효과

3. **긴급 NOTAM 실시간 알림** (should-have)
   - 임계치 초과 NOTAM 발생 시 화면 상단 배너 또는 사운드 알림으로 즉시 인지

4. **운항관리사 행동 감사 추적** (should-have)
   - 항공 규제 컴플라이언스 차원에서 누가 언제 어떤 NOTAM을 검토/승인/조치했는지 기록

5. **NOTAM 변경 추적 (diff view)** (nice-to-have)
   - NOTAMR 발생 시 이전 NOTAM과의 변경점을 하이라이트

6. **NOTAM 만료 자동 관리** (nice-to-have)
   - 만료 임박 NOTAM 카운트다운 표시, 만료된 NOTAM 자동 아카이브

7. **커스텀 필터 프로파일** (nice-to-have)
   - 운항관리사별 자주 사용하는 필터 조건 저장

8. **NOTAM 통계 및 트렌드 대시보드** (nice-to-have)
   - 기간별 NOTAM 수신 추이, 공항/항로별 빈도 분석

## 프로토타입 참고사항

### 시드 데이터 작성 시 참고

- **NOTAM 샘플**: ICAO 표준 형식을 준수하여 현실적인 NOTAM 전문 생성 필요
  - 예: `A0123/26 NOTAMN Q) RKRR/QMRLC/IV/NBO/A/000/999/3734N12653E005 A) RKSI B) 2603150000 C) 2603152359 E) RWY 15L/33R CLSD DUE TO MAINTENANCE`
- **Q-Code 매핑 테이블**: 주요 Q-Code와 의미를 시드 데이터로 포함
- **공항 데이터**: 제주항공 취항 공항의 ICAO/IATA 코드, 활주로 수, FIR 정보
  - 주요 공항: RKSI(인천), RKSS(김포), RKPC(제주), RKPK(김해), RJTT(하네다), RJAA(나리타), VTBS(수완나품), RPLL(마닐라) 등
- **항로 데이터**: 인천-방콕, 인천-도쿄 등 주요 노선의 웨이포인트 좌표
- **운항 스케줄**: 제주항공 실제 노선 기반 샘플 스케줄 (하루 약 100-150편)
- **REF BOOK 과거 데이터**: 다양한 유형의 과거 등재 기록 (활주로 폐쇄, 공역 제한, 항행시설 장애 등)

### LCC 운항관리 특성

- 운항관리사 3명의 소규모 팀 -- UI/UX는 소수 전문가 대상으로 정보 밀도 높게 설계
- 24시간 교대 근무 -- 교대 시점 컨텍스트 유지가 중요
- Boeing 737 단일 기종 운영 -- 기종별 분기 로직 불필요
- Point-to-point 노선 -- 허브앤스포크 대비 단순한 항로 구조
- 빠른 턴어라운드 -- 시간에 민감한 운항 결정

### 지도 시각화

- NOTAM 영향 영역: 위경도 중심 + 반경(해리)으로 원형 영역 표시
- 항로: 웨이포인트 연결 라인
- 교차 영역: NOTAM 영역과 항로의 겹침을 시각적으로 강조
- 프로토타입에서는 Leaflet 또는 MapLibre GL 등 오픈소스 지도 라이브러리 사용 가능

### NOTAM 형식 파싱 주요 포인트

- Q-line 파싱: `/` 구분자로 7개 필드 분리
- 좌표 파싱: `DDMMssN/DDDMMssE` 형식 (도/분/초)
- 반경: 해리(nautical miles) 단위, 3자리 숫자
- 날짜: `YYMMDDHHmm` UTC 형식
- NOTAM 유형: 첫 줄에서 NOTAMN/NOTAMR/NOTAMC 식별
- 본문(Field E): 비정형 텍스트 -- LLM 해석 대상
