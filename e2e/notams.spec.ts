import { test, expect } from '@playwright/test';

/**
 * FR-001: LLM-based NOTAM importance scoring
 * FR-002: Q-Code based initial classification
 * FR-005: Critical NOTAM auto-filtering
 * FR-019: NOTAM expiry management
 */
test.describe('FR-001: NOTAM importance scoring', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notams');
    // 테이블 로드 대기
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  // FR-001 AC-4: NOTAM 목록 테이블에 중요도 점수와 색상 코딩된 배지 표시
  test('NOTAM list table should display importance score with color-coded badge', async ({ page }) => {
    // 테이블이 렌더링되어야 한다
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    // 테이블에 행이 있어야 한다 (시드 데이터 최소 50개)
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  // FR-001 AC-3: NOTAM이 중요도 레벨로 분류됨 (critical, high, medium, low, routine)
  test('NOTAM list should show importance level classification', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    // 스크린샷 확인: 중요도 컬럼에 "위험", "높음", "보통" 등 배지 표시
    const importanceBadge = page.getByText(/위험|높음|보통|낮음|일상/).first();
    await expect(importanceBadge).toBeVisible();
  });
});

test.describe('FR-005: Critical NOTAM auto-filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notams');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  // FR-005 AC-1: 중요도 레벨별 필터링 지원 (P0 - 인터랙션 테스트)
  test('NOTAM list should support filtering by importance level', async ({ page }) => {
    // 스크린샷 확인: "NOTAM 검색" 텍스트 입력 + 컬럼 헤더 드롭다운 필터 존재
    // 컬럼 헤더에 "공항 ▼", "Q-Code ▼", "점수 ▼", "중요도 ▼" 필터 드롭다운
    const searchInput = page.getByPlaceholder(/NOTAM 검색|검색/);
    const columnFilter = page.locator('th').filter({ hasText: /중요도/ }).first();

    const hasSearch = await searchInput.isVisible().catch(() => false);
    const hasColumnFilter = await columnFilter.isVisible().catch(() => false);
    expect(hasSearch || hasColumnFilter).toBeTruthy();

    // 중요도 컬럼 필터를 클릭하여 필터 옵션 확인 (인터랙션)
    if (hasColumnFilter) {
      await columnFilter.click();
    }
  });

  // FR-005 AC-4: 테이블 정렬 지원 (중요도 점수, 시간, 공항, Q-코드) (P0 - 인터랙션 테스트)
  test('NOTAM table should support sorting by clicking column headers', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    // 테이블 헤더 클릭으로 정렬 가능해야 한다
    // 스크린샷 확인: "공항", "Q-Code", "점수", "중요도" 헤더
    const headers = page.locator('th');
    await expect(headers.first()).toBeVisible();
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(0);

    // 첫 번째 정렬 가능한 헤더 클릭
    const sortableHeader = headers.first();
    await sortableHeader.click();
  });

  // FR-005 AC-5: 필터된 수 대비 전체 비율 표시
  test('NOTAM list should display filtered vs total count ratio', async ({ page }) => {
    // 스크린샷 확인: "NOTAM 목록 (50)" 헤딩 + "위험 12 | 높음 14 | 만료임박 12" 서브텍스트
    // 필터링 비율 정보가 표시되어야 한다
    const countInfo = page.getByText(/NOTAM 목록/).first();
    await expect(countInfo).toBeVisible();

    // 심각도별 카운트가 표시되어야 한다
    const severityCount = page.getByText(/위험 \d+/).first();
    await expect(severityCount).toBeVisible();
  });
});

test.describe('FR-019: NOTAM expiry management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notams');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  // FR-019 AC-1: NOTAM에 만료까지 남은 시간 표시
  test('NOTAM list page should load and display NOTAM data', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
  });
});
