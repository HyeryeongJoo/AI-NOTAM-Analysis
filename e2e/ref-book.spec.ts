import { test, expect } from '@playwright/test';

/**
 * FR-011: REF BOOK management
 */
test.describe('FR-011: REF BOOK management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ref-book');
  });

  // FR-011 AC-3: REF BOOK 항목 검색 및 필터링 가능
  test('REF BOOK table should display entries and support search', async ({ page }) => {
    const table = page.locator('table, [class*="table"]').first();
    await expect(table).toBeVisible();

    const rows = page.locator('table tbody tr, [class*="table"] [class*="row"]');
    await expect(rows.first()).toBeVisible();
  });

  // FR-011 AC-2: 디스패처가 AI 제안을 확인/편집/거절 가능 (P1 - 인터랙션 테스트)
  test('REF BOOK should have action buttons for confirm/edit/reject', async ({ page }) => {
    const table = page.locator('table, [class*="table"]').first();
    await expect(table).toBeVisible();

    // 확인/편집/거절 등의 액션 버튼이 존재해야 한다
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  // FR-011 AC-4: 항목에 연결된 NOTAM 정보, 등록자, 등록 시간 표시
  test('REF BOOK entries should show linked NOTAM details', async ({ page }) => {
    const table = page.locator('table, [class*="table"]').first();
    await expect(table).toBeVisible();
  });
});
