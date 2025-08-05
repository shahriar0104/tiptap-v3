import boardPaperService from '../services/boardPaperService.js';

class BoardPaperController {
  /**
   * Create a new board paper with agenda items
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createBoardPaper(req, res) {
    try {
      const { title, description, status, meetingDate, agendaItems } = req.validatedData;
      
      // For now, use a default author ID (in production, this would come from auth middleware)
      const authorId = req.user?.id || 'default-author-id';
      
      const boardPaperData = {
        title,
        description,
        status,
        meetingDate,
      };

      const result = await boardPaperService.createBoardPaperWithAgendaItems(
        boardPaperData,
        agendaItems,
        authorId
      );

      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error('Controller error - createBoardPaper:', error);
      
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
        message: 'Failed to create board paper',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get a board paper by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBoardPaper(req, res) {
    try {
      const { id } = req.params;
      
      const result = await boardPaperService.getBoardPaperById(id);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error('Controller error - getBoardPaper:', error);
      
      if (error.message === 'Board paper not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch board paper',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Get all board papers with optional filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllBoardPapers(req, res) {
    try {
      const { status, authorId, limit, offset } = req.query;
      
      const filters = {
        status: status || undefined,
        authorId: authorId || undefined,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0,
      };
      
      const result = await boardPaperService.getAllBoardPapers(filters);
      
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
      console.error('Controller error - getAllBoardPapers:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch board papers',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Update a board paper
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateBoardPaper(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.validatedData;
      
      const result = await boardPaperService.updateBoardPaper(id, updateData);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error('Controller error - updateBoardPaper:', error);
      
      if (error.message === 'Board paper not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update board paper',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Delete a board paper
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteBoardPaper(req, res) {
    try {
      const { id } = req.params;
      
      const result = await boardPaperService.deleteBoardPaper(id);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Controller error - deleteBoardPaper:', error);
      
      if (error.message === 'Board paper not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete board paper',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Add agenda items to an existing board paper
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
      
      const result = await boardPaperService.addAgendaItems(id, agendaItems);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error('Controller error - addAgendaItems:', error);
      
      if (error.message === 'Board paper not found') {
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

  /**
   * Health check endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async healthCheck(req, res) {
    res.status(200).json({
      success: true,
      message: 'Board paper service is healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  }
}

export default new BoardPaperController(); 