/**
 * 전역 알림 컨텍스트
 *
 * Flashbar 기반의 전역 알림 메시지를 관리한다.
 * AppLayout의 notifications 슬롯에서 렌더링된다.
 */

'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { FlashbarProps } from '@cloudscape-design/components/flashbar';

interface NotificationContextValue {
  notifications: FlashbarProps.MessageDefinition[];
  addNotification: (notification: FlashbarProps.MessageDefinition) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {},
});

/**
 * 알림 컨텍스트 프로바이더
 *
 * @param props - children을 포함하는 props
 * @param props.children - 자식 컴포넌트
 * @returns 알림 컨텍스트 프로바이더
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<FlashbarProps.MessageDefinition[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification: FlashbarProps.MessageDefinition) => {
      const id = notification.id ?? `notif-${Date.now()}`;
      const item: FlashbarProps.MessageDefinition = {
        ...notification,
        id,
        dismissible: true,
        onDismiss: () => removeNotification(id),
      };
      setNotifications((prev) => [...prev, item]);

      // success 알림은 5초 후 자동 제거
      if (notification.type === 'success') {
        setTimeout(() => removeNotification(id), 5000);
      }
    },
    [removeNotification],
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo(
    () => ({ notifications, addNotification, removeNotification, clearNotifications }),
    [notifications, addNotification, removeNotification, clearNotifications],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

/**
 * 알림 컨텍스트를 사용한다
 *
 * @returns 알림 컨텍스트 값
 */
export function useNotification() {
  return useContext(NotificationContext);
}
