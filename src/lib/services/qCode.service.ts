/**
 * Q-Code 파싱 및 분류 서비스
 *
 * ICAO Q-Line 파싱, Q-Code 참조 테이블 기반 초기 분류.
 *
 * @requirements FR-002
 */

import * as qCodeRepository from '@/lib/db/qCode.repository';
import type { ImportanceLevel } from '@/types/notam';

/** Q-Line 파싱 결과 */
interface ParsedQLine {
  fir: string;
  qCode: string;
  subject: string;
  condition: string;
  trafficType: string;
  purpose: string;
  scope: string;
  lowerLimit: string;
  upperLimit: string;
  coordinates: { latitude: number; longitude: number };
  radius: number;
}

/**
 * ICAO Q-Line 문자열을 파싱한다.
 *
 * @param qLine - Q) 뒤의 문자열 (예: RKRR/QMRLC/IV/NBO/A/000/999/3728N12626E005)
 * @returns 파싱된 Q-Line 필드
 */
export function parseQLine(qLine: string): ParsedQLine {
  const parts = qLine.split('/');

  const fir = parts[0] ?? '';
  const qCode = parts[1] ?? '';
  const trafficType = parts[2] ?? '';
  const purpose = parts[3] ?? '';
  const scope = parts[4] ?? '';
  const lowerLimit = parts[5] ?? '000';
  const upperLimit = parts[6] ?? '999';
  const coordStr = parts[7] ?? '';

  // 좌표 파싱: 4자리 N/S + 5자리 E/W + 3자리 반경
  let latitude = 0;
  let longitude = 0;
  let radius = 0;

  const coordMatch = coordStr.match(/(\d{4})(N|S)(\d{5})(E|W)(\d{3})/);
  if (coordMatch) {
    latitude = parseInt(coordMatch[1], 10) / 100;
    if (coordMatch[2] === 'S') latitude = -latitude;
    longitude = parseInt(coordMatch[3], 10) / 100;
    if (coordMatch[4] === 'W') longitude = -longitude;
    radius = parseInt(coordMatch[5], 10);
  }

  // Q-Code에서 subject/condition 추출
  const classification = classifyByQCode(qCode);

  return {
    fir,
    qCode,
    subject: classification.subject,
    condition: classification.condition,
    trafficType,
    purpose,
    scope,
    lowerLimit,
    upperLimit,
    coordinates: { latitude, longitude },
    radius,
  };
}

/**
 * Q-Code 참조 테이블에서 분류 정보를 조회한다.
 *
 * @param qCode - 5글자 Q-Code
 * @returns 분류 정보 (subject, condition, 기본 중요도, 설명)
 */
export function classifyByQCode(qCode: string): {
  subject: string;
  condition: string;
  defaultImportance: ImportanceLevel;
  description: string;
  descriptionKo: string;
} {
  const entry = qCodeRepository.findByCode(qCode);

  if (entry) {
    return {
      subject: entry.subject,
      condition: entry.condition,
      defaultImportance: entry.defaultImportance,
      description: entry.description,
      descriptionKo: entry.descriptionKo,
    };
  }

  // 알 수 없는 Q-Code의 경우 기본값 반환
  return {
    subject: 'Unknown',
    condition: 'Unknown',
    defaultImportance: 'medium',
    description: `Unknown Q-Code: ${qCode}`,
    descriptionKo: `알 수 없는 Q-Code: ${qCode}`,
  };
}
