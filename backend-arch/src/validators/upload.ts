import { z } from 'zod';

export const createUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().url('Valid file URL is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
});

export const updateUploadSchema = z.object({
  fileName: z.string().min(1, 'File name cannot be empty').optional(),
  fileUrl: z.string().url('Valid file URL is required').optional(),
  mimeType: z.string().min(1, 'MIME type cannot be empty').optional(),
});

export const getUploadParamsSchema = z.object({
  id: z.string().uuid('Valid upload ID is required'),
});

export const getUploadsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a positive number').optional(),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a positive number')
    .optional(),
});

export type CreateUploadInput = z.infer<typeof createUploadSchema>;
export type UpdateUploadInput = z.infer<typeof updateUploadSchema>;
export type GetUploadParams = z.infer<typeof getUploadParamsSchema>;
export type GetUploadsQuery = z.infer<typeof getUploadsQuerySchema>;
