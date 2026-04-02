/**
 * 클라이언트 프로바이더 래퍼
 *
 * Server Component인 RootLayout에서 클라이언트 컨텍스트를 감싸기 위한 래퍼.
 * AuthContext > AlertContext > NotificationContext 순서로 중첩한다.
 */

'use client';

import { AlertProvider } from '@/contexts/AlertContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

/**
 * 전역 컨텍스트 프로바이더 래퍼
 *
 * @param props - children을 포함하는 props
 * @param props.children - 자식 컴포넌트
 * @returns 중첩된 프로바이더 트리
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AlertProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </AlertProvider>
    </AuthProvider>
  );
}
