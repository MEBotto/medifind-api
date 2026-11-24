import { Response } from 'express';
import { ApiResponse, ApiError } from '@/types/api.types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  meta?: ApiResponse['meta'],
  code?: string
): Response => res.status(200).json({
  status: 'success',
  data,
  ...(message && { message }),
  ...(meta && { meta }),
  ...(code && { code }),
} as ApiResponse<T>);

export const sendCreated = <T>(
  res: Response,
  data: T,
  message?: string,
  code?: string
): Response => res.status(201).json({
  status: 'success',
  data,
  ...(message && { message }),
  ...(code && { code }),
} as ApiResponse<T>);

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: ApiError['errors'],
  code?: string
): Response => res.status(statusCode).json({
  status: 'error',
  message,
  ...(errors && { errors }),
  ...(code && { code }),
} as ApiError);
