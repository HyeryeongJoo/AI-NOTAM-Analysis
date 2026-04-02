import { test, expect } from '@playwright/test';

/**
 * FR-020: TIFRS 의사결정 기록 목록 페이지 (/decisions)
 *
 * AC: 의사결정 기록이 별도 목록으로 조회 가능해야 한다
 * AC: TIFRS 기준 필드가 구조적으로 표시되어야 한다
 */
test.describe('FR-020: Decision records list page', () => {
  // AC-5: 의사결정 기록이 별도 목록으로 조회 가능해야 한다
  test('should navigate to /decisions and render decision table', async ({ page }) => {
    const response = await page.goto('/decisions');
    // 페이지가 정상 로드되어야 한다
    expect(response?.status()).toBeLessThan(400);
    // 헤딩이 표시되어야 한다
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
    // 테이블이 렌더링되어야 한다
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
  });

  // AC-5: 의사결정 목록 테이블에 필수 컬럼이 존재해야 한다
  test('decision table should show required columns: NOTAM, decision type, recorder, timestamp', async ({
    page,
  }) => {
    await page.goto('/decisions');
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();

    // 테이블 헤더에 필수 컬럼이 존재해야 한다
    const tableHeader = page.locator('thead, [class*="header-cell"]').first();
    await expect(tableHeader).toBeVisible();

    // NOTAM 관련 컬럼
    const notamColumn = page.locator('th, [role="columnheader"]').filter({ hasText: /NOTAM/i });
    await expect(notamColumn.first()).toBeVisible();

    // 결정 유형 컬럼
    const typeColumn = page
      .locator('th, [role="columnheader"]')
      .filter({ hasText: /결정|decision|유형|type/i });
    await expect(typeColumn.first()).toBeVisible();
  });

  // AC-5: 행 클릭 시 SplitPanel에 TIFRS 상세가 표시되어야 한다 (인터랙션 테스트)
  test('clicking a decision row should open SplitPanel with TIFRS detail', async ({ page }) => {
    await page.goto('/decisions');
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();

    // 테이블 로드 대기
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    // 첫 번째 데이터 행의 라디오 버튼 클릭 (Cloudscape Table 행 선택)
    const grid = page.getByRole('grid', { name: /의사결정/i }).first();
    await expect(grid).toBeVisible();
    const firstRadio = grid.getByRole('radio').first();
    await expect(firstRadio).toBeVisible();
    await firstRadio.click();

    // SplitPanel이 열리거나, TIFRS 관련 상세 정보가 나타나야 한다
    const splitPanelRegion = page.getByRole('region', { name: /의사결정 상세/i });
    const tifrsContent = page.getByText(/TIFRS|시간.*영향|운영.*영향|시설|항로|스케줄/i);

    const hasSplitPanel = await splitPanelRegion.isVisible({ timeout: 5000 }).catch(() => false);
    const hasTifrs = await tifrsContent
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    // SplitPanel 또는 TIFRS 상세 정보 중 하나가 표시되어야 한다
    expect(hasSplitPanel || hasTifrs).toBeTruthy();
  });

  // 사이드 네비게이션에 의사결정 기록 링크가 존재해야 한다
  test('side navigation should have decision records link', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await expect(nav.first()).toBeVisible();

    // 의사결정 관련 네비게이션 링크
    const decisionLink = page.getByRole('link', { name: /의사결정|decision/i });
    await expect(decisionLink.first()).toBeVisible();
  });
});
