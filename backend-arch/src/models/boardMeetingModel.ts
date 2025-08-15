import { Prisma, BoardMeeting, BoardMeetingStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

export interface CreateBoardMeetingData {
  title: string;
  description?: string | undefined;
  meetingDate?: Date | undefined;
  organizationId: string;
}

export interface UpdateBoardMeetingData {
  title?: string | undefined;
  description?: string | undefined;
  meetingDate?: Date | undefined;
  status?: BoardMeetingStatus | undefined;
}

export interface BoardMeetingModel {
  findById(id: string): Promise<BoardMeeting | null>;
  findMany(
    organizationId?: string,
    status?: BoardMeetingStatus,
    skip?: number,
    take?: number
  ): Promise<BoardMeeting[]>;
  count(organizationId?: string, status?: BoardMeetingStatus): Promise<number>;
  create(data: CreateBoardMeetingData, createdById: string): Promise<BoardMeeting>;
  update(id: string, data: UpdateBoardMeetingData): Promise<BoardMeeting>;
  delete(id: string): Promise<void>;
  findByOrganizationId(organizationId: string): Promise<BoardMeeting[]>;
}

export class BoardMeetingModelImpl implements BoardMeetingModel {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<BoardMeeting | null> {
    const findByIdValidator = Prisma.validator<Prisma.BoardMeetingFindUniqueArgs>()({
      where: { id },
      include: {
        organization: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
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

    return this.prisma.boardMeeting.findUnique(findByIdValidator);
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
            name: true,
          },
        },
        _count: {
          select: {
            agendaGroups: true,
          },
        },
      },
      orderBy: { meetingDate: 'desc' },
      skip,
      take,
    });

    return this.prisma.boardMeeting.findMany(findManyValidator);
  }

  async count(organizationId?: string, status?: BoardMeetingStatus): Promise<number> {
    const whereClause: Prisma.BoardMeetingWhereInput = {};
    
    if (organizationId) {
      whereClause.organizationId = organizationId;
    }
    
    if (status) {
      whereClause.status = status;
    }

    return this.prisma.boardMeeting.count({ where: whereClause });
  }

  async create(data: CreateBoardMeetingData, createdById: string): Promise<BoardMeeting> {
    const createValidator = Prisma.validator<Prisma.BoardMeetingCreateArgs>()({
      data: {
        title: data.title,
        description: data.description || null,
        meetingDate: data.meetingDate || null,
        organizationId: data.organizationId,
        createdById,
      },
      include: {
        organization: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return this.prisma.boardMeeting.create(createValidator);
  }

  async update(id: string, data: UpdateBoardMeetingData): Promise<BoardMeeting> {
    const updateData: Prisma.BoardMeetingUpdateInput = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.meetingDate !== undefined) updateData.meetingDate = data.meetingDate;
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
            name: true,
          },
        },
      },
    });

    return this.prisma.boardMeeting.update(updateValidator);
  }

  async delete(id: string): Promise<void> {
    const deleteValidator = Prisma.validator<Prisma.BoardMeetingDeleteArgs>()({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    await this.prisma.boardMeeting.delete(deleteValidator);
  }

  async findByOrganizationId(organizationId: string): Promise<BoardMeeting[]> {
    const findManyValidator = Prisma.validator<Prisma.BoardMeetingFindManyArgs>()({
      where: { organizationId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            agendaGroups: true,
          },
        },
      },
      orderBy: { meetingDate: 'desc' },
    });

    return this.prisma.boardMeeting.findMany(findManyValidator);
  }
}

