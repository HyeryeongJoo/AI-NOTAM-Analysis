/**
 * 공통 타입 정의
 *
 * API 응답의 페이지네이션 및 에러 공통 형식.
 */

/** 페이지네이션 응답 공통 제네릭 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

/** API 에러 응답 공통 형식 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
