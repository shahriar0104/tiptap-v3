import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const validateRequest = (schemas: ValidationSchemas | ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // If it's a single schema, assume it's for the entire request object
      if ('parse' in schemas) {
        (schemas as ZodSchema).parse({
          body: req.body,
          query: req.query,
          params: req.params,
        });
      } else {
        // Validate individual parts
        const { body, params, query } = schemas as ValidationSchemas;
        
        if (body) {
          body.parse(req.body);
        }
        if (params) {
          params.parse(req.params);
        }
        if (query) {
          query.parse(req.query);
        }
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        next(new ValidationError(errorMessages.join(', ')));
      } else {
        next(error);
      }
    }
  };
};
