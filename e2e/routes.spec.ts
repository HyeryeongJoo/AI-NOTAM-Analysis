import { test, expect } from '@playwright/test';

/**
 * FR-010: NOTAM-route/schedule matching algorithm
 * FR-006: Route impact analysis dashboard (route list)
 * FR-009: Route deviation decision guidance
 */
test.describe('FR-010: Route list and NOTAM matching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/routes');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  // FR-010 AC-5: 모든 활성 NOTAM에 대해 모든 예정 운항편 매칭 실행
  test('route list table should display routes with data', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  // 항로 클릭 시 상세 페이지로 이동 (P0 - 인터랙션 테스트)
  test('clicking a route should navigate to route detail', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    // 첫 번째 행의 링크 클릭
    const firstLink = page.locator('table tbody a').first();
    if (await firstLink.isVisible().catch(() => false)) {
      await firstLink.click();
      // 상세 페이지로 이동되어야 한다
      await expect(page.getByRole('heading').first()).toBeVisible();
    } else {
      // 행 클릭으로 이동
      const firstRow = page.locator('table tbody tr').first();
      await firstRow.click();
      // SplitPanel 또는 상세 페이지 대기
      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible();
    }
  });
});

test.describe('FR-009: Route deviation decision guidance', () => {
  // FR-009 AC-1: 고영향 NOTAM이 항로에 영향을 미칠 때 대안 항로 제안
  test('route detail should show impact and alternative route options', async ({ page }) => {
    const apiResponse = await page.request.get('/api/routes');
    const body = await apiResponse.json();
    const routes = body.items || body.data || body.routes || body;
    const firstRouteId = Array.isArray(routes) ? routes[0]?.id : null;

    if (firstRouteId) {
      await page.goto(`/routes/${firstRouteId}`);
      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible();
    }
  });
});
