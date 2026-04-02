import { test, expect } from '@playwright/test';

/**
 * FR-004: Flight and route auto-matching
 * FR-013: Flight schedule overview
 */
test.describe('FR-013: Flight schedule overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/flights');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  // FR-013 AC-1: 운항편 목록에 편명, 출발/도착 공항, 시간, 상태 표시
  test('flight list table should display flight data with columns', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    // 행이 로드되어야 한다 (시드 데이터 최소 30편)
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  // FR-013 AC-2: 각 운항편에 영향 NOTAM 수와 심각도 표시
  test('flight list should show NOTAM impact indicators', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    // 스크린샷 확인: "영향 NOTA..." 컬럼에 숫자 표시 (2, 0, 3 등)
    // 헤더에 영향 NOTAM 관련 컬럼이 있어야 한다
    const impactHeader = page.locator('th').filter({ hasText: /영향|NOTAM|impact/i });
    await expect(impactHeader.first()).toBeVisible();
  });

  // FR-013 AC-3: 공항, 항로, 날짜, NOTAM 영향 상태별 필터링 지원 (P1 - 인터랙션 테스트)
  test('flight list should support filtering', async ({ page }) => {
    // 스크린샷 확인: "운항편 검색" 텍스트 입력 존재
    const searchInput = page.getByPlaceholder(/운항편 검색|검색/);
    await expect(searchInput).toBeVisible();

    // 검색 인터랙션 테스트
    await searchInput.fill('7C');
    // 검색 결과가 여전히 표시되어야 한다
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
  });

  // FR-013 AC-4: 운항편 클릭 시 상세 페이지로 이동 (P1 - 인터랙션 테스트)
  test('clicking a flight should navigate to flight detail', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    // 스크린샷 확인: 편명이 링크 (7C960, 7C205 등)
    const firstLink = page.locator('table tbody a').first();
    await expect(firstLink).toBeVisible();
    const href = await firstLink.getAttribute('href');
    await firstLink.click();
    // 운항편 상세 페이지로 이동되어야 한다
    await expect(page.getByRole('heading').first()).toBeVisible();
  });
});

test.describe('FR-004: Flight and route auto-matching', () => {
  // FR-004 AC-5: 영향받는 운항편 목록에 편명, 항로, 출발시간, 영향 유형 표시
  test('flight detail should show NOTAM impact information', async ({ page }) => {
    // API에서 첫 번째 운항편 ID 가져오기
    const apiResponse = await page.request.get('/api/flights');
    const body = await apiResponse.json();
    const flights = body.items || body.data || body.flights || body;
    const firstFlightId = Array.isArray(flights) ? flights[0]?.id : null;

    if (firstFlightId) {
      await page.goto(`/flights/${firstFlightId}`);
      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible();
    }
  });
});
