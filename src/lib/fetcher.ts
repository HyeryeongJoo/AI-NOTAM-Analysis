/**
 * SWR용 공용 fetcher 함수
 *
 * 모든 SWR 훅에서 공유하는 JSON fetcher.
 */

/**
 * SWR용 기본 JSON fetcher
 *
 * @param url - API 엔드포인트 URL
 * @returns JSON 응답 데이터
 */
export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    throw error;
  }
  return response.json() as Promise<T>;
}
