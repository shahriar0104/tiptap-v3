import { z } from 'zod';

export const createBoardMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    description: z.string().max(1000, 'Description too long').optional(),
    scheduledAt: z.string().datetime('Invalid date format'),
    duration: z.number().int().positive('Duration must be positive').optional(),
    location: z.string().max(255, 'Location too long').optional(),
    organizationId: z.string().uuid('Invalid organization ID'),
  }),
});

export const updateBoardMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    scheduledAt: z.string().datetime('Invalid date format').optional(),
    duration: z.number().int().positive('Duration must be positive').optional(),
    location: z.string().max(255, 'Location too long').optional(),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid meeting ID'),
  }),
});

export const getBoardMeetingSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid meeting ID'),
  }),
});

export const getBoardMeetingsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    organizationId: z.string().uuid('Invalid organization ID').optional(),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  }),
});

export type CreateBoardMeetingInput = z.infer<typeof createBoardMeetingSchema>['body'];
export type UpdateBoardMeetingInput = z.infer<typeof updateBoardMeetingSchema>['body'];
export type GetBoardMeetingParams = z.infer<typeof getBoardMeetingSchema>['params'];
export type GetBoardMeetingsQuery = z.infer<typeof getBoardMeetingsSchema>['query'];
