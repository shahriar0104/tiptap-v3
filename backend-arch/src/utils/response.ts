import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

export const sendSuccess = <T>(
  res: Response<ApiResponse<T>>,
  data: T,
  message?: string,
  statusCode = 200
): Response<ApiResponse<T>> => {
  const payload: ApiResponse<T> = {
    success: true,
    data,
  };
  if (message !== undefined) {
    payload.message = message;
  }
  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response<ApiResponse<unknown>>,
  error: string,
  statusCode = 500
): Response<ApiResponse<unknown>> => {
  const payload: ApiResponse<unknown> = {
    success: false,
    error,
  };
  return res.status(statusCode).json(payload);
};

export const sendPaginatedResponse = <T>(
  res: Response<ApiResponse<PaginatedResponse<T>>>,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response<ApiResponse<PaginatedResponse<T>>> => {
  const totalPages = Math.ceil(total / limit);

  const payload: ApiResponse<PaginatedResponse<T>> = {
    success: true,
    data: {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    },
  };
  if (message !== undefined) {
    payload.message = message;
  }
  return res.status(200).json(payload);
};
