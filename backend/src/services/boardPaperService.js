import database from '../config/database.js';
import { Prisma } from '@prisma/client';

class BoardPaperService {
  constructor() {
    // Don't get the client during initialization
    this._prisma = null;
  }

  // Lazy-load the Prisma client
  get prisma() {
    if (!this._prisma) {
      this._prisma = database.getClient();
    }
    return this._prisma;
  }

  /**
   * Create a new board paper with agenda items using a transaction
   * @param {Object} boardPaperData - Board paper data
   * @param {Array} agendaItems - Array of agenda items
   * @param {string} authorId - ID of the author
   * @returns {Object} Created board paper with agenda items
   */
  async createBoardPaperWithAgendaItems(boardPaperData, agendaItems, authorId) {
    try {
      const result = await database.transaction(async (tx) => {
        // Create the board paper
        const boardPaper = await tx.boardPaper.create({
          data: {
            ...boardPaperData,
            authorId,
            meetingDate: boardPaperData.meetingDate ? new Date(boardPaperData.meetingDate) : null,
          },
        });

        // Create agenda items with proper ordering
        const agendaItemsWithBoardPaperId = agendaItems.map((item, index) => ({
          ...item,
          boardPaperId: boardPaper.id,
          order: item.order || index + 1,
        }));

        const createdAgendaItems = await tx.agendaItem.createMany({
          data: agendaItemsWithBoardPaperId,
        });

        // Fetch the created board paper with agenda items
        const boardPaperWithAgendaItems = await tx.boardPaper.findUnique({
          where: { id: boardPaper.id },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            agendaItems: {
              orderBy: { order: 'asc' },
            },
          },
        });

        return boardPaperWithAgendaItems;
      });

      return {
        success: true,
        data: result,
        message: 'Board paper created successfully with agenda items',
      };
    } catch (error) {
      console.error('Error creating board paper with agenda items:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('A board paper with this title already exists');
        }
        if (error.code === 'P2003') {
          throw new Error('Invalid author ID provided');
        }
      }
      
      throw new Error('Failed to create board paper with agenda items');
    }
  }

  /**
   * Get a board paper by ID with its agenda items
   * @param {string} id - Board paper ID
   * @returns {Object} Board paper with agenda items
   */
  async getBoardPaperById(id) {
    try {
      const boardPaper = await this.prisma.boardPaper.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          agendaItems: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!boardPaper) {
        throw new Error('Board paper not found');
      }

      return {
        success: true,
        data: boardPaper,
        message: 'Board paper retrieved successfully',
      };
    } catch (error) {
      console.error('Error fetching board paper:', error);
      
      if (error.message === 'Board paper not found') {
        throw error;
      }
      
      throw new Error('Failed to fetch board paper');
    }
  }

  /**
   * Get all board papers with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Array} Array of board papers
   */
  async getAllBoardPapers(filters = {}) {
    try {
      const { status, authorId, limit = 50, offset = 0 } = filters;

      const where = {};
      if (status) where.status = status;
      if (authorId) where.authorId = authorId;

      const boardPapers = await this.prisma.boardPaper.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          agendaItems: {
            orderBy: { order: 'asc' },
            take: 5, // Limit agenda items for list view
          },
          _count: {
            select: {
              agendaItems: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return {
        success: true,
        data: boardPapers,
        message: 'Board papers retrieved successfully',
      };
    } catch (error) {
      console.error('Error fetching board papers:', error);
      throw new Error('Failed to fetch board papers');
    }
  }

  /**
   * Update a board paper
   * @param {string} id - Board paper ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated board paper
   */
  async updateBoardPaper(id, updateData) {
    try {
      const boardPaper = await this.prisma.boardPaper.update({
        where: { id },
        data: {
          ...updateData,
          meetingDate: updateData.meetingDate ? new Date(updateData.meetingDate) : undefined,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          agendaItems: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return {
        success: true,
        data: boardPaper,
        message: 'Board paper updated successfully',
      };
    } catch (error) {
      console.error('Error updating board paper:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Board paper not found');
        }
      }
      
      throw new Error('Failed to update board paper');
    }
  }

  /**
   * Delete a board paper and its agenda items
   * @param {string} id - Board paper ID
   * @returns {Object} Deletion result
   */
  async deleteBoardPaper(id) {
    try {
      await this.prisma.boardPaper.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Board paper deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting board paper:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Board paper not found');
        }
      }
      
      throw new Error('Failed to delete board paper');
    }
  }

  /**
   * Add agenda items to an existing board paper
   * @param {string} boardPaperId - Board paper ID
   * @param {Array} agendaItems - Array of agenda items to add
   * @returns {Object} Updated board paper with new agenda items
   */
  async addAgendaItems(boardPaperId, agendaItems) {
    try {
      const result = await database.transaction(async (tx) => {
        // Get current max order
        const maxOrder = await tx.agendaItem.aggregate({
          where: { boardPaperId },
          _max: { order: true },
        });

        const startOrder = (maxOrder._max.order || 0) + 1;

        // Create new agenda items
        const agendaItemsWithOrder = agendaItems.map((item, index) => ({
          ...item,
          boardPaperId,
          order: item.order || startOrder + index,
        }));

        await tx.agendaItem.createMany({
          data: agendaItemsWithOrder,
        });

        // Fetch updated board paper
        const boardPaper = await tx.boardPaper.findUnique({
          where: { id: boardPaperId },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            agendaItems: {
              orderBy: { order: 'asc' },
            },
          },
        });

        return boardPaper;
      });

      return {
        success: true,
        data: result,
        message: 'Agenda items added successfully',
      };
    } catch (error) {
      console.error('Error adding agenda items:', error);
      throw new Error('Failed to add agenda items');
    }
  }
}

export default new BoardPaperService(); 