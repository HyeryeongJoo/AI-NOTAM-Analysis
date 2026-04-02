import { test, expect } from '@playwright/test';

/**
 * API 엔드포인트 계약 검증
 * requirements.json의 api_endpoints 기반
 */
test.describe('API route contract verification', () => {
  // GET /api/notams - NOTAM 목록 조회
  test('GET /api/notams should return NOTAM list', async ({ request }) => {
    const response = await request.get('/api/notams');
    expect(response.status()).toBe(200);
    const body = await response.json();
    // 배열이거나 data 프로퍼티에 배열이 있어야 한다
    const items = Array.isArray(body) ? body : (body.items || body.data || body.notams || []);
    expect(Array.isArray(items)).toBeTruthy();
    expect(items.length).toBeGreaterThan(0);
  });

  // GET /api/flights - 운항편 목록 조회
  test('GET /api/flights should return flight list', async ({ request }) => {
    const response = await request.get('/api/flights');
    expect(response.status()).toBe(200);
    const body = await response.json();
    const items = Array.isArray(body) ? body : (body.items || body.data || body.flights || []);
    expect(Array.isArray(items)).toBeTruthy();
    expect(items.length).toBeGreaterThan(0);
  });

  // GET /api/routes - 항로 목록 조회
  test('GET /api/routes should return route list', async ({ request }) => {
    const response = await request.get('/api/routes');
    expect(response.status()).toBe(200);
    const body = await response.json();
    const items = Array.isArray(body) ? body : (body.items || body.data || body.routes || []);
    expect(Array.isArray(items)).toBeTruthy();
    expect(items.length).toBeGreaterThan(0);
  });

  // GET /api/ref-book - REF BOOK 목록 조회
  test('GET /api/ref-book should return REF BOOK entries', async ({ request }) => {
    const response = await request.get('/api/ref-book');
    expect(response.status()).toBe(200);
    const body = await response.json();
    const items = Array.isArray(body) ? body : (body.items || body.data || body.entries || []);
    expect(Array.isArray(items)).toBeTruthy();
  });

  // GET /api/briefings - 브리핑 목록 조회
  test('GET /api/briefings should return briefing list', async ({ request }) => {
    const response = await request.get('/api/briefings');
    expect(response.status()).toBe(200);
    const body = await response.json();
    const items = Array.isArray(body) ? body : (body.items || body.data || body.briefings || []);
    expect(Array.isArray(items)).toBeTruthy();
  });

  // GET /api/audit-log - 감사 로그 조회
  test('GET /api/audit-log should return audit log entries', async ({ request }) => {
    const response = await request.get('/api/audit-log');
    expect(response.status()).toBe(200);
    const body = await response.json();
    const items = Array.isArray(body) ? body : (body.items || body.data || body.logs || []);
    expect(Array.isArray(items)).toBeTruthy();
  });

  // GET /api/q-codes - Q-Code 참조 데이터 조회
  test('GET /api/q-codes should return Q-Code reference data', async ({ request }) => {
    const response = await request.get('/api/q-codes');
    expect(response.status()).toBe(200);
    const body = await response.json();
    const items = Array.isArray(body) ? body : (body.items || body.data || body.qCodes || []);
    expect(Array.isArray(items)).toBeTruthy();
    expect(items.length).toBeGreaterThan(0);
  });

  // GET /api/notams/stats - NOTAM 통계 조회
  test('GET /api/notams/stats should return statistics', async ({ request }) => {
    const response = await request.get('/api/notams/stats');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeTruthy();
  });

  // GET /api/notams/alerts - 심각 NOTAM 알림 조회
  test('GET /api/notams/alerts should return alert data', async ({ request }) => {
    const response = await request.get('/api/notams/alerts');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeTruthy();
  });

  // GET /api/dashboard/route-impact - 대시보드 항로 영향 데이터
  test('GET /api/dashboard/route-impact should return dashboard data', async ({ request }) => {
    const response = await request.get('/api/dashboard/route-impact');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeTruthy();
  });

  // GET /api/matching/results - 매칭 결과
  test('GET /api/matching/results should return matching results', async ({ request }) => {
    const response = await request.get('/api/matching/results');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeTruthy();
  });
});
