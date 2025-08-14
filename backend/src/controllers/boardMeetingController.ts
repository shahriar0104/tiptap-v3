import { Request, Response, NextFunction } from 'express';
import boardMeetingService from '../services/boardMeetingService.js';
import { AuthenticatedRequest, ApiResponse, CreateBoardMeetingRequest, CreateAgendaItemRequest } from '../types/index.js';

// Extend Request interface to include validatedData
interface ValidatedRequest extends AuthenticatedRequest {
  validatedData?: {
    boardMeetingData?: CreateBoardMeetingRequest & {
      meetingDate?: Date | null;
    };
    agendaItems?: CreateAgendaItemRequest[];
    [key: string]: unknown;
  };
}

class BoardMeetingController {
  /**
   * Create a new board meeting with agenda items
   */
  async createBoardMeeting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedReq = req as ValidatedRequest;
      // Use validated data from validation middleware
      const { boardMeetingData, agendaItems } = validatedReq.validatedData || validatedReq.body;
      const userId = validatedReq.user?.id;
      const organizationId = validatedReq.user?.organizationId;

      // Ensure a user is authenticated and has an organization
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'User must belong to an organization to create board meetings',
        });
        return;
      }
      
      const boardMeeting = await boardMeetingService.createBoardMeetingWithAgendaItems(
        boardMeetingData,
        agendaItems,
        userId!,
        organizationId!
      );

      const response: ApiResponse = {
        success: true,
        message: boardMeeting.message,
        data: boardMeeting.data,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Controller error - createBoardMeeting:', error);
      next(error);
    }
  }

  /**
   * Get a board meeting by ID
   */
  async getBoardMeeting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const organizationId = authReq.user?.organizationId;

      if (!organizationId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await boardMeetingService.getBoardMeetingById(id!);
      
      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result.data,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Controller error - getBoardMeeting:', error);
      next(error);
    }
  }

  /**
   * Get all board meetings for user's organization
   */
  async getAllBoardMeetings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const organizationId = authReq.user?.organizationId;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'User must belong to an organization',
        });
        return;
      }

      const boardMeetings = await boardMeetingService.getAllBoardMeetings(organizationId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Board meetings retrieved successfully',
        data: boardMeetings.data,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Controller error - getAllBoardMeetings:', error);
      next(error);
    }
  }

  /**
   * Update a board meeting
   */
  async updateBoardMeeting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedReq = req as ValidatedRequest;
      const { id } = validatedReq.params;
      const updateData = validatedReq.validatedData || validatedReq.body;
      const organizationId = validatedReq.user?.organizationId;

      if (!organizationId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await boardMeetingService.updateBoardMeeting(id!, updateData, organizationId!);
      
      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result.data,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Controller error - updateBoardMeeting:', error);
      next(error);
    }
  }

  /**
   * Delete a board meeting
   */
  async deleteBoardMeeting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id } = authReq.params;
      const organizationId = authReq.user?.organizationId;

      if (!organizationId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await boardMeetingService.deleteBoardMeeting(id!, organizationId!);
      
      const response: ApiResponse = {
        success: true,
        message: 'Board meeting deleted successfully',
        data: result.data,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Controller error - deleteBoardMeeting:', error);
      next(error);
    }
  }

  /**
   * Add agenda items to a board meeting
   */
  async addAgendaItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedReq = req as ValidatedRequest;
      const { id } = validatedReq.params;
      const { agendaItems } = validatedReq.validatedData || validatedReq.body;
      const userId = validatedReq.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await boardMeetingService.addAgendaItems(id!, agendaItems, userId!);
      
      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result.data,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Controller error - addAgendaItems:', error);
      next(error);
    }
  }

  /**
   * Update agenda item
   */
  async updateAgendaItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { boardMeetingId, agendaItemId } = authReq.params;
      const updateData = authReq.body;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await boardMeetingService.updateAgendaItem(
        boardMeetingId!,
        agendaItemId!,
        updateData,
        userId!
      );
      
      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result.data,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Controller error - updateAgendaItem:', error);
      next(error);
    }
  }

  /**
   * Delete agenda item
   */
  async deleteAgendaItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { boardMeetingId, agendaItemId } = authReq.params;
      const organizationId = authReq.user?.organizationId;

      if (!organizationId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await boardMeetingService.deleteAgendaItem(
        boardMeetingId!,
        agendaItemId!,
        organizationId!
      );
      
      const response: ApiResponse = {
        success: true,
        message: result.message,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Controller error - deleteAgendaItem:', error);
      next(error);
    }
  }
}

export default new BoardMeetingController();
