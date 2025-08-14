import { Prisma, BoardMeeting, BoardMeetingStatus } from '@prisma/client';
import prisma from '../config/database';
import { CreateBoardMeetingData, UpdateBoardMeetingData } from '../types';

export class BoardMeetingModel {
  async findById(id: string): Promise<BoardMeeting | null> {
    const findByIdValidator = Prisma.validator<Prisma.BoardMeetingFindUniqueArgs>()({
      where: { id },
      include: {
        organization: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        agendaGroups: {
          orderBy: { order: 'asc' },
          include: {
            agendaItems: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return prisma.boardMeeting.findUnique(findByIdValidator);
  }

  async findMany(
    organizationId?: string,
    status?: BoardMeetingStatus,
    skip = 0,
    take = 10
  ): Promise<BoardMeeting[]> {
    const whereClause: Prisma.BoardMeetingWhereInput = {};
    
    if (organizationId) {
      whereClause.organizationId = organizationId;
    }
    
    if (status) {
      whereClause.status = status;
    }

    const findManyValidator = Prisma.validator<Prisma.BoardMeetingFindManyArgs>()({
      where: whereClause,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            agendaGroups: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
      skip,
      take,
    });

    return prisma.boardMeeting.findMany(findManyValidator);
  }

  async count(organizationId?: string, status?: BoardMeetingStatus): Promise<number> {
    const whereClause: Prisma.BoardMeetingWhereInput = {};
    
    if (organizationId) {
      whereClause.organizationId = organizationId;
    }
    
    if (status) {
      whereClause.status = status;
    }

    return prisma.boardMeeting.count({ where: whereClause });
  }

  async create(data: CreateBoardMeetingData, createdById: string): Promise<BoardMeeting> {
    const createValidator = Prisma.validator<Prisma.BoardMeetingCreateArgs>()({
      data: {
        title: data.title,
        description: data.description || null,
        scheduledAt: data.scheduledAt,
        duration: data.duration || null,
        location: data.location || null,
        organizationId: data.organizationId,
        createdById,
      },
      include: {
        organization: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return prisma.boardMeeting.create(createValidator);
  }

  async update(id: string, data: UpdateBoardMeetingData): Promise<BoardMeeting> {
    const updateData: Prisma.BoardMeetingUpdateInput = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.scheduledAt !== undefined) updateData.scheduledAt = data.scheduledAt;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.status !== undefined) updateData.status = data.status;

    const updateValidator = Prisma.validator<Prisma.BoardMeetingUpdateArgs>()({
      where: { id },
      data: updateData,
      include: {
        organization: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return prisma.boardMeeting.update(updateValidator);
  }

  async delete(id: string): Promise<BoardMeeting> {
    const deleteValidator = Prisma.validator<Prisma.BoardMeetingDeleteArgs>()({
      where: { id },
    });

    return prisma.boardMeeting.delete(deleteValidator);
  }

  async findByOrganizationId(organizationId: string): Promise<BoardMeeting[]> {
    const findManyValidator = Prisma.validator<Prisma.BoardMeetingFindManyArgs>()({
      where: { organizationId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            agendaGroups: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return prisma.boardMeeting.findMany(findManyValidator);
  }
}
