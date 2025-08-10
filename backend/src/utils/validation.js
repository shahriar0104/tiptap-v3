import { z } from 'zod';
import { config } from '../config/app.js';

// Base validation schemas
export const agendaItemSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(config.validation.maxTitleLength, `Title must be less than ${config.validation.maxTitleLength} characters`),
  description: z.string()
    .max(config.validation.maxDescriptionLength, `Description must be less than ${config.validation.maxDescriptionLength} characters`)
    .optional(),
  order: z.number()
    .int('Order must be an integer')
    .min(1, 'Order must be at least 1'),
  duration: z.number()
    .int('Duration must be an integer')
    .min(1, 'Duration must be at least 1 minute')
    .max(480, 'Duration cannot exceed 8 hours (480 minutes)')
    .optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED'])
    .default('PENDING')
    .optional(),
});

export const boardMeetingSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(config.validation.maxTitleLength, `Title must be less than ${config.validation.maxTitleLength} characters`),
  description: z.string()
    .max(config.validation.maxDescriptionLength, `Description must be less than ${config.validation.maxDescriptionLength} characters`)
    .optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'APPROVED', 'REJECTED'])
    .default('DRAFT')
    .optional(),
  meetingDate: z.string()
    .datetime('Meeting date must be a valid ISO datetime')
    .optional(),
  agendaItems: z.array(agendaItemSchema)
    .max(config.validation.maxAgendaItems, `Cannot have more than ${config.validation.maxAgendaItems} agenda items`)
    .optional(),
  authorId: z.string()
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
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'APPROVED', 'REJECTED'])
    .default('DRAFT')
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
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'APPROVED', 'REJECTED'])
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
  description: z.string()
    .max(config.validation.maxDescriptionLength, `Description must be less than ${config.validation.maxDescriptionLength} characters`)
    .optional(),
  order: z.number()
    .int('Order must be an integer')
    .min(1, 'Order must be at least 1')
    .optional(),
  duration: z.number()
    .int('Duration must be an integer')
    .min(1, 'Duration must be at least 1 minute')
    .max(480, 'Duration cannot exceed 8 hours (480 minutes)')
    .optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED'])
    .optional(),
});

// ID validation schema
export const idSchema = z.object({
  id: z.string()
    .min(1, 'ID is required')
    .regex(/^[a-zA-Z0-9]+$/, 'ID must contain only alphanumeric characters'),
});

// Validation middleware factory
export const createValidationMiddleware = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }
      
      return res.status(500).json({
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
export const validateId = createValidationMiddleware(idSchema); 