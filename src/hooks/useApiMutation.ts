/**
 * API Mutation 공용 훅
 *
 * POST/PUT/DELETE 요청을 위한 공통 mutation 훅.
 * 컴포넌트에서 raw fetch() 대신 이 훅을 사용한다.
 */

'use client';

import { useCallback, useState } from 'react';

interface MutationState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

/**
 * POST/PUT/DELETE 호출용 공통 mutation 훅
 *
 * @param url - API 엔드포인트 URL
 * @param method - HTTP 메서드
 * @returns mutation 상태와 실행 함수
 */
export function useApiMutation<TBody, TResponse>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
) {
  const [state, setState] = useState<MutationState<TResponse>>({
    data: null,
    error: null,
    loading: false,
  });

  const execute = useCallback(
    async (body?: TBody) => {
      setState({ data: null, error: null, loading: true });
      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = (await res.json()) as TResponse;
        setState({ data, error: null, loading: false });
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, error, loading: false });
        throw error;
      }
    },
    [url, method],
  );

  return { ...state, execute };
}
