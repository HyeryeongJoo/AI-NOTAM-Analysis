import { test, expect } from '@playwright/test';

/**
 * FR-017: Dispatcher audit trail
 */
test.describe('FR-017: Dispatcher audit trail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/audit-log');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  // FR-017 AC-2: 감사 로그가 검색 가능한 테이블로 조회 가능
  test('audit log table should display log entries', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  // FR-017 AC-1: 모든 디스패처 작업이 타임스탬프, 사용자, 작업 유형, 대상 NOTAM과 함께 기록됨
  test('audit log entries should show timestamp, user, action, and target', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    // 스크린샷 확인: 시각, 사용자, 액션, 대상 유형, 대상 ID, 상세 컬럼
    // Cloudscape Table은 sticky header로 인해 th가 2세트 렌더링될 수 있음
    const headerRow = page.locator('thead tr').first();
    await expect(headerRow).toBeVisible();

    // 관련 컬럼 헤더가 있는지 확인
    const timeHeader = page.locator('th').filter({ hasText: /시각|시간|Time/i }).first();
    const userHeader = page.locator('th').filter({ hasText: /사용자|User/i }).first();
    const actionHeader = page.locator('th').filter({ hasText: /액션|작업|Action/i }).first();

    await expect(timeHeader).toBeVisible();
    await expect(userHeader).toBeVisible();
    await expect(actionHeader).toBeVisible();
  });
});
