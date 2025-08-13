import database from '../config/database.js';
import {Prisma} from '@prisma/client';

class BoardMeetingService {
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
   * Create a new board meeting with agenda items using a transaction
   * @param {Object} boardMeetingData - Board meeting data
   * @param {Array} agendaItems - Array of agenda items
   * @param {string} userId - ID of the author
   * @returns {Object} Created a board meeting with agenda items
   */
  async createBoardMeetingWithAgendaItems(boardMeetingData, agendaItems, userId, organizationId) {
    try {
      const result = await database.transaction(async (tx) => {
        // Create the board meeting
        const boardMeeting = await tx.boardMeeting.create({
          data: {
            ...boardMeetingData,
            userId: userId, // Use userId to match Prisma schema
            organizationId,
            meetingDate: boardMeetingData.meetingDate ? new Date(boardMeetingData.meetingDate) : null,
          },
        });

        // Create agenda items with proper ordering
        const agendaItemsWithBoardMeetingId = agendaItems.map((item, index) => ({
          ...item,
          boardMeetingId: boardMeeting.id,
          order: item.order || index + 1,
        }));

        const createdAgendaItems = await tx.agendaItem.createMany({
          data: agendaItemsWithBoardMeetingId,
        });

        // Fetch the created board meeting with agenda items
        const boardMeetingWithAgendaItems = await tx.boardMeeting.findUnique({
          where: { id: boardMeeting.id },
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

        return boardMeetingWithAgendaItems;
      });

      return {
        success: true,
        data: result,
        message: 'Board meeting created successfully with agenda items',
      };
    } catch (error) {
      console.error('Error creating board meeting with agenda items:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('A board meeting with this title already exists');
        }
        if (error.code === 'P2003') {
          throw new Error('Invalid author ID provided');
        }
      }
      
      throw new Error('Failed to create board meeting with agenda items');
    }
  }

  /**
   * Get a board meeting by ID with its agenda items
   * @param {string} id - Board meeting ID
   * @returns {Object} Board meeting with agenda items
   */
  async getBoardMeetingById(id) {
    try {
      const boardMeeting = await this.prisma.boardMeeting.findUnique({
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

      if (!boardMeeting) {
        throw new Error('Board meeting not found');
      }

      return {
        success: true,
        data: boardMeeting,
        message: 'Board meeting retrieved successfully',
      };
    } catch (error) {
      console.error('Error fetching board meeting:', error);
      
      if (error.message === 'Board meeting not found') {
        throw error;
      }
      
      throw new Error('Failed to fetch board meeting');
    }
  }

  /**
   * Get all board meetings with optional filtering
   * @param {Object} filters - Optional filters
   * @returns {Array} Array of board meetings
   */
  async getAllBoardMeetings(filters = {}) {
    try {
      const { status, userId, limit = 50, offset = 0 } = filters;

      const where = {};
      if (status) where.status = status;
      if (userId) where.userId = userId;
      
      const boardMeetings = await this.prisma.boardMeeting.findMany({
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
            take: 5, // Limit agenda items for the list view
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
        data: boardMeetings,
        message: 'Board meetings retrieved successfully',
      };
    } catch (error) {
      console.error('Error fetching board meetings:', error);
      throw new Error('Failed to fetch board meetings');
    }
  }

  /**
   * Update a board meeting
   * @param {string} id - Board meeting ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated board meeting
   */
  async updateBoardMeeting(id, updateData) {
    try {
      const boardMeeting = await this.prisma.boardMeeting.update({
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
        data: boardMeeting,
        message: 'Board meeting updated successfully',
      };
    } catch (error) {
      console.error('Error updating board meeting:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Board meeting not found');
        }
      }
      
      throw new Error('Failed to update board meeting');
    }
  }

  /**
   * Delete a board meeting and its agenda items
   * @param {string} id - Board meeting ID
   * @returns {Object} Deletion result
   */
  async deleteBoardMeeting(id) {
    try {
      await this.prisma.boardMeeting.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Board meeting deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting board meeting:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Board meeting not found');
        }
      }
      
      throw new Error('Failed to delete board meeting');
    }
  }

  /**
   * Add agenda items to an existing board meeting
   * @param {string} boardMeetingId - Board meeting ID
   * @param {Array} agendaItems - Array of agenda items to add
   * @returns {Object} Updated board meeting with new agenda items
   */
  async addAgendaItems(boardMeetingId, agendaItems) {
    try {
      const result = await database.transaction(async (tx) => {
        // Get current max order
        const maxOrder = await tx.agendaItem.aggregate({
          where: { boardMeetingId },
          _max: { order: true },
        });

        const startOrder = (maxOrder._max.order || 0) + 1;

        // Create new agenda items
        const agendaItemsWithOrder = agendaItems.map((item, index) => ({
          ...item,
          boardMeetingId,
          order: item.order || startOrder + index,
        }));

        await tx.agendaItem.createMany({
          data: agendaItemsWithOrder,
        });

        // Fetch updated board meeting
        const boardMeeting = await tx.boardMeeting.findUnique({
          where: { id: boardMeetingId },
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

        return boardMeeting;
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

export default new BoardMeetingService(); 
