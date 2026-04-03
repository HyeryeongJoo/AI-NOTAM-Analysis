/**
 * 대시보드 데이터 서비스
 *
 * 대시보드 요약, 항로 영향 지도, 긴급 NOTAM 데이터를 조회한다.
 * API 라우트와 서버 컴포넌트 양쪽에서 공유한다.
 *
 * @requirements FR-006, FR-005, FR-016
 */

import * as flightRepo from '@/lib/db/flight.repository';
import * as impactRepo from '@/lib/db/impact.repository';
import * as notamRepo from '@/lib/db/notam.repository';
import * as routeRepo from '@/lib/db/route.repository';
import type { DashboardSummary, RouteImpactMapData } from '@/types/dashboard';
import type { Flight } from '@/types/flight';
import type { Notam } from '@/types/notam';

/** 대시보드 API 응답 타입 */
export interface DashboardData {
  summary: DashboardSummary;
  routeImpacts: RouteImpactMapData[];
  criticalNotams: Notam[];
  affectedFlights: Flight[];
}

/**
 * 대시보드 데이터를 조회한다
 *
 * @param routeIdFilter - 선택적 항로 필터
 * @returns 대시보드 전체 데이터
 */
export function getDashboardData(routeIdFilter?: string): DashboardData {
  /* 통계 */
  const stats = notamRepo.getStats();
  const allFlights = flightRepo.findAll({ page: 1, pageSize: 1000 });
  const affectedFlightsCount = allFlights.items.filter((f) => f.notamImpactCount > 0).length;

  /* 영향받는 항로 수 계산 */
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

  /* 필터링 비율 */
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

  /* critical NOTAM 목록 */
  const criticalNotams = notamRepo
    .findAlerts()
    .filter((n) => n.importanceLevel === 'critical' || n.importanceLevel === 'high');

  /* 영향받는 운항편 목록 */
  const affectedFlights = allFlights.items.filter((f) => f.notamImpactCount > 0);

  return { summary, routeImpacts: routeImpactMapData, criticalNotams, affectedFlights };
}
