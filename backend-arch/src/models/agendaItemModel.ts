import { Prisma, AgendaItem, AgendaItemStatus } from '@prisma/client';
import prisma from '../config/database';
import { CreateAgendaItemData, UpdateAgendaItemData } from '../types';

type AgendaItemWithRelations = Prisma.AgendaItemGetPayload<{
  include: {
    agendaGroup: {
      select: {
        id: true;
        title: true;
        boardMeetingId: true;
        boardMeeting: {
          select: {
            id: true;
            title: true;
            organizationId: true;
          };
        };
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
  };
}>;

export class AgendaItemModel {
  async findById(id: string): Promise<AgendaItemWithRelations | null> {
    const findByIdValidator = Prisma.validator<Prisma.AgendaItemFindUniqueArgs>()({
      where: { id },
      include: {
        agendaGroup: {
          select: {
            id: true,
            title: true,
            boardMeetingId: true,
            boardMeeting: {
              select: {
                id: true,
                title: true,
                organizationId: true,
              },
            },
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

    return prisma.agendaItem.findUnique(findByIdValidator);
  }

  async findByAgendaGroupId(agendaGroupId: string): Promise<AgendaItemWithRelations[]> {
    const findManyValidator = Prisma.validator<Prisma.AgendaItemFindManyArgs>()({
      where: { agendaGroupId },
      include: {
        agendaGroup: {
          select: {
            id: true,
            title: true,
            boardMeetingId: true,
            boardMeeting: {
              select: {
                id: true,
                title: true,
                organizationId: true,
              },
            },
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
      orderBy: { order: 'asc' },
    });

    return prisma.agendaItem.findMany(findManyValidator);
  }

  async create(data: CreateAgendaItemData, createdById: string): Promise<AgendaItem> {
    const createValidator = Prisma.validator<Prisma.AgendaItemCreateArgs>()({
      data: {
        title: data.title,
        description: data.description || null,
        order: data.order,
        duration: data.duration || null,
        type: data.type || 'DISCUSSION',
        agendaGroupId: data.agendaGroupId,
        createdById,
      },
      include: {
        agendaGroup: {
          select: {
            id: true,
            title: true,
            boardMeetingId: true,
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

    return prisma.agendaItem.create(createValidator);
  }

  async update(id: string, data: UpdateAgendaItemData): Promise<AgendaItem> {
    const updateData: Prisma.AgendaItemUpdateInput = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;

    const updateValidator = Prisma.validator<Prisma.AgendaItemUpdateArgs>()({
      where: { id },
      data: updateData,
      include: {
        agendaGroup: {
          select: {
            id: true,
            title: true,
            boardMeetingId: true,
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

    return prisma.agendaItem.update(updateValidator);
  }

  async delete(id: string): Promise<AgendaItem> {
    const deleteValidator = Prisma.validator<Prisma.AgendaItemDeleteArgs>()({
      where: { id },
    });

    return prisma.agendaItem.delete(deleteValidator);
  }

  async reorderItems(agendaGroupId: string, itemOrders: Array<{ id: string; order: number }>): Promise<void> {
    await prisma.$transaction(
      itemOrders.map(({ id, order }) =>
        prisma.agendaItem.update({
          where: { id, agendaGroupId },
          data: { order },
        })
      )
    );
  }

  async getMaxOrder(agendaGroupId: string): Promise<number> {
    const result = await prisma.agendaItem.aggregate({
      where: { agendaGroupId },
      _max: { order: true },
    });

    return result._max.order ?? -1;
  }

  async updateStatus(id: string, status: AgendaItemStatus): Promise<AgendaItem> {
    const updateValidator = Prisma.validator<Prisma.AgendaItemUpdateArgs>()({
      where: { id },
      data: { status },
      include: {
        agendaGroup: {
          select: {
            id: true,
            title: true,
            boardMeetingId: true,
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

    return prisma.agendaItem.update(updateValidator);
  }

  async findByBoardMeetingId(boardMeetingId: string): Promise<AgendaItemWithRelations[]> {
    const findManyValidator = Prisma.validator<Prisma.AgendaItemFindManyArgs>()({
      where: {
        agendaGroup: {
          boardMeetingId,
        },
      },
      include: {
        agendaGroup: {
          select: {
            id: true,
            title: true,
            boardMeetingId: true,
            boardMeeting: {
              select: {
                id: true,
                title: true,
                organizationId: true,
              },
            },
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
      orderBy: [
        { agendaGroup: { order: 'asc' } },
        { order: 'asc' },
      ],
    });

    return prisma.agendaItem.findMany(findManyValidator);
  }
}
