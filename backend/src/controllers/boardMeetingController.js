import boardMeetingService from '../services/boardMeetingService.js';

class BoardMeetingController {
  /**
   * Create a new board meeting with agenda items
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createBoardMeeting(req, res) {
    try {
      const { title, description, status, meetingDate, agendaItems } = req.validatedData;
      
      // For now, use a default author ID (in production, this would come from auth middleware)
      const authorId = req.user?.id || 'default-author-id';
      
      const boardMeetingData = {
        title,
        description,
        status,
        meetingDate,
      };

      const result = await boardMeetingService.createBoardMeetingWithAgendaItems(
        boardMeetingData,
        agendaItems,
        authorId
      );

      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error('Controller error - createBoardMeeting:', error);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      
      if (error.message.includes('Invalid author ID')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create board meeting',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get a board meeting by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBoardMeeting(req, res) {
    try {
      const { id } = req.params;
      
      const result = await boardMeetingService.getBoardMeetingById(id);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error('Controller error - getBoardMeeting:', error);
      
      if (error.message === 'Board meeting not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch board meeting',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get all board meetings with optional filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllBoardMeetings(req, res) {
    try {
      const { status, authorId, limit, offset } = req.query;
      
      const filters = {
        status: status || undefined,
        authorId: authorId || undefined,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0,
      };
      
      const result = await boardMeetingService.getAllBoardMeetings(filters);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: result.data.length,
        },
      });
    } catch (error) {
      console.error('Controller error - getAllBoardMeetings:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch board meetings',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Update a board meeting
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateBoardMeeting(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.validatedData;
      
      const result = await boardMeetingService.updateBoardMeeting(id, updateData);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error('Controller error - updateBoardMeeting:', error);
      
      if (error.message === 'Board meeting not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update board meeting',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Delete a board meeting
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteBoardMeeting(req, res) {
    try {
      const { id } = req.params;
      
      const result = await boardMeetingService.deleteBoardMeeting(id);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Controller error - deleteBoardMeeting:', error);
      
      if (error.message === 'Board meeting not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete board meeting',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Add agenda items to an existing board meeting
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addAgendaItems(req, res) {
    try {
      const { id } = req.params;
      const { agendaItems } = req.body;
      
      if (!Array.isArray(agendaItems) || agendaItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Agenda items array is required and cannot be empty',
        });
      }
      
      const result = await boardMeetingService.addAgendaItems(id, agendaItems);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error('Controller error - addAgendaItems:', error);
      
      if (error.message === 'Board meeting not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to add agenda items',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }
}

export default new BoardMeetingController(); 
