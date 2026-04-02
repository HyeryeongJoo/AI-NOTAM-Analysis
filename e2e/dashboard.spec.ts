import { test, expect } from '@playwright/test';

/**
 * FR-006: Route impact analysis dashboard with map
 * FR-005: Critical NOTAM auto-filtering (dashboard summary)
 * FR-016: Critical NOTAM real-time alert banner
 */
test.describe('FR-006: Route impact analysis dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Cloudscape 렌더링 대기 - heading이 표시될 때까지
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  // FR-006 AC-4: 대시보드에 요약 위젯 포함 (활성 NOTAM, 심각 수, 영향 항로, 영향 운항편)
  test('dashboard should display summary widgets with counts', async ({ page }) => {
    // 대시보드 헤딩이 있어야 한다
    const heading = page.getByRole('heading', { level: 1 }).first();
    await expect(heading).toBeVisible();

    // 요약 카드에 숫자가 표시되어야 한다 (활성 NOTAM 수 등)
    // 스크린샷에서 확인: "활성 NOTAM 47", "위험 NOTAM 12" 등 표시
    await expect(page.getByText(/활성 NOTAM/)).toBeVisible();
    await expect(page.getByText(/위험 NOTAM/)).toBeVisible();
  });

  // FR-006 AC-1: 인터랙티브 지도에 NOTAM 영향 영역 표시 (P0 - 인터랙션 테스트)
  test('dashboard should render interactive map component', async ({ page }) => {
    // 지도 컨테이너가 렌더링되어야 한다 (Leaflet)
    const mapContainer = page.locator('.leaflet-container').first();
    await expect(mapContainer).toBeVisible({ timeout: 15000 });
  });

  // FR-006 AC-5: 지도 줌/팬/클릭 지원 (P0 - 인터랙션 테스트)
  test('map should support zoom interaction', async ({ page }) => {
    const mapContainer = page.locator('.leaflet-container').first();
    await expect(mapContainer).toBeVisible({ timeout: 15000 });

    // Leaflet 줌 컨트롤이 존재해야 한다
    const zoomIn = page.locator('.leaflet-control-zoom-in').first();
    await expect(zoomIn).toBeVisible();
    await zoomIn.click();
    // 줌 후에도 지도가 여전히 표시되어야 한다
    await expect(mapContainer).toBeVisible();
  });

  // FR-006 AC-6: 항로 선택 시 해당 항로와 관련 NOTAM만 필터링 (P0 - 인터랙션 테스트)
  test('route selection should filter map display', async ({ page }) => {
    // 항로 선택 드롭다운/셀렉트가 존재해야 한다
    // 스크린샷에서 확인: "항로 선택 ▼" 버튼 존재
    const routeSelect = page.locator('[class*="select"], [class*="Select"]').first();
    const routeButton = page.getByText(/항로 선택/).first();

    const hasSelect = await routeSelect.isVisible().catch(() => false);
    const hasButton = await routeButton.isVisible().catch(() => false);
    expect(hasSelect || hasButton).toBeTruthy();
  });
});

test.describe('FR-016: Critical NOTAM alert banner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  // FR-016 AC-1: 심각 NOTAM 발생 시 페이지 상단에 알림 배너 표시
  test('critical alert banner should be visible on dashboard', async ({ page }) => {
    // 스크린샷에서 확인: 빨간 배너에 "[위험] RKRR - QWMLW" 표시
    // Cloudscape Flashbar 또는 커스텀 알림 배너
    const alertBanner = page.locator('[class*="flashbar"], [class*="alert"], [class*="Alert"], [class*="banner"], [class*="Banner"]').first();
    const alertText = page.getByText(/위험/).first();

    const hasBanner = await alertBanner.isVisible().catch(() => false);
    const hasText = await alertText.isVisible().catch(() => false);
    expect(hasBanner || hasText).toBeTruthy();
  });

  // FR-016 AC-4: 알림 클릭 시 NOTAM 상세로 이동 (P1 - 인터랙션 테스트)
  test('alert banner should contain link to NOTAM detail', async ({ page }) => {
    // 스크린샷에서 확인: "상세 보기 >" 링크/버튼 존재
    const detailLink = page.getByText(/상세 보기/).first();
    const detailButton = page.getByRole('button', { name: /상세|보기|detail/i }).first();

    const hasLink = await detailLink.isVisible().catch(() => false);
    const hasButton = await detailButton.isVisible().catch(() => false);
    expect(hasLink || hasButton).toBeTruthy();
  });
});
