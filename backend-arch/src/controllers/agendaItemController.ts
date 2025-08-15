import { Request, Response, NextFunction } from 'express';
import type { AgendaItemService } from '../services/agendaItemService';
import { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/response';
import { 
  CreateAgendaItemInput, 
  UpdateAgendaItemInput, 
  GetAgendaItemParams 
} from '../validators/agenda';

export class AgendaItemController {
  constructor(private agendaItemService: AgendaItemService) {}

  createAgendaItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const data = req.body as CreateAgendaItemInput;

      const agendaItem = await this.agendaItemService.createAgendaItem(
        data,
        user.organizationId || undefined
      );
      sendSuccess(res, agendaItem, 'Agenda item created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getAgendaItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params as GetAgendaItemParams;

      const agendaItem = await this.agendaItemService.getAgendaItemById(id, user.organizationId || undefined);
      sendSuccess(res, agendaItem, 'Agenda item retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getAgendaItemsByGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { agendaGroupId } = req.params as { agendaGroupId: string };

      const agendaItems = await this.agendaItemService.getAgendaItemsByGroup(
        agendaGroupId,
        user.organizationId || undefined
      );
      sendSuccess(res, agendaItems, 'Agenda items retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getAgendaItemsByBoardMeeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { boardMeetingId } = req.params as { boardMeetingId: string };

      const agendaItems = await this.agendaItemService.getAgendaItemsByBoardMeeting(
        boardMeetingId,
        user.organizationId || undefined
      );
      sendSuccess(res, agendaItems, 'Agenda items retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  updateAgendaItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params as GetAgendaItemParams;
      const data = req.body as UpdateAgendaItemInput;

      const agendaItem = await this.agendaItemService.updateAgendaItem(
        id,
        data,
        user.organizationId || undefined
      );
      sendSuccess(res, agendaItem, 'Agenda item updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteAgendaItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params as GetAgendaItemParams;

      await this.agendaItemService.deleteAgendaItem(id, user.organizationId || undefined);
      sendSuccess(res, null, 'Agenda item deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  updateAgendaItemStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params as GetAgendaItemParams;
      const { status } = req.body as { status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' };

      const agendaItem = await this.agendaItemService.updateAgendaItemStatus(
        id,
        status,
        user.organizationId || undefined
      );
      sendSuccess(res, agendaItem, 'Agenda item status updated successfully');
    } catch (error) {
      next(error);
    }
  };

  reorderAgendaItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { agendaGroupId } = req.params as { agendaGroupId: string };
      const { itemOrders } = req.body as { itemOrders: Array<{ id: string; order: number }> };

      await this.agendaItemService.reorderAgendaItems(
        agendaGroupId,
        itemOrders,
        user.organizationId || undefined
      );
      sendSuccess(res, null, 'Agenda items reordered successfully');
    } catch (error) {
      next(error);
    }
  };
}
