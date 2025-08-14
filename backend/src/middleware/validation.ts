import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler.js';
import { BoardMeetingStatus, AgendaItemStatus, CreateBoardMeetingRequest, CreateAgendaItemRequest, UpdateBoardMeetingRequest } from '../types/index.js';

// Extend Request interface to include validatedData
interface ValidatedRequest extends Request {
  validatedData?: {
    boardMeetingData?: {
      title: string;
      description?: string | null;
      status: BoardMeetingStatus;
      meetingDate?: Date | null;
    };
    agendaItems?: Array<{
      title: string;
      description?: string | null;
      status: AgendaItemStatus;
      order: number;
    }>;
    [key: string]: unknown;
  };
}

/**
 * Validate board meeting creation data
 */
export const validateBoardMeeting = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { boardMeetingData, agendaItems } = req.body as {
      boardMeetingData?: CreateBoardMeetingRequest;
      agendaItems?: CreateAgendaItemRequest[];
    };

    // Validate board meeting data
    if (!boardMeetingData) {
      throw new ApiError('Board meeting data is required', 400);
    }

    if (!boardMeetingData.title || boardMeetingData.title.trim().length === 0) {
      throw new ApiError('Board meeting title is required', 400);
    }

    if (boardMeetingData.title.length > 255) {
      throw new ApiError('Board meeting title must be less than 255 characters', 400);
    }

    if (boardMeetingData.description && boardMeetingData.description.length > 1000) {
      throw new ApiError('Board meeting description must be less than 1000 characters', 400);
    }

    // Validate meeting date if provided
    if (boardMeetingData.meetingDate) {
      const meetingDate = new Date(boardMeetingData.meetingDate);
      if (isNaN(meetingDate.getTime())) {
        throw new ApiError('Invalid meeting date format', 400);
      }
    }

    // Validate status if provided
    const validStatuses = Object.values(BoardMeetingStatus);
    if (boardMeetingData.status && !validStatuses.includes(boardMeetingData.status)) {
      throw new ApiError('Invalid board meeting status', 400);
    }

    // Validate agenda items if provided
    if (agendaItems && Array.isArray(agendaItems)) {
      for (let i = 0; i < agendaItems.length; i++) {
        const item = agendaItems[i];
        
        if (!item || !item.title || item.title.trim().length === 0) {
          throw new ApiError(`Agenda item ${i + 1}: title is required`, 400);
        }

        if (item && item.title.length > 255) {
          throw new ApiError(`Agenda item ${i + 1}: title must be less than 255 characters`, 400);
        }

        // Validate status if provided
        const validItemStatuses = Object.values(AgendaItemStatus);
        if (item && item.status && !validItemStatuses.includes(item.status)) {
          throw new ApiError(`Agenda item ${i + 1}: invalid status`, 400);
        }

        // Validate order if provided
        if (item && item.order !== undefined && (typeof item.order !== 'number' || item.order < 0)) {
          throw new ApiError(`Agenda item ${i + 1}: order must be a non-negative number`, 400);
        }

        // Validate startTime
        if (!item || !item.startTime || typeof item.startTime !== 'string') {
          throw new ApiError(`Agenda item ${i + 1}: startTime is required`, 400);
        }
      }
    }

    // Store validated data
    (req as ValidatedRequest).validatedData = {
      boardMeetingData: {
        title: boardMeetingData.title.trim(),
        description: boardMeetingData.description?.trim() || null,
        status: boardMeetingData.status || BoardMeetingStatus.DRAFT,
        meetingDate: boardMeetingData.meetingDate ? new Date(boardMeetingData.meetingDate) : null,
      },
      agendaItems: (agendaItems || []).map(item => ({
        title: item?.title || '',
        status: item?.status || AgendaItemStatus.PENDING,
        order: item?.order || 0,
      })),
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate agenda item data
 */
export const validateAgendaItem = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { agendaItems } = req.body as { agendaItems?: CreateAgendaItemRequest[] };

    if (!agendaItems || !Array.isArray(agendaItems) || agendaItems.length === 0) {
      throw new ApiError('Agenda items array is required', 400);
    }

    for (let i = 0; i < agendaItems.length; i++) {
      const item = agendaItems[i];
      
      if (!item || !item.title || item.title.trim().length === 0) {
        throw new ApiError(`Agenda item ${i + 1}: title is required`, 400);
      }

      if (item && item.title.length > 255) {
        throw new ApiError(`Agenda item ${i + 1}: title must be less than 255 characters`, 400);
      }

      // Validate status if provided
      const validStatuses = Object.values(AgendaItemStatus);
      if (item && item.status && !validStatuses.includes(item.status)) {
        throw new ApiError(`Agenda item ${i + 1}: invalid status`, 400);
      }

      // Validate order if provided
      if (item && item.order !== undefined && (typeof item.order !== 'number' || item.order < 0)) {
        throw new ApiError(`Agenda item ${i + 1}: order must be a non-negative number`, 400);
      }

      // Validate startTime
      if (!item || !item.startTime || typeof item.startTime !== 'string') {
        throw new ApiError(`Agenda item ${i + 1}: startTime is required`, 400);
      }
    }

    // Store validated data
    (req as ValidatedRequest).validatedData = {
      agendaItems: agendaItems.map(item => ({
        title: item.title.trim(),
        status: item.status || AgendaItemStatus.PENDING,
        order: item.order || 0,
        startTime: item.startTime,
      })),
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate board meeting update data
 */
export const validateUpdateBoardMeeting = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const updateData = req.body as UpdateBoardMeetingRequest;

    // At least one field must be provided for update
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new ApiError('At least one field is required for update', 400);
    }

    // Validate title if provided
    if (updateData.title !== undefined) {
      if (!updateData.title || updateData.title.trim().length === 0) {
        throw new ApiError('Board meeting title cannot be empty', 400);
      }
      if (updateData.title.length > 255) {
        throw new ApiError('Board meeting title must be less than 255 characters', 400);
      }
    }

    // Validate description if provided
    if (updateData.description !== undefined && updateData.description && updateData.description.length > 1000) {
      throw new ApiError('Board meeting description must be less than 1000 characters', 400);
    }

    // Validate meeting date if provided
    if (updateData.meetingDate !== undefined && updateData.meetingDate) {
      const meetingDate = new Date(updateData.meetingDate);
      if (isNaN(meetingDate.getTime())) {
        throw new ApiError('Invalid meeting date format', 400);
      }
    }

    // Validate status if provided
    const validStatuses = Object.values(BoardMeetingStatus);
    if (updateData.status && !validStatuses.includes(updateData.status)) {
      throw new ApiError('Invalid board meeting status', 400);
    }

    // Store validated data
    const validatedData: Record<string, unknown> = {};
    if (updateData.title !== undefined) {
      validatedData['title'] = updateData.title.trim();
    }
    if (updateData.description !== undefined) {
      validatedData['description'] = updateData.description?.trim() || null;
    }
    if (updateData.status !== undefined) {
      validatedData['status'] = updateData.status;
    }
    if (updateData.meetingDate !== undefined) {
      validatedData['meetingDate'] = updateData.meetingDate ? new Date(updateData.meetingDate) : null;
    }

    (req as ValidatedRequest).validatedData = validatedData;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate ID parameter
 */
export const validateId = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length === 0) {
      throw new ApiError('ID parameter is required', 400);
    }

    // Basic CUID validation (starts with 'c' and has reasonable length)
    if (!/^c[a-z0-9]{24}$/.test(id)) {
      throw new ApiError('Invalid ID format', 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};
