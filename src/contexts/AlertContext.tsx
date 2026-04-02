/**
 * Critical NOTAM 알림 컨텍스트
 *
 * 미확인 critical NOTAM 알림을 추적하고 sessionStorage에 영속화한다.
 *
 * @requirements FR-016
 */

'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Notam } from '@/types/notam';

interface AlertContextValue {
  criticalAlerts: Notam[];
  acknowledgedIds: Set<string>;
  setCriticalAlerts: (alerts: Notam[]) => void;
  acknowledgeAlert: (notamId: string) => void;
  getUnacknowledgedAlerts: () => Notam[];
}

const STORAGE_KEY = 'notam-acknowledged-alerts';

const AlertContext = createContext<AlertContextValue>({
  criticalAlerts: [],
  acknowledgedIds: new Set(),
  setCriticalAlerts: () => {},
  acknowledgeAlert: () => {},
  getUnacknowledgedAlerts: () => [],
});

/**
 * 알림 컨텍스트 프로바이더
 *
 * @param props - children을 포함하는 props
 * @param props.children - 자식 컴포넌트
 * @returns 알림 컨텍스트 프로바이더
 */
export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [criticalAlerts, setCriticalAlerts] = useState<Notam[]>([]);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(() => {
    // sessionStorage에서 확인된 알림 복원 (lazy initializer)
    if (typeof window === 'undefined') return new Set<string>();
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        return new Set(JSON.parse(stored) as string[]);
      }
    } catch {
      // sessionStorage 접근 실패 시 무시
    }
    return new Set<string>();
  });

  const acknowledgeAlert = useCallback((notamId: string) => {
    setAcknowledgedIds((prev) => {
      const next = new Set(prev);
      next.add(notamId);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // sessionStorage 저장 실패 시 무시
      }
      return next;
    });

    // 감사 로그 기록
    fetch('/api/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'dispatcher-001',
        action: 'acknowledge-alert',
        targetType: 'notam',
        targetId: notamId,
        details: 'Critical NOTAM 알림 확인',
      }),
    }).catch(() => {
      // 감사 로그 실패 시 무시 (비동기)
    });
  }, []);

  const getUnacknowledgedAlerts = useCallback(() => {
    return criticalAlerts.filter((alert) => !acknowledgedIds.has(alert.id));
  }, [criticalAlerts, acknowledgedIds]);

  const value = useMemo(
    () => ({ criticalAlerts, acknowledgedIds, setCriticalAlerts, acknowledgeAlert, getUnacknowledgedAlerts }),
    [criticalAlerts, acknowledgedIds, setCriticalAlerts, acknowledgeAlert, getUnacknowledgedAlerts],
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

/**
 * 알림 컨텍스트를 사용한다
 *
 * @returns 알림 컨텍스트 값
 */
export function useAlert() {
  return useContext(AlertContext);
}
