import { z } from 'zod';

// Agenda Group Validators
export const createAgendaGroupSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    description: z.string().max(1000, 'Description too long').optional(),
    order: z.number().int().min(0, 'Order must be non-negative'),
    startTime: z.coerce.date(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    boardMeetingId: z.string().uuid('Invalid board meeting ID'),
  }),
});

export const updateAgendaGroupSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(255, 'Title too long')
      .optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    order: z.number().int().min(0, 'Order must be non-negative').optional(),
    startTime: z.coerce.date().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid agenda group ID'),
  }),
});

export const getAgendaGroupSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid agenda group ID'),
  }),
});

// Create Agenda Group with Items (bulk) Validator
const itemTypeEnum = z.enum([
  // Support both legacy and new values to be backward compatible
  'STANDARD',
  'DECISION',
  'INFO',
  'ACTION',
  'APPROVE',
  'NOTING',
]);

export const createAgendaGroupWithItemsSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    description: z.string().max(1000, 'Description too long').optional(),
    order: z.number().int().min(0, 'Order must be non-negative'),
    startTime: z.coerce.date(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    boardMeetingId: z.string().uuid('Invalid board meeting ID'),
    items: z
      .array(
        z.object({
          title: z
            .string()
            .min(1, 'Item title is required')
            .max(255, 'Item title too long'),
          description: z.string().max(1000, 'Description too long').optional(),
          order: z.number().int().min(0, 'Order must be non-negative'),
          duration: z
            .number()
            .int()
            .positive('Duration must be positive')
            .optional(),
          type: itemTypeEnum.optional(),
          startTime: z.coerce.date(),
        })
      )
      .default([]),
  }),
});

// Agenda Item Validators
export const createAgendaItemSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    description: z.string().max(1000, 'Description too long').optional(),
    order: z.number().int().min(0, 'Order must be non-negative'),
    duration: z.number().int().positive('Duration must be positive').optional(),
    type: z.enum(['STANDARD', 'DECISION', 'INFO']).optional(),
    startTime: z.coerce.date(),
    agendaGroupId: z.string().uuid('Invalid agenda group ID'),
  }),
});

export const updateAgendaItemSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(255, 'Title too long')
      .optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    order: z.number().int().min(0, 'Order must be non-negative').optional(),
    duration: z.number().int().positive('Duration must be positive').optional(),
    type: z.enum(['STANDARD', 'DECISION', 'INFO']).optional(),
    startTime: z.coerce.date().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid agenda item ID'),
  }),
});

export const getAgendaItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid agenda item ID'),
  }),
});

export type CreateAgendaGroupInput = z.infer<
  typeof createAgendaGroupSchema
>['body'];
export type UpdateAgendaGroupInput = z.infer<
  typeof updateAgendaGroupSchema
>['body'];
export type GetAgendaGroupParams = z.infer<
  typeof getAgendaGroupSchema
>['params'];

export type CreateAgendaItemInput = z.infer<
  typeof createAgendaItemSchema
>['body'];
export type UpdateAgendaItemInput = z.infer<
  typeof updateAgendaItemSchema
>['body'];
export type GetAgendaItemParams = z.infer<typeof getAgendaItemSchema>['params'];

export type CreateAgendaGroupWithItemsInput = z.infer<
  typeof createAgendaGroupWithItemsSchema
>['body'];
