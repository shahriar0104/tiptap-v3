import { Request, Response, NextFunction } from 'express';
import type { BoardMeetingService } from '../services/boardMeetingService';
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

      // Convert string date to Date object if provided
      const meetingData = {
        ...data,
        meetingDate: data.meetingDate ? new Date(data.meetingDate) : undefined,
      };

      const meeting = await this.boardMeetingService.createBoardMeeting(meetingData, user.id);
      sendSuccess(res, meeting, 'Board meeting created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getBoardMeeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as GetBoardMeetingParams;

      const meeting = await this.boardMeetingService.getBoardMeetingById(id);
      sendSuccess(res, meeting, 'Board meeting retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getBoardMeetings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as GetBoardMeetingsQuery;

      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 10;

      const result = await this.boardMeetingService.getBoardMeetings(
        query.organizationId,
        query.status,
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
      const { id } = req.params as GetBoardMeetingParams;
      const data = req.body as UpdateBoardMeetingInput;

      // Convert string date to Date object if provided
      const updateData = {
        ...data,
        meetingDate: data.meetingDate ? new Date(data.meetingDate) : undefined,
      };

      const meeting = await this.boardMeetingService.updateBoardMeeting(
        id,
        updateData
      );
      sendSuccess(res, meeting, 'Board meeting updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteBoardMeeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as GetBoardMeetingParams;

      await this.boardMeetingService.deleteBoardMeeting(id);
      sendSuccess(res, null, 'Board meeting deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  updateMeetingStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as GetBoardMeetingParams;
      const { status } = req.body as { status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' };

      const meeting = await this.boardMeetingService.updateMeetingStatus(
        id,
        status
      );
      sendSuccess(res, meeting, 'Meeting status updated successfully');
    } catch (error) {
      next(error);
    }
  };

  getOrganizationMeetings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { organizationId } = req.params;

      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      const meetings = await this.boardMeetingService.getBoardMeetingsByOrganization(organizationId);
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
