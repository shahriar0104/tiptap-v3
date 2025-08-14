import { Prisma, AgendaGroup } from '@prisma/client';
import prisma from '../config/database';
import { CreateAgendaGroupData, UpdateAgendaGroupData } from '../types';

type AgendaGroupWithRelations = Prisma.AgendaGroupGetPayload<{
  include: {
    boardMeeting: {
      select: {
        id: true;
        title: true;
        organizationId: true;
      };
    };
    createdBy: {
      select: {
        id: true;
        email: true;
        firstName: true;
        lastName: true;
      };
    };
    agendaItems: {
      include: {
        createdBy: {
          select: {
            id: true;
            email: true;
            firstName: true;
            lastName: true;
          };
        };
      };
    };
  };
}>;

export class AgendaGroupModel {
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
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        agendaItems: {
          orderBy: { order: 'asc' },
          include: {
            createdBy: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return prisma.agendaGroup.findUnique(findByIdValidator);
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
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        agendaItems: {
          orderBy: { order: 'asc' },
          include: {
            createdBy: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return prisma.agendaGroup.findMany(findManyValidator);
  }

  async create(data: CreateAgendaGroupData, createdById: string): Promise<AgendaGroup> {
    const createValidator = Prisma.validator<Prisma.AgendaGroupCreateArgs>()({
      data: {
        title: data.title,
        description: data.description || null,
        order: data.order,
        boardMeetingId: data.boardMeetingId,
        createdById,
      },
      include: {
        boardMeeting: {
          select: {
            id: true,
            title: true,
            organizationId: true,
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
      },
    });

    return prisma.agendaGroup.create(createValidator);
  }

  async update(id: string, data: UpdateAgendaGroupData): Promise<AgendaGroupWithRelations> {
    const updateData: Prisma.AgendaGroupUpdateInput = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.order !== undefined) updateData.order = data.order;

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
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        agendaItems: {
          orderBy: { order: 'asc' },
          include: {
            createdBy: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return prisma.agendaGroup.update(updateValidator);
  }

  async delete(id: string): Promise<AgendaGroup> {
    const deleteValidator = Prisma.validator<Prisma.AgendaGroupDeleteArgs>()({
      where: { id },
    });

    return prisma.agendaGroup.delete(deleteValidator);
  }

  async reorderGroups(boardMeetingId: string, groupOrders: Array<{ id: string; order: number }>): Promise<void> {
    await prisma.$transaction(
      groupOrders.map(({ id, order }) =>
        prisma.agendaGroup.update({
          where: { id, boardMeetingId },
          data: { order },
        })
      )
    );
  }

  async getMaxOrder(boardMeetingId: string): Promise<number> {
    const result = await prisma.agendaGroup.aggregate({
      where: { boardMeetingId },
      _max: { order: true },
    });

    return result._max.order ?? -1;
  }
}
