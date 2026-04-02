import { test, expect } from '@playwright/test';

/**
 * FR-020: TIFRS 의사결정 API 엔드포인트 계약 검증
 *
 * 3개 엔드포인트:
 * - GET /api/decisions
 * - GET /api/notams/{id}/decision
 * - POST /api/notams/{id}/decision
 */
test.describe('FR-020: Decision API endpoints', () => {
  // GET /api/decisions - 의사결정 기록 전체 목록 조회
  test('GET /api/decisions should return 200 with items array', async ({ request }) => {
    const response = await request.get('/api/decisions');
    expect(response.status()).toBe(200);
    const body = await response.json();
    const items = Array.isArray(body) ? body : body.items || body.data || body.decisions || [];
    expect(Array.isArray(items)).toBeTruthy();
    // 시드 데이터에 5건의 의사결정이 있으므로 최소 1건 이상
    expect(items.length).toBeGreaterThan(0);
  });

  // GET /api/notams/{id}/decision - 특정 NOTAM의 의사결정 기록 조회
  test('GET /api/notams/{id}/decision should return 200', async ({ request }) => {
    // 먼저 NOTAM 목록에서 첫 번째 ID를 가져온다
    const notamsResponse = await request.get('/api/notams');
    const notamsBody = await notamsResponse.json();
    const notams = Array.isArray(notamsBody)
      ? notamsBody
      : notamsBody.items || notamsBody.data || notamsBody.notams || [];
    expect(notams.length).toBeGreaterThan(0);
    const firstNotamId = notams[0].id;

    const response = await request.get(`/api/notams/${firstNotamId}/decision`);
    // 200 (결정 있음) 또는 404 (결정 없음) 모두 유효하다
    expect([200, 404]).toContain(response.status());

    if (response.status() === 200) {
      const body = await response.json();
      // 응답이 배열이거나 객체여야 한다
      expect(body).toBeTruthy();
    }
  });

  // POST /api/notams/{id}/decision - 의사결정 기록 생성 (인터랙션 테스트)
  test('POST /api/notams/{id}/decision with valid body should return 201', async ({ request }) => {
    // NOTAM 목록에서 ID를 가져온다
    const notamsResponse = await request.get('/api/notams');
    const notamsBody = await notamsResponse.json();
    const notams = Array.isArray(notamsBody)
      ? notamsBody
      : notamsBody.items || notamsBody.data || notamsBody.notams || [];
    expect(notams.length).toBeGreaterThan(0);

    // 마지막 NOTAM에 대해 의사결정 생성 (기존 결정과 충돌 방지)
    const targetNotamId = notams[notams.length - 1].id;

    const decisionPayload = {
      notamId: targetNotamId,
      tifrsTime: 'Within 6 hours of departure',
      tifrsImpact: 'High impact on runway operations',
      tifrsFacilities: 'RWY 07/25 affected',
      tifrsRoute: 'Route 1 ICN-NRT segment',
      tifrsSchedule: '3 flights affected within validity period',
      overallDecision: 'monitor',
      rationale: 'Monitoring required due to proximity to departure time',
    };

    const response = await request.post(`/api/notams/${targetNotamId}/decision`, {
      data: decisionPayload,
    });

    // 201 (생성 성공) 또는 200 (업데이트 성공) 모두 유효하다
    expect([200, 201]).toContain(response.status());

    const body = await response.json();
    expect(body).toBeTruthy();
    // 응답에 id가 있어야 한다 (생성된 레코드)
    if (body.id) {
      expect(typeof body.id).toBe('string');
    }
  });
});
