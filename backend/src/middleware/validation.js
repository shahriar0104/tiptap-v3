import { ApiError } from './errorHandler.js';

/**
 * Validate board meeting creation data
 */
export const validateBoardMeeting = (req, res, next) => {
  try {
    const { boardMeetingData, agendaItems } = req.body;

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
    const validStatuses = ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (boardMeetingData.status && !validStatuses.includes(boardMeetingData.status)) {
      throw new ApiError('Invalid board meeting status', 400);
    }

    // Validate agenda items if provided
    if (agendaItems && Array.isArray(agendaItems)) {
      for (let i = 0; i < agendaItems.length; i++) {
        const item = agendaItems[i];
        
        if (!item.title || item.title.trim().length === 0) {
          throw new ApiError(`Agenda item ${i + 1}: title is required`, 400);
        }

        if (item.title.length > 255) {
          throw new ApiError(`Agenda item ${i + 1}: title must be less than 255 characters`, 400);
        }

        if (item.description && item.description.length > 2000) {
          throw new ApiError(`Agenda item ${i + 1}: description must be less than 2000 characters`, 400);
        }

        // Validate status if provided
        const validItemStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED'];
        if (item.status && !validItemStatuses.includes(item.status)) {
          throw new ApiError(`Agenda item ${i + 1}: invalid status`, 400);
        }

        // Validate order if provided
        if (item.order !== undefined && (typeof item.order !== 'number' || item.order < 0)) {
          throw new ApiError(`Agenda item ${i + 1}: order must be a non-negative number`, 400);
        }
      }
    }

    // Store validated data
    req.validatedData = {
      boardMeetingData: {
        title: boardMeetingData.title.trim(),
        description: boardMeetingData.description?.trim() || null,
        status: boardMeetingData.status || 'DRAFT',
        meetingDate: boardMeetingData.meetingDate ? new Date(boardMeetingData.meetingDate) : null,
      },
      agendaItems: agendaItems || [],
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate agenda item data
 */
export const validateAgendaItem = (req, res, next) => {
  try {
    const { agendaItems } = req.body;

    if (!agendaItems || !Array.isArray(agendaItems) || agendaItems.length === 0) {
      throw new ApiError('Agenda items array is required', 400);
    }

    for (let i = 0; i < agendaItems.length; i++) {
      const item = agendaItems[i];
      
      if (!item.title || item.title.trim().length === 0) {
        throw new ApiError(`Agenda item ${i + 1}: title is required`, 400);
      }

      if (item.title.length > 255) {
        throw new ApiError(`Agenda item ${i + 1}: title must be less than 255 characters`, 400);
      }

      if (item.description && item.description.length > 2000) {
        throw new ApiError(`Agenda item ${i + 1}: description must be less than 2000 characters`, 400);
      }

      // Validate status if provided
      const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED'];
      if (item.status && !validStatuses.includes(item.status)) {
        throw new ApiError(`Agenda item ${i + 1}: invalid status`, 400);
      }

      // Validate order if provided
      if (item.order !== undefined && (typeof item.order !== 'number' || item.order < 0)) {
        throw new ApiError(`Agenda item ${i + 1}: order must be a non-negative number`, 400);
      }
    }

    // Store validated data
    req.validatedData = {
      agendaItems: agendaItems.map(item => ({
        title: item.title.trim(),
        description: item.description?.trim() || null,
        status: item.status || 'PENDING',
        order: item.order || 0,
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
export const validateUpdateBoardMeeting = (req, res, next) => {
  try {
    const updateData = req.body;

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
    const validStatuses = ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (updateData.status && !validStatuses.includes(updateData.status)) {
      throw new ApiError('Invalid board meeting status', 400);
    }

    // Store validated data
    req.validatedData = {};
    if (updateData.title !== undefined) {
      req.validatedData.title = updateData.title.trim();
    }
    if (updateData.description !== undefined) {
      req.validatedData.description = updateData.description?.trim() || null;
    }
    if (updateData.status !== undefined) {
      req.validatedData.status = updateData.status;
    }
    if (updateData.meetingDate !== undefined) {
      req.validatedData.meetingDate = updateData.meetingDate ? new Date(updateData.meetingDate) : null;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate ID parameter
 */
export const validateId = (req, res, next) => {
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
