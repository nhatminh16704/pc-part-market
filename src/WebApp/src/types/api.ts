export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  traceId?: string;
  data: T;
  errors?: string[];
}

export interface PaginatedItems<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}
