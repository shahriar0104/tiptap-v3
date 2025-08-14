import { Request, Response, NextFunction } from 'express';
import { BoardMeetingService } from '../services/boardMeetingService';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendPaginatedResponse } from '../utils/response';
import { 
  CreateBoardMeetingInput, 
  UpdateBoardMeetingInput, 
  GetBoardMeetingParams,
  GetBoardMeetingsQuery 
} from '../validators/boardMeeting';

export class BoardMeetingController {
  constructor(private boardMeetingService: BoardMeetingService) {}

  createBoardMeeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const data = req.body as CreateBoardMeetingInput;

      // Convert string date to Date object
      const meetingData = {
        ...data,
        scheduledAt: new Date(data.scheduledAt),
      };

      const meeting = await this.boardMeetingService.createBoardMeeting(meetingData, user.id);
      sendSuccess(res, meeting, 'Board meeting created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getBoardMeeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params as GetBoardMeetingParams;

      const meeting = await this.boardMeetingService.getBoardMeetingById(id, user.organizationId || undefined);
      sendSuccess(res, meeting, 'Board meeting retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getBoardMeetings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const query = req.query as GetBoardMeetingsQuery;

      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 10;
      const organizationId = query.organizationId || user.organizationId;
      const status = query.status;

      const result = await this.boardMeetingService.getBoardMeetings(
        organizationId || undefined,
        status,
        page,
        limit
      );

      sendPaginatedResponse(
        res,
        result.data,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Board meetings retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  updateBoardMeeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params as GetBoardMeetingParams;
      const data = req.body as UpdateBoardMeetingInput;

      // Convert string date to Date object if provided
      const updateData = {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      };

      const meeting = await this.boardMeetingService.updateBoardMeeting(
        id,
        updateData,
        user.organizationId || undefined
      );
      sendSuccess(res, meeting, 'Board meeting updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteBoardMeeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params as GetBoardMeetingParams;

      await this.boardMeetingService.deleteBoardMeeting(id, user.organizationId || undefined);
      sendSuccess(res, null, 'Board meeting deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  updateMeetingStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params as GetBoardMeetingParams;
      const { status } = req.body as { status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' };

      const meeting = await this.boardMeetingService.updateMeetingStatus(
        id,
        status,
        user.organizationId || undefined
      );
      sendSuccess(res, meeting, 'Meeting status updated successfully');
    } catch (error) {
      next(error);
    }
  };

  getOrganizationMeetings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;

      if (!user.organizationId) {
        throw new Error('User is not part of an organization');
      }

      const meetings = await this.boardMeetingService.getBoardMeetingsByOrganization(user.organizationId);
      sendSuccess(res, meetings, 'Organization meetings retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  createOrganizationWithBoardMeeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      
      const result = await this.boardMeetingService.createOrganizationWithBoardMeeting(data);
      sendSuccess(res, result, 'Organization and board meeting created successfully', 201);
    } catch (error) {
      next(error);
    }
  };
}
