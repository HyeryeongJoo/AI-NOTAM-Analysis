/**
 * Mock 인증 컨텍스트
 *
 * 프로토타입용 목 인증 — 기본적으로 자동 로그인된다.
 */

'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Dispatcher } from '@/types/auth';

interface AuthContextValue {
  user: Dispatcher | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'notam-auth-user';

/** 기본 운항관리사 (프로토타입 자동 로그인용) */
const DEFAULT_USER: Dispatcher = {
  id: 'dispatcher-001',
  name: '김운항관리사',
  employeeId: 'EMP-7C-001',
  role: 'dispatcher',
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

/**
 * 인증 컨텍스트 프로바이더
 *
 * @param props - children을 포함하는 props
 * @param props.children - 자식 컴포넌트
 * @returns 인증 컨텍스트 프로바이더
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Dispatcher | null>(() => {
    // localStorage에서 복원하거나 기본 사용자로 자동 로그인 (lazy initializer)
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as Dispatcher;
      }
      // 프로토타입: 기본 사용자로 자동 로그인
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('로그인 실패');
    const data = (await res.json()) as Dispatcher;
    setUser(data);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * 인증 컨텍스트를 사용한다
 *
 * @returns 인증 컨텍스트 값
 */
export function useAuth() {
  return useContext(AuthContext);
}
