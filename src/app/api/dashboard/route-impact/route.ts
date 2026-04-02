/**
 * 대시보드 항로 영향 API
 *
 * 대시보드 요약 + 항로별 NOTAM 영향 지도 데이터.
 *
 * @requirements FR-006
 */

import { NextResponse } from 'next/server';
import * as flightRepo from '@/lib/db/flight.repository';
import * as impactRepo from '@/lib/db/impact.repository';
import * as notamRepo from '@/lib/db/notam.repository';
import * as routeRepo from '@/lib/db/route.repository';
import type { DashboardSummary, RouteImpactMapData } from '@/types/dashboard';
import type { Notam } from '@/types/notam';
import type { NextRequest } from 'next/server';

/**
 * 대시보드 데이터를 반환한다.
 *
 * @param request - HTTP 요청
 * @returns 요약 카드 + 항로별 영향 지도 + critical NOTAM
 */
export async function GET(request: NextRequest) {
  const routeIdFilter = request.nextUrl.searchParams.get('routeId') ?? undefined;

  // 통계
  const stats = notamRepo.getStats();
  const allFlights = flightRepo.findAll({ page: 1, pageSize: 1000 });
  const affectedFlightsCount = allFlights.items.filter((f) => f.notamImpactCount > 0).length;

  // 영향받는 항로 수 계산
  const allRoutes = routeRepo.findAll({ page: 1, pageSize: 100 });
  let routes = allRoutes.items;
  if (routeIdFilter) {
    routes = routes.filter((r) => r.id === routeIdFilter);
  }

  const routeImpactMapData: RouteImpactMapData[] = [];
  let affectedRoutesCount = 0;

  for (const route of routes) {
    const impacts = impactRepo.findRouteImpactsByRoute(route.id);
    if (impacts.length > 0) {
      affectedRoutesCount++;
      const notamIds = [...new Set(impacts.map((i) => i.notamId))];
      const notams = notamIds
        .map((nid) => notamRepo.findById(nid))
        .filter((n): n is Notam => n !== undefined);

      routeImpactMapData.push({ route, impacts, notams });
    }
  }

  // 필터링 비율
  const activeCount = stats.total - stats.byStatus.expired - stats.byStatus.cancelled;
  const filteredVsTotalRatio = stats.total > 0 ? activeCount / stats.total : 0;

  const summary: DashboardSummary = {
    totalActiveNotams: activeCount,
    criticalCount: stats.bySeverity.critical,
    highCount: stats.bySeverity.high,
    affectedRoutesCount,
    affectedFlightsCount,
    filteredVsTotalRatio,
  };

  // critical NOTAM 목록
  const criticalNotams = notamRepo
    .findAlerts()
    .filter((n) => n.importanceLevel === 'critical' || n.importanceLevel === 'high');

  return NextResponse.json({ summary, routeImpacts: routeImpactMapData, criticalNotams });
}
