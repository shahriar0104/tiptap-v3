import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/app.js';
import { BoardMeetingStatus, AgendaItemStatus } from '@prisma/client';

// Extend Request interface to include validatedData
interface ValidatedRequest extends Request {
  validatedData?: unknown;
}

// Base validation schemas
export const agendaItemSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(config.validation.maxTitleLength, `Title must be less than ${config.validation.maxTitleLength} characters`),
  order: z.number()
    .int('Order must be an integer')
    .min(0, 'Order must be at least 0'),
  startTime: z.string()
    .min(1, 'Start time is required'),
  status: z.nativeEnum(AgendaItemStatus)
    .default(AgendaItemStatus.PENDING)
    .optional(),
});

export const boardMeetingSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(config.validation.maxTitleLength, `Title must be less than ${config.validation.maxTitleLength} characters`),
  description: z.string()
    .max(config.validation.maxDescriptionLength, `Description must be less than ${config.validation.maxDescriptionLength} characters`)
    .optional(),
  status: z.nativeEnum(BoardMeetingStatus)
    .default(BoardMeetingStatus.DRAFT)
    .optional(),
  meetingDate: z.string()
    .datetime('Meeting date must be a valid ISO datetime')
    .optional(),
  agendaItems: z.array(agendaItemSchema)
    .max(config.validation.maxAgendaItems, `Cannot have more than ${config.validation.maxAgendaItems} agenda items`)
    .optional(),
  userId: z.string()
    .min(1, 'Author ID is required')
    .optional(), // Optional for now, will be set from auth middleware
});

// Validation for creating board meeting with agenda items
export const createBoardMeetingSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(config.validation.maxTitleLength, `Title must be less than ${config.validation.maxTitleLength} characters`),
  description: z.string()
    .max(config.validation.maxDescriptionLength, `Description must be less than ${config.validation.maxDescriptionLength} characters`)
    .optional(),
  status: z.nativeEnum(BoardMeetingStatus)
    .default(BoardMeetingStatus.DRAFT)
    .optional(),
  meetingDate: z.string()
    .datetime('Meeting date must be a valid ISO datetime')
    .optional(),
  agendaItems: z.array(agendaItemSchema)
    .min(1, 'At least one agenda item is required')
    .max(config.validation.maxAgendaItems, `Cannot have more than ${config.validation.maxAgendaItems} agenda items`),
});

// Validation for updating board meeting
export const updateBoardMeetingSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(config.validation.maxTitleLength, `Title must be less than ${config.validation.maxTitleLength} characters`)
    .optional(),
  description: z.string()
    .max(config.validation.maxDescriptionLength, `Description must be less than ${config.validation.maxDescriptionLength} characters`)
    .optional(),
  status: z.nativeEnum(BoardMeetingStatus)
    .optional(),
  meetingDate: z.string()
    .datetime('Meeting date must be a valid ISO datetime')
    .optional(),
});

// Validation for updating agenda item
export const updateAgendaItemSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(config.validation.maxTitleLength, `Title must be less than ${config.validation.maxTitleLength} characters`)
    .optional(),
  order: z.number()
    .int('Order must be an integer')
    .min(0, 'Order must be at least 0')
    .optional(),
  startTime: z.string()
    .min(1, 'Start time is required')
    .optional(),
  status: z.nativeEnum(AgendaItemStatus)
    .optional(),
});

// ID validation schema
export const idSchema = z.object({
  id: z.string()
    .min(1, 'ID is required')
    .regex(/^c[a-z0-9]{24}$/, 'ID must be a valid CUID'),
});

// Validation middleware factory
export const createValidationMiddleware = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      (req as ValidatedRequest).validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal validation error',
      });
    }
  };
};

// Export validation middleware for common use cases
export const validateCreateBoardMeeting = createValidationMiddleware(createBoardMeetingSchema);
export const validateUpdateBoardMeeting = createValidationMiddleware(updateBoardMeetingSchema);
export const validateUpdateAgendaItem = createValidationMiddleware(updateAgendaItemSchema);
