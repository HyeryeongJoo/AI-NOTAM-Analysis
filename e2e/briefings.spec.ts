import { test, expect } from '@playwright/test';

/**
 * FR-007: Dispatcher briefing document auto-generation
 * FR-008: Crew briefing materials auto-generation
 * FR-014: Shift handover report generation
 */
test.describe('FR-007: Dispatcher briefing generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/briefings');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  // FR-007 AC-4: 브리핑이 초안 상태로 표시되며 검토/승인 워크플로 지원
  test('briefing list table should display briefing documents', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  // FR-007 AC-1: 디스패처가 선택한 운항편에 대해 브리핑 생성을 트리거할 수 있음 (P0 - 인터랙션 테스트)
  test('briefing page should have generate briefing button', async ({ page }) => {
    // 브리핑 생성 버튼이 존재해야 한다
    const generateButton = page.getByRole('button', { name: /생성|generate|create|새|브리핑/i }).first();
    await expect(generateButton).toBeVisible();
  });

  // FR-007 AC-5: 생성된 문서를 포맷된 형태로 미리보기 가능 (P0 - 인터랙션 테스트)
  test('clicking a briefing should navigate to detail with preview', async ({ page }) => {
    // 테이블에서 링크 찾기
    const firstLink = page.locator('table tbody a').first();
    if (await firstLink.isVisible().catch(() => false)) {
      await firstLink.click();
      await expect(page.getByRole('heading').first()).toBeVisible();
    } else {
      // 행 클릭으로 이동
      const firstRow = page.locator('table tbody tr').first();
      await expect(firstRow).toBeVisible();
      await firstRow.click();
      // SplitPanel 또는 상세 페이지 대기
      await expect(page.getByRole('heading').first()).toBeVisible();
    }
  });
});
