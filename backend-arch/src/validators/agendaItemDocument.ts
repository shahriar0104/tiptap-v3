import { z } from 'zod';

export const createAgendaItemDocumentSchema = z.object({
  body: z.object({
    agendaItemId: z.string().uuid('Invalid agenda item ID'),
    uploadId: z.string().uuid('Invalid upload ID'),
    role: z.enum(['CONTEXT', 'FIGURE', 'APPENDIX']).optional(),
  }),
});

export const getAgendaItemDocumentsByItemParamsSchema = z.object({
  params: z.object({
    agendaItemId: z.string().uuid('Invalid agenda item ID'),
  }),
});

export const getAgendaItemDocumentParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid agenda item document ID'),
  }),
});

export type CreateAgendaItemDocumentInput = z.infer<
  typeof createAgendaItemDocumentSchema
>['body'];
export type GetAgendaItemDocumentsByItemParams = z.infer<
  typeof getAgendaItemDocumentsByItemParamsSchema
>['params'];
export type GetAgendaItemDocumentParams = z.infer<
  typeof getAgendaItemDocumentParamsSchema
>['params'];
