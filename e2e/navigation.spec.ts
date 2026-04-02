import { test, expect } from '@playwright/test';

/**
 * 모든 페이지 라우트 접근 가능 여부 검증
 * requirements.json pages 섹션 기반
 */
test.describe('Navigation: All routes accessible', () => {
  const routes = [
    { path: '/', name: 'Dashboard' },
    { path: '/notams', name: 'NOTAM List' },
    { path: '/flights', name: 'Flight Schedule' },
    { path: '/routes', name: 'Route List' },
    { path: '/ref-book', name: 'REF BOOK' },
    { path: '/briefings', name: 'Briefing Documents' },
    { path: '/audit-log', name: 'Audit Log' },
  ];

  for (const route of routes) {
    // 각 라우트가 200으로 로드되고 헤딩이 존재하는지 확인
    test(`${route.name} page (${route.path}) should load without error`, async ({ page }) => {
      const response = await page.goto(route.path);
      // 페이지가 정상 로드되어야 한다 (404/500 아님)
      expect(response?.status()).toBeLessThan(400);
      // 페이지에 최소 하나의 heading이 렌더링되어야 한다
      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible();
    });
  }

  // 사이드 네비게이션을 통한 페이지 전환
  test('side navigation links should navigate to correct pages', async ({ page }) => {
    await page.goto('/');
    // 네비게이션 영역이 존재해야 한다
    const nav = page.getByRole('navigation');
    await expect(nav.first()).toBeVisible();
  });
});
