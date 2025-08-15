import { z } from 'zod';

export const createEditorContentSchema = z.object({
  boardMeetingId: z.string().uuid('Valid board meeting ID is required'),
  contentJson: z.any().refine(val => val !== null && val !== undefined, {
    message: 'Content JSON is required',
  }),
  version: z.number().int().positive().optional(),
});

export const updateEditorContentSchema = z.object({
  contentJson: z.any().optional(),
  version: z.number().int().positive().optional(),
});

export const getEditorContentParamsSchema = z.object({
  id: z.string().uuid('Valid editor content ID is required'),
});

export const getBoardMeetingParamsSchema = z.object({
  boardMeetingId: z.string().uuid('Valid board meeting ID is required'),
});

export const createVersionSchema = z.object({
  contentJson: z.any().refine(val => val !== null && val !== undefined, {
    message: 'Content JSON is required',
  }),
});

export type CreateEditorContentInput = z.infer<
  typeof createEditorContentSchema
>;
export type UpdateEditorContentInput = z.infer<
  typeof updateEditorContentSchema
>;
export type GetEditorContentParams = z.infer<
  typeof getEditorContentParamsSchema
>;
export type GetBoardMeetingParams = z.infer<typeof getBoardMeetingParamsSchema>;
export type CreateVersionInput = z.infer<typeof createVersionSchema>;
