/**
 * NOTAM 일괄 처리 파이프라인 API
 *
 * 전체 활성 NOTAM을 순회하며 추출 → 분석 → 매칭 파이프라인을 실행한다.
 * 데모용 엔드포인트로, 프로덕션에서는 비동기 처리로 전환 필요.
 *
 * @requirements FR-001, FR-003, FR-004
 */

import { NextResponse } from 'next/server';
import * as airportRepo from '@/lib/db/airport.repository';
import * as flightRepo from '@/lib/db/flight.repository';
import * as impactRepo from '@/lib/db/impact.repository';
import * as notamRepo from '@/lib/db/notam.repository';
import { findByCode } from '@/lib/db/qCode.repository';
import * as bedrockService from '@/lib/services/bedrock.service';
import * as matchingService from '@/lib/services/matching.service';
import { classifyByQCode } from '@/lib/services/qCode.service';

/** 개별 NOTAM 처리 결과 */
interface NotamProcessResult {
  notamId: string;
  success: boolean;
  importanceLevel?: string;
  error?: string;
}

/**
 * 전체 NOTAM을 일괄 처리한다.
 *
 * @returns 처리 결과 요약
 */
export async function POST() {
  const allNotams = notamRepo.findAll({ page: 1, pageSize: 1000 });
  const activeNotams = allNotams.items.filter(
    (n) => n.status !== 'expired' && n.status !== 'cancelled',
  );

  const results: NotamProcessResult[] = [];

  for (const notam of activeNotams) {
    try {
      /* Step 1: 필드 추출 */
      try {
        const extracted = await bedrockService.extractNotamFields(notam);
        if (extracted) {
          const updateData: Record<string, unknown> = {};
          if (extracted.latitude !== 0 && extracted.longitude !== 0) {
            updateData.latitude = extracted.latitude;
            updateData.longitude = extracted.longitude;
          }
          if (extracted.radius > 0) updateData.radius = extracted.radius;
          if (extracted.lowerLimit) updateData.lowerLimit = extracted.lowerLimit;
          if (extracted.upperLimit) updateData.upperLimit = extracted.upperLimit;
          if (extracted.effectiveFrom) updateData.effectiveFrom = extracted.effectiveFrom;
          if (extracted.effectiveTo) updateData.effectiveTo = extracted.effectiveTo;
          if (Object.keys(updateData).length > 0) {
            notamRepo.update(notam.id, updateData);
          }
        }
      } catch {
        /* 추출 실패는 무시하고 다음 단계 진행 */
      }

      /* Step 2: 중요도 분석 */
      const updatedNotam = notamRepo.findById(notam.id) ?? notam;
      const qCode = findByCode(updatedNotam.qCode);
      const airport = airportRepo.findByIcao(updatedNotam.locationIndicator);
      const routeImpacts = impactRepo.findRouteImpactsByNotam(notam.id);
      const flightImpacts = impactRepo.findFlightImpactsByNotam(notam.id);
      const flightIds = [...new Set(flightImpacts.map((fi) => fi.flightId))];
      const flights = flightIds.map((fid) => flightRepo.findById(fid)).filter((f) => f !== undefined);

      let importanceLevel = updatedNotam.importanceLevel;

      try {
        const analysis = await bedrockService.analyzeNotamImportance(
          updatedNotam, qCode, airport, flights, routeImpacts,
        );
        notamRepo.update(notam.id, {
          ...analysis,
          status: 'analyzed',
        });
        importanceLevel = analysis.importanceLevel;
      } catch {
        /* AI 실패 시 Q-Code 폴백 */
        const classification = classifyByQCode(updatedNotam.qCode);
        const scoreMap = { critical: 0.9, high: 0.7, medium: 0.5, low: 0.3, routine: 0.1 } as const;
        notamRepo.update(notam.id, {
          importanceScore: scoreMap[classification.defaultImportance],
          importanceLevel: classification.defaultImportance,
          aiSummary: classification.descriptionKo,
          aiAnalysis: `Q-Code 기반 분류: ${classification.descriptionKo}`,
          status: 'analyzed',
        });
        importanceLevel = classification.defaultImportance;
      }

      /* Step 3: 영향 매칭 */
      try {
        matchingService.calculateAllImpacts(notam.id);
      } catch {
        /* 매칭 실패는 무시 */
      }

      results.push({ notamId: notam.id, success: true, importanceLevel });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ notamId: notam.id, success: false, error: msg });
    }
  }

  const successCount = results.filter((r) => r.success).length;

  return NextResponse.json({
    total: activeNotams.length,
    success: successCount,
    failed: activeNotams.length - successCount,
    results,
  });
}
