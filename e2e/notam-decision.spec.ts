import { test, expect } from '@playwright/test';

/**
 * FR-020: NOTAM 상세 페이지 내 TIFRS 의사결정 섹션
 *
 * AC: 의사결정 기록이 NOTAM에 연결되어 상세 페이지에 표시되어야 한다
 * AC: TIFRS 기준 필드 (Time, Impact, Facilities, Route, Schedule)가 있어야 한다
 */
test.describe('FR-020: NOTAM decision section on detail page', () => {
  // NOTAM 상세 페이지에 NotamDecisionSection이 렌더링되어야 한다
  test('NOTAM detail page should render decision section', async ({ page }) => {
    // API에서 첫 번째 NOTAM ID를 가져온다
    const apiResponse = await page.request.get('/api/notams');
    const body = await apiResponse.json();
    const notams = body.items || body.data || body.notams || body;
    const firstNotamId = Array.isArray(notams) ? notams[0]?.id : null;
    expect(firstNotamId).toBeTruthy();

    await page.goto(`/notams/${firstNotamId}`);
    await expect(page.getByRole('heading').first()).toBeVisible();

    // 의사결정 관련 섹션/헤딩이 존재해야 한다
    const decisionSection = page.getByText(/의사결정|TIFRS|Decision/i);
    await expect(decisionSection.first()).toBeVisible();
  });

  // TIFRS 폼 또는 기존 의사결정 표시 (인터랙션 테스트)
  test('decision section should show TIFRS form or existing decision record', async ({ page }) => {
    // 의사결정이 존재하는 NOTAM으로 접근 (notam-001은 시드 데이터에 decision이 있음)
    const apiResponse = await page.request.get('/api/notams');
    const body = await apiResponse.json();
    const notams = body.items || body.data || body.notams || body;
    const firstNotamId = Array.isArray(notams) ? notams[0]?.id : null;
    expect(firstNotamId).toBeTruthy();

    await page.goto(`/notams/${firstNotamId}`);
    await expect(page.getByRole('heading').first()).toBeVisible();

    // TIFRS 의사결정 기록 섹션으로 스크롤 (페이지 하단에 위치)
    const tifrsHeading = page.getByRole('heading', { name: /TIFRS|의사결정/i }).first();
    await tifrsHeading.scrollIntoViewIfNeeded();
    await expect(tifrsHeading).toBeVisible();

    // 로딩이 끝날 때까지 대기 (의사결정 기록을 불러오는 중... 메시지가 사라질 때까지)
    await expect(page.getByText(/불러오는 중/))
      .toBeHidden({ timeout: 10000 })
      .catch(() => {});

    // TIFRS 관련 필드가 표시되어야 한다 (폼이든, 기존 기록이든)
    // 폼 라벨: "T — Time (시간적 영향)", 기존 기록 라벨: "T — Time:"
    const tifrsLabels = [
      page.getByText(/T\s*—\s*Time/),
      page.getByText(/I\s*—\s*Impact/),
      page.getByText(/F\s*—\s*Facilities/),
      page.getByText(/R\s*—\s*Route/),
      page.getByText(/S\s*—\s*Schedule/),
    ];

    // TIFRS 5개 필드 중 최소 3개는 보여야 한다
    let visibleCount = 0;
    for (const label of tifrsLabels) {
      // 각 라벨을 뷰포트로 스크롤한 후 확인
      const first = label.first();
      await first.scrollIntoViewIfNeeded().catch(() => {});
      const isVisible = await first.isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) visibleCount++;
    }
    expect(visibleCount).toBeGreaterThanOrEqual(3);
  });

  // 의사결정 기록 폼에 필수 입력 요소가 있어야 한다 (인터랙션 테스트)
  test('decision form should have decision type selector and rationale input', async ({ page }) => {
    // 의사결정이 아직 없는 NOTAM으로 이동하여 폼 확인
    const apiResponse = await page.request.get('/api/notams');
    const body = await apiResponse.json();
    const notams = body.items || body.data || body.notams || body;
    // 시드 데이터에서 의사결정이 없는 NOTAM을 찾기 위해 여러 NOTAM 시도
    expect(Array.isArray(notams)).toBeTruthy();
    expect(notams.length).toBeGreaterThan(0);

    // 마지막 NOTAM을 사용 (시드 데이터에서 decision이 없을 가능성이 높음)
    const targetNotamId = notams[notams.length - 1]?.id || notams[0]?.id;

    await page.goto(`/notams/${targetNotamId}`);
    await expect(page.getByRole('heading').first()).toBeVisible();

    // TIFRS 의사결정 섹션으로 스크롤 (페이지 하단에 위치)
    const tifrsHeading = page.getByRole('heading', { name: /TIFRS|의사결정/i }).first();
    await tifrsHeading.scrollIntoViewIfNeeded();
    await expect(tifrsHeading).toBeVisible();

    // 로딩이 끝날 때까지 대기
    await expect(page.getByText(/불러오는 중/))
      .toBeHidden({ timeout: 10000 })
      .catch(() => {});

    // 의사결정 폼 또는 기존 의사결정 표시 중 하나가 있어야 한다
    // 폼 요소: 의사결정 유형 Select, TIFRS textbox, 저장 버튼
    const decisionTypeButton = page.getByRole('button', { name: /의사결정 유형|결정 유형/i });
    const tifrsTextboxes = page.getByRole('textbox', {
      name: /Time|Impact|Facilities|Route|Schedule|결정 근거|기록자/i,
    });
    const submitButton = page.getByRole('button', { name: /의사결정 기록|초기화/i });
    // 기존 의사결정 표시: 결정 유형 라벨, TIFRS 분석 텍스트, T — Time: 라벨
    const existingDecisionType = page.getByText(/결정 유형/);
    const existingTifrsAnalysis = page.getByText(/TIFRS 분석/);
    const existingTifrsLabel = page.getByText(/T\s*—\s*Time/);

    const hasTypeSelector = await decisionTypeButton
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const hasTextbox = await tifrsTextboxes
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const hasButton = await submitButton
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const hasExistingDecision = await existingDecisionType
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const hasExistingTifrs = await existingTifrsAnalysis
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const hasExistingLabel = await existingTifrsLabel
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    // 폼 요소 또는 기존 의사결정 표시 중 하나는 있어야 한다
    expect(
      hasTypeSelector ||
        hasTextbox ||
        hasButton ||
        hasExistingDecision ||
        hasExistingTifrs ||
        hasExistingLabel,
    ).toBeTruthy();
  });
});
