import { Request, Response, NextFunction } from 'express';
import type { AgendaGroupService } from '../services/agendaGroupService';
import { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/response';
import {
  CreateAgendaGroupInput,
  UpdateAgendaGroupInput,
  GetAgendaGroupParams,
  CreateAgendaGroupWithItemsInput,
} from '../validators/agenda';

export class AgendaGroupController {
  constructor(private agendaGroupService: AgendaGroupService) {}

  createAgendaGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const data = req.body as CreateAgendaGroupInput;

      const agendaGroup = await this.agendaGroupService.createAgendaGroup(
        data,
        user.organizationId || undefined
      );
      sendSuccess(res, agendaGroup, 'Agenda group created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  createAgendaGroupWithItems = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const data = req.body as CreateAgendaGroupWithItemsInput;

      const agendaGroup =
        await this.agendaGroupService.createAgendaGroupWithItems(
          data,
          user.organizationId || undefined
        );
      sendSuccess(
        res,
        agendaGroup,
        'Agenda group with items created successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  getAgendaGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params as GetAgendaGroupParams;

      const agendaGroup = await this.agendaGroupService.getAgendaGroupById(
        id,
        user.organizationId || undefined
      );
      sendSuccess(res, agendaGroup, 'Agenda group retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getAgendaGroupsByBoardMeeting = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { boardMeetingId } = req.params as { boardMeetingId: string };

      const agendaGroups =
        await this.agendaGroupService.getAgendaGroupsByBoardMeetingId(
          boardMeetingId,
          user.organizationId || undefined
        );
      sendSuccess(res, agendaGroups, 'Agenda groups retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  updateAgendaGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params as GetAgendaGroupParams;
      const data = req.body as UpdateAgendaGroupInput;

      const agendaGroup = await this.agendaGroupService.updateAgendaGroup(
        id,
        data,
        user.organizationId || undefined
      );
      sendSuccess(res, agendaGroup, 'Agenda group updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteAgendaGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params as GetAgendaGroupParams;

      await this.agendaGroupService.deleteAgendaGroup(
        id,
        user.organizationId || undefined
      );
      sendSuccess(res, null, 'Agenda group deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  reorderAgendaGroups = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { boardMeetingId } = req.params as { boardMeetingId: string };
      const { groupOrders } = req.body as {
        groupOrders: Array<{ id: string; order: number }>;
      };

      await this.agendaGroupService.reorderAgendaGroups(
        boardMeetingId,
        groupOrders,
        user.organizationId || undefined
      );
      sendSuccess(res, null, 'Agenda groups reordered successfully');
    } catch (error) {
      next(error);
    }
  };
}
