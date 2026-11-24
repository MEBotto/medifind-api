export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  code?: string;
  data?: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: number | string | boolean | null | undefined;
  };
}

export interface ApiError {
  status: 'error';
  code?: string;
  message: string;
  errors?: Array<{ path: string; message: string }>;
}
