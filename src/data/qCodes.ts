/**
 * Q-Code 시드 데이터
 *
 * ICAO Q-Code 참조 테이블. 25개 주요 Q-Code와 한국어 설명, 기본 중요도 등급.
 */

import type { QCode } from '@/types/qCode';

/** 시드 Q-Code 데이터 (25개) */
export const SEED_Q_CODES: QCode[] = [
  { code: 'QMRLC', subject: 'Runway', condition: 'Closed', description: 'Runway closed', descriptionKo: '활주로 폐쇄', defaultImportance: 'critical' },
  { code: 'QMALC', subject: 'Aerodrome', condition: 'Closed', description: 'Aerodrome closed', descriptionKo: '비행장 폐쇄', defaultImportance: 'critical' },
  { code: 'QFALC', subject: 'Airspace', condition: 'Closed', description: 'Airspace closed/restricted', descriptionKo: '공역 폐쇄/제한', defaultImportance: 'critical' },
  { code: 'QFALT', subject: 'Airspace', condition: 'Restricted', description: 'Airspace restricted temporarily', descriptionKo: '공역 일시 제한', defaultImportance: 'high' },
  { code: 'QNVAS', subject: 'VOR', condition: 'Unserviceable', description: 'VOR unserviceable', descriptionKo: 'VOR 사용 불가', defaultImportance: 'high' },
  { code: 'QICAS', subject: 'ILS', condition: 'Unserviceable', description: 'ILS unserviceable', descriptionKo: 'ILS 사용 불가', defaultImportance: 'high' },
  { code: 'QNDAS', subject: 'NDB', condition: 'Unserviceable', description: 'NDB unserviceable', descriptionKo: 'NDB 사용 불가', defaultImportance: 'high' },
  { code: 'QMXLC', subject: 'Taxiway', condition: 'Closed', description: 'Taxiway closed', descriptionKo: '유도로 폐쇄', defaultImportance: 'medium' },
  { code: 'QMAXX', subject: 'Aerodrome', condition: 'General', description: 'Aerodrome general information', descriptionKo: '비행장 일반 정보', defaultImportance: 'medium' },
  { code: 'QMAHW', subject: 'Aerodrome', condition: 'Work in Progress', description: 'Construction work on movement area', descriptionKo: '이동 지역 공사 중', defaultImportance: 'medium' },
  { code: 'QLLAS', subject: 'Lighting', condition: 'Unserviceable', description: 'Approach lighting unserviceable', descriptionKo: '접근등 사용 불가', defaultImportance: 'medium' },
  { code: 'QLLCS', subject: 'Lighting', condition: 'Changed', description: 'Runway lighting changed', descriptionKo: '활주로 조명 변경', defaultImportance: 'medium' },
  { code: 'QWMLW', subject: 'Weapons', condition: 'Firing', description: 'Missile/weapons firing', descriptionKo: '미사일/사격 훈련', defaultImportance: 'high' },
  { code: 'QPICH', subject: 'Procedure', condition: 'Changed', description: 'Instrument procedure changed', descriptionKo: '계기 절차 변경', defaultImportance: 'medium' },
  { code: 'QPIXX', subject: 'Procedure', condition: 'General', description: 'Instrument approach procedure info', descriptionKo: '계기접근절차 정보', defaultImportance: 'low' },
  { code: 'QOBCE', subject: 'Obstacle', condition: 'Erected', description: 'Obstacle erected', descriptionKo: '장애물 설치', defaultImportance: 'medium' },
  { code: 'QOELC', subject: 'Obstacle Light', condition: 'Unserviceable', description: 'Obstacle light unserviceable', descriptionKo: '장애물 등화 사용 불가', defaultImportance: 'low' },
  { code: 'QSAAS', subject: 'ATIS', condition: 'Unserviceable', description: 'ATIS unserviceable', descriptionKo: 'ATIS 사용 불가', defaultImportance: 'low' },
  { code: 'QSCAS', subject: 'Radar', condition: 'Unserviceable', description: 'Radar unserviceable', descriptionKo: '레이더 사용 불가', defaultImportance: 'high' },
  { code: 'QSPAS', subject: 'Radar', condition: 'Approach', description: 'Approach radar unserviceable', descriptionKo: '접근 레이더 사용 불가', defaultImportance: 'high' },
  { code: 'QRDCA', subject: 'Danger Area', condition: 'Active', description: 'Danger area active', descriptionKo: '위험 구역 활성화', defaultImportance: 'high' },
  { code: 'QRRCA', subject: 'Restricted Area', condition: 'Active', description: 'Restricted area active', descriptionKo: '제한 구역 활성화', defaultImportance: 'high' },
  { code: 'QMRXX', subject: 'Runway', condition: 'General', description: 'Runway general information', descriptionKo: '활주로 일반 정보', defaultImportance: 'low' },
  { code: 'QSTAH', subject: 'ATC', condition: 'Hours Changed', description: 'ATC operating hours changed', descriptionKo: 'ATC 운영 시간 변경', defaultImportance: 'medium' },
  { code: 'QKKKK', subject: 'General', condition: 'Information', description: 'General NOTAM information', descriptionKo: '일반 NOTAM 정보', defaultImportance: 'routine' },
];
