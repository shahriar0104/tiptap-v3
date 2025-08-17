import { Request, Response, NextFunction } from 'express';
import type { AgendaItemDocumentService } from '../services/agendaItemDocumentService';
import type { CreateAgendaItemDocumentData, AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/response';

export class AgendaItemDocumentController {
  constructor(private service: AgendaItemDocumentService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const data = req.body as CreateAgendaItemDocumentData;
      const doc = await this.service.create(data, user.organizationId ?? undefined);
      sendSuccess(res, doc, 'Agenda item document created', 201);
    } catch (error) {
      next(error);
    }
  };

  listByAgendaItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { agendaItemId } = req.params as { agendaItemId: string };
      const docs = await this.service.listByAgendaItem(
        agendaItemId,
        user.organizationId ?? undefined
      );
      sendSuccess(res, docs, 'Agenda item documents retrieved');
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params as { id: string };
      const doc = await this.service.getById(id, user.organizationId ?? undefined);
      sendSuccess(res, doc, 'Agenda item document retrieved');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params as { id: string };
      await this.service.delete(id, user.organizationId ?? undefined);
      sendSuccess(res, null, 'Agenda item document deleted');
    } catch (error) {
      next(error);
    }
  };
}
