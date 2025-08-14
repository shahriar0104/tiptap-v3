import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 500
): Response<ApiResponse> => {
  return res.status(statusCode).json({
    success: false,
    error,
  });
};

export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response<ApiResponse<PaginatedResponse<T>>> => {
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json({
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
    message,
  });
};
