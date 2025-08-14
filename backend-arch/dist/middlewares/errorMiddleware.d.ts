import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
export declare const errorHandler: (error: Error, _req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => Response<ApiResponse>;
//# sourceMappingURL=errorMiddleware.d.ts.map