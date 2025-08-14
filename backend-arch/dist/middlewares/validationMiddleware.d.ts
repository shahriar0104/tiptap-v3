import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export declare const validateRequest: (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validationMiddleware.d.ts.map