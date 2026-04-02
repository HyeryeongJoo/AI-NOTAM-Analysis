/**
 * 대시보드 타입 정의
 *
 * 항로 영향 대시보드의 요약 카드 및 지도 데이터 구조.
 *
 * @requirements FR-006
 */

import type { NotamRouteImpact } from './impact';
import type { Notam } from './notam';
import type { Route } from './route';

/** 대시보드 요약 카드 데이터 */
export interface DashboardSummary {
  totalActiveNotams: number;
  criticalCount: number;
  highCount: number;
  affectedRoutesCount: number;
  affectedFlightsCount: number;
  filteredVsTotalRatio: number;
}

/** 항로별 NOTAM 영향 지도 데이터 */
export interface RouteImpactMapData {
  route: Route;
  impacts: NotamRouteImpact[];
  notams: Notam[];
}
