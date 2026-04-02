/**
 * 인메모리 데이터 스토어
 *
 * 모든 시드 데이터를 Map/Array로 보관하는 싱글턴 스토어.
 * DynamoDB로 교체 시 이 파일만 수정하면 된다.
 *
 * @requirements FR-001 ~ FR-019
 */

import { SEED_AIRPORTS } from '@/data/airports';
import { SEED_AUDIT_LOGS } from '@/data/auditLogs';
import { SEED_BRIEFINGS } from '@/data/briefings';
import { SEED_DECISIONS } from '@/data/decisions';
import { SEED_DISPATCHERS } from '@/data/dispatchers';
import { SEED_FLIGHT_IMPACTS } from '@/data/flightImpacts';
import { SEED_FLIGHTS } from '@/data/flights';
import { SEED_NOTAMS } from '@/data/notams';
import { SEED_Q_CODES } from '@/data/qCodes';
import { SEED_REF_BOOK_ENTRIES } from '@/data/refBookEntries';
import { SEED_ROUTE_IMPACTS } from '@/data/routeImpacts';
import { SEED_ROUTES } from '@/data/routes';
import type { Airport } from '@/types/airport';
import type { AuditLog } from '@/types/auditLog';
import type { Dispatcher } from '@/types/auth';
import type { Briefing } from '@/types/briefing';
import type { DecisionRecord } from '@/types/decision';
import type { Flight } from '@/types/flight';
import type { NotamFlightImpact, NotamRouteImpact } from '@/types/impact';
import type { Notam } from '@/types/notam';
import type { QCode } from '@/types/qCode';
import type { RefBookEntry } from '@/types/refBook';
import type { Route } from '@/types/route';

/** 스토어 데이터 구조 */
export interface Store {
  notams: Map<string, Notam>;
  refBookEntries: Map<string, RefBookEntry>;
  flights: Map<string, Flight>;
  routes: Map<string, Route>;
  airports: Map<string, Airport>;
  qCodes: Map<string, QCode>;
  briefings: Map<string, Briefing>;
  auditLogs: AuditLog[];
  routeImpacts: NotamRouteImpact[];
  flightImpacts: NotamFlightImpact[];
  dispatchers: Map<string, Dispatcher>;
  decisions: Map<string, DecisionRecord>;
}

/** 모듈 레벨 싱글턴 인스턴스 */
let storeInstance: Store | null = null;

/**
 * 시드 데이터에서 스토어를 초기화한다.
 *
 * @returns 초기화된 Store 인스턴스
 */
function initializeStore(): Store {
  const notams = new Map<string, Notam>();
  SEED_NOTAMS.forEach((n) => notams.set(n.id, n));

  const refBookEntries = new Map<string, RefBookEntry>();
  SEED_REF_BOOK_ENTRIES.forEach((r) => refBookEntries.set(r.id, r));

  const flights = new Map<string, Flight>();
  SEED_FLIGHTS.forEach((f) => flights.set(f.id, f));

  const routes = new Map<string, Route>();
  SEED_ROUTES.forEach((r) => routes.set(r.id, r));

  const airports = new Map<string, Airport>();
  SEED_AIRPORTS.forEach((a) => airports.set(a.icaoCode, a));

  const qCodes = new Map<string, QCode>();
  SEED_Q_CODES.forEach((q) => qCodes.set(q.code, q));

  const briefings = new Map<string, Briefing>();
  SEED_BRIEFINGS.forEach((b) => briefings.set(b.id, b));

  const dispatchers = new Map<string, Dispatcher>();
  SEED_DISPATCHERS.forEach((d) => dispatchers.set(d.id, d));

  const decisions = new Map<string, DecisionRecord>();
  SEED_DECISIONS.forEach((dec) => decisions.set(dec.id, dec));

  return {
    notams,
    refBookEntries,
    flights,
    routes,
    airports,
    qCodes,
    briefings,
    auditLogs: [...SEED_AUDIT_LOGS],
    routeImpacts: [...SEED_ROUTE_IMPACTS],
    flightImpacts: [...SEED_FLIGHT_IMPACTS],
    dispatchers,
    decisions,
  };
}

/**
 * 싱글턴 스토어 인스턴스를 반환한다.
 * 최초 호출 시 시드 데이터로 초기화.
 *
 * @returns Store 인스턴스
 */
export function getStore(): Store {
  if (!storeInstance) {
    storeInstance = initializeStore();
  }
  return storeInstance;
}
