import { PrismaClient, Prisma, AgendaGroup } from '@prisma/client';
import { CreateAgendaGroupData, UpdateAgendaGroupData } from '../types';

type AgendaGroupWithRelations = Prisma.AgendaGroupGetPayload<{
  include: {
    boardMeeting: {
      select: {
        id: true,
        title: true,
        organizationId: true,
      },
    },
    agendaItems: {
      orderBy: { order: 'asc' },
    },
  },
}>;

export interface AgendaGroupModel {
  findById(id: string): Promise<AgendaGroupWithRelations | null>;
  findByBoardMeetingId(boardMeetingId: string): Promise<AgendaGroupWithRelations[]>;
  create(data: CreateAgendaGroupData): Promise<AgendaGroupWithRelations>;
  update(id: string, data: UpdateAgendaGroupData): Promise<AgendaGroupWithRelations>;
  delete(id: string): Promise<AgendaGroup>;
  reorder(updates: Array<{ id: string; order: number }>): Promise<void>;
  reorderGroups(boardMeetingId: string, updates: Array<{ id: string; order: number }>): Promise<void>;
  getMaxOrder(boardMeetingId: string): Promise<number>;
}

export class AgendaGroupModelImpl implements AgendaGroupModel {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<AgendaGroupWithRelations | null> {
    const findByIdValidator = Prisma.validator<Prisma.AgendaGroupFindUniqueArgs>()({
      where: { id },
      include: {
        boardMeeting: {
          select: {
            id: true,
            title: true,
            organizationId: true,
          },
        },
        agendaItems: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.prisma.agendaGroup.findUnique(findByIdValidator);
  }

  async findByBoardMeetingId(boardMeetingId: string): Promise<AgendaGroupWithRelations[]> {
    const findManyValidator = Prisma.validator<Prisma.AgendaGroupFindManyArgs>()({
      where: { boardMeetingId },
      include: {
        boardMeeting: {
          select: {
            id: true,
            title: true,
            organizationId: true,
          },
        },
        agendaItems: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return this.prisma.agendaGroup.findMany(findManyValidator);
  }

  async create(data: CreateAgendaGroupData): Promise<AgendaGroupWithRelations> {
    const createValidator = Prisma.validator<Prisma.AgendaGroupCreateArgs>()({
      data: {
        title: data.title,
        order: data.order,
        startTime: data.startTime,
        boardMeetingId: data.boardMeetingId,
      },
      include: {
        boardMeeting: {
          select: {
            id: true,
            title: true,
            organizationId: true,
          },
        },
        agendaItems: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.prisma.agendaGroup.create(createValidator);
  }

  async update(id: string, data: UpdateAgendaGroupData): Promise<AgendaGroupWithRelations> {
    const updateData: Prisma.AgendaGroupUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;

    const updateValidator = Prisma.validator<Prisma.AgendaGroupUpdateArgs>()({
      where: { id },
      data: updateData,
      include: {
        boardMeeting: {
          select: {
            id: true,
            title: true,
            organizationId: true,
          },
        },
        agendaItems: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.prisma.agendaGroup.update(updateValidator);
  }

  async delete(id: string): Promise<AgendaGroup> {
    return this.prisma.agendaGroup.delete({
      where: { id },
    });
  }

  async reorder(updates: Array<{ id: string; order: number }>): Promise<void> {
    await this.prisma.$transaction(
      updates.map(({ id, order }) =>
        this.prisma.agendaGroup.update({
          where: { id },
          data: { order },
        })
      )
    );
  }

  async reorderGroups(_boardMeetingId: string, updates: Array<{ id: string; order: number }>): Promise<void> {
    await this.prisma.$transaction(
      updates.map(({ id, order }) =>
        this.prisma.agendaGroup.update({
          where: { id },
          data: { order },
        })
      )
    );
  }

  async getMaxOrder(boardMeetingId: string): Promise<number> {
    const result = await this.prisma.agendaGroup.aggregate({
      where: { boardMeetingId },
      _max: { order: true },
    });

    return result._max.order ?? -1;
  }
}
