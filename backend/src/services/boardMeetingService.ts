import database from '../config/database.js';
import { Prisma, PrismaClient } from '@prisma/client';
import { 
  ServiceResponse, 
  BoardMeeting, 
  AgendaItem, 
  CreateBoardMeetingRequest, 
  CreateAgendaItemRequest,
  UpdateBoardMeetingRequest,
  UpdateAgendaItemRequest,
  BoardMeetingWithDetails,
  BoardMeetingStatus
} from '../types/index.js';

class BoardMeetingService {
  private _prisma: PrismaClient | null = null;

  // Lazy-load the Prisma client
  private get prisma(): PrismaClient {
    if (!this._prisma) {
      this._prisma = database.getClient();
    }
    return this._prisma;
  }

  /**
   * Create a new board meeting with agenda items using a transaction
   */
  async createBoardMeetingWithAgendaItems(
    boardMeetingData: CreateBoardMeetingRequest & { meetingDate?: Date | null },
    agendaItems: CreateAgendaItemRequest[],
    userId: string,
    organizationId: string
  ): Promise<ServiceResponse<BoardMeetingWithDetails>> {
    try {
      const result = await database.transaction(async (tx) => {
        // Create the board meeting
        const boardMeeting = await tx.boardMeeting.create({
          data: {
            title: boardMeetingData.title,
            description: boardMeetingData.description || null,
            status: boardMeetingData.status || BoardMeetingStatus.DRAFT,
            meetingDate: boardMeetingData.meetingDate || null,
            userId: userId,
            organizationId,
          },
        });

        // Create agenda groups and items if provided
        if (agendaItems && agendaItems.length > 0) {
          // For now, create a default agenda group
          const defaultGroup = await tx.agendaGroup.create({
            data: {
              name: 'Main Agenda',
              order: 1,
              boardMeetingId: boardMeeting.id,
            },
          });

          // Create agenda items with proper ordering
          const agendaItemsWithGroupId = agendaItems.map((item, index) => ({
            title: item.title,
            order: item.order || index + 1,
            startTime: item.startTime,
            status: item.status || 'PENDING',
            agendaGroupId: defaultGroup.id,
          }));

          await tx.agendaItem.createMany({
            data: agendaItemsWithGroupId,
          });
        }

        // Fetch the created board meeting with all relations
        const boardMeetingWithDetails = await tx.boardMeeting.findUnique({
          where: { id: boardMeeting.id },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            agendaGroups: {
              include: {
                agendaItems: {
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        });

        return boardMeetingWithDetails as BoardMeetingWithDetails;
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
   */
  async getBoardMeetingById(id: string): Promise<ServiceResponse<BoardMeetingWithDetails>> {
    try {
      const boardMeeting = await this.prisma.boardMeeting.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          agendaGroups: {
            include: {
              agendaItems: {
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!boardMeeting) {
        throw new Error('Board meeting not found');
      }

      return {
        success: true,
        data: boardMeeting as BoardMeetingWithDetails,
        message: 'Board meeting retrieved successfully',
      };
    } catch (error) {
      console.error('Error getting board meeting by ID:', error);
      throw error;
    }
  }

  /**
   * Get all board meetings for an organization
   */
  async getAllBoardMeetings(organizationId: string): Promise<ServiceResponse<BoardMeeting[]>> {
    try {
      const boardMeetings = await this.prisma.boardMeeting.findMany({
        where: { organizationId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          agendaGroups: {
            include: {
              agendaItems: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: boardMeetings,
        message: 'Board meetings retrieved successfully',
      };
    } catch (error) {
      console.error('Error getting all board meetings:', error);
      throw new Error('Failed to retrieve board meetings');
    }
  }

  /**
   * Update a board meeting
   */
  async updateBoardMeeting(
    id: string,
    updateData: UpdateBoardMeetingRequest,
    userId: string
  ): Promise<ServiceResponse<BoardMeeting>> {
    try {
      // First check if the board meeting exists and user has permission
      const existingBoardMeeting = await this.prisma.boardMeeting.findUnique({
        where: { id },
        select: { userId: true, organizationId: true },
      });

      if (!existingBoardMeeting) {
        throw new Error('Board meeting not found');
      }

      if (existingBoardMeeting.userId !== userId) {
        throw new Error('Permission denied: You can only update your own board meetings');
      }

      const updatedBoardMeeting = await this.prisma.boardMeeting.update({
        where: { id },
        data: {
          ...(updateData.title && { title: updateData.title }),
          ...(updateData.description !== undefined && { description: updateData.description }),
          ...(updateData.status && { status: updateData.status }),
          ...(updateData.meetingDate !== undefined && { 
            meetingDate: updateData.meetingDate ? new Date(updateData.meetingDate) : null 
          }),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          agendaGroups: {
            include: {
              agendaItems: {
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      });

      return {
        success: true,
        data: updatedBoardMeeting,
        message: 'Board meeting updated successfully',
      };
    } catch (error) {
      console.error('Error updating board meeting:', error);
      throw error;
    }
  }

  /**
   * Delete a board meeting
   */
  async deleteBoardMeeting(id: string, userId: string): Promise<ServiceResponse> {
    try {
      // First check if the board meeting exists and user has permission
      const existingBoardMeeting = await this.prisma.boardMeeting.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existingBoardMeeting) {
        throw new Error('Board meeting not found');
      }

      if (existingBoardMeeting.userId !== userId) {
        throw new Error('Permission denied: You can only delete your own board meetings');
      }

      await this.prisma.boardMeeting.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Board meeting deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting board meeting:', error);
      throw error;
    }
  }

  /**
   * Add agenda items to a board meeting
   */
  async addAgendaItems(
    boardMeetingId: string,
    agendaItems: CreateAgendaItemRequest[],
    userId: string
  ): Promise<ServiceResponse<AgendaItem[]>> {
    try {
      // Check if user has permission to modify this board meeting
      const boardMeeting = await this.prisma.boardMeeting.findUnique({
        where: { id: boardMeetingId },
        select: { userId: true },
      });

      if (!boardMeeting) {
        throw new Error('Board meeting not found');
      }

      if (boardMeeting.userId !== userId) {
        throw new Error('Permission denied: You can only modify your own board meetings');
      }

      // Get or create default agenda group
      let agendaGroup = await this.prisma.agendaGroup.findFirst({
        where: { boardMeetingId },
      });

      if (!agendaGroup) {
        agendaGroup = await this.prisma.agendaGroup.create({
          data: {
            name: 'Main Agenda',
            order: 1,
            boardMeetingId,
          },
        });
      }

      // Create agenda items
      const agendaItemsData = agendaItems.map((item, index) => ({
        title: item.title,
        order: item.order || index + 1,
        startTime: item.startTime,
        status: item.status || 'PENDING',
        agendaGroupId: agendaGroup.id,
      }));

      await this.prisma.agendaItem.createMany({
        data: agendaItemsData,
      });

      // Fetch created items
      const createdItems = await this.prisma.agendaItem.findMany({
        where: { agendaGroupId: agendaGroup.id },
        orderBy: { order: 'asc' },
      });

      return {
        success: true,
        data: createdItems,
        message: 'Agenda items added successfully',
      };
    } catch (error) {
      console.error('Error adding agenda items:', error);
      throw error;
    }
  }

  /**
   * Update an agenda item
   */
  async updateAgendaItem(
    boardMeetingId: string,
    agendaItemId: string,
    updateData: UpdateAgendaItemRequest,
    userId: string
  ): Promise<ServiceResponse<AgendaItem>> {
    try {
      // Check if user has permission to modify this board meeting
      const boardMeeting = await this.prisma.boardMeeting.findUnique({
        where: { id: boardMeetingId },
        select: { userId: true },
      });

      if (!boardMeeting) {
        throw new Error('Board meeting not found');
      }

      if (boardMeeting.userId !== userId) {
        throw new Error('Permission denied: You can only modify your own board meetings');
      }

      const updatedItem = await this.prisma.agendaItem.update({
        where: { id: agendaItemId },
        data: {
          ...(updateData.title && { title: updateData.title }),
          ...(updateData.order !== undefined && { order: updateData.order }),
          ...(updateData.startTime && { startTime: updateData.startTime }),
          ...(updateData.status && { status: updateData.status }),
        },
      });

      return {
        success: true,
        data: updatedItem,
        message: 'Agenda item updated successfully',
      };
    } catch (error) {
      console.error('Error updating agenda item:', error);
      throw error;
    }
  }

  /**
   * Delete an agenda item
   */
  async deleteAgendaItem(
    boardMeetingId: string,
    agendaItemId: string,
    userId: string
  ): Promise<ServiceResponse> {
    try {
      // Check if user has permission to modify this board meeting
      const boardMeeting = await this.prisma.boardMeeting.findUnique({
        where: { id: boardMeetingId },
        select: { userId: true },
      });

      if (!boardMeeting) {
        throw new Error('Board meeting not found');
      }

      if (boardMeeting.userId !== userId) {
        throw new Error('Permission denied: You can only modify your own board meetings');
      }

      await this.prisma.agendaItem.delete({
        where: { id: agendaItemId },
      });

      return {
        success: true,
        message: 'Agenda item deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting agenda item:', error);
      throw error;
    }
  }
}

export default new BoardMeetingService();
