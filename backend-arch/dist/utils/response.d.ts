import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number) => Response<ApiResponse<T>>;
export declare const sendError: (res: Response, error: string, statusCode?: number) => Response<ApiResponse>;
export declare const sendPaginatedResponse: <T>(res: Response, data: T[], page: number, limit: number, total: number, message?: string) => Response<ApiResponse<PaginatedResponse<T>>>;
//# sourceMappingURL=response.d.ts.map