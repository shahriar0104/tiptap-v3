import boardMeetingService from '../services/boardMeetingService.js';

class BoardMeetingController {
  /**
   * Create a new board meeting with agenda items
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createBoardMeeting(req, res, next) {
    try {
      // Use validated data from validation middleware
      const { boardMeetingData, agendaItems } = req.validatedData || req.body;
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;

      // Ensure a user is authenticated and has an organization
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'User must belong to an organization to create board meetings',
        });
      }
      
      const boardMeeting = await boardMeetingService.createBoardMeetingWithAgendaItems(
        boardMeetingData,
        agendaItems,
        userId,
        organizationId
      );

      res.status(201).json({
        success: true,
        message: boardMeeting.message,
        data: boardMeeting.data,
        // data: result.data,
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
      const { status, userId, limit, offset } = req.query;
      
      const filters = {
        status: status || undefined,
        userId: userId || undefined,
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
  // async getAllBoardMeetings(req, res, next) {
  //   try {
  //     // Filter by organization if user is authenticated
  //     const organizationId = req.user?.organizationId;
  //     const boardMeetings = await boardMeetingService.getAllBoardMeetings(organizationId);
  //
  //     res.status(200).json({
  //       success: true,
  //       data: boardMeetings,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  /**
   * Delete a board meeting by ID
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
