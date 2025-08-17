import {
  PrismaClient,
  Prisma,
  AgendaItem,
  AgendaItemStatus,
} from '@prisma/client';
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
  };
}>;

export interface AgendaItemModel {
  findById(id: string): Promise<AgendaItemWithRelations | null>;
  findByAgendaGroupId(
    agendaGroupId: string
  ): Promise<AgendaItemWithRelations[]>;
  create(data: CreateAgendaItemData): Promise<AgendaItem>;
  update(id: string, data: UpdateAgendaItemData): Promise<AgendaItem>;
  delete(id: string): Promise<AgendaItem>;
  reorderItems(
    agendaGroupId: string,
    itemOrders: Array<{ id: string; order: number }>
  ): Promise<void>;
  getMaxOrder(agendaGroupId: string): Promise<number>;
  updateStatus(id: string, status: AgendaItemStatus): Promise<AgendaItem>;
  findByBoardMeetingId(
    boardMeetingId: string
  ): Promise<AgendaItemWithRelations[]>;
}

export class AgendaItemModelImpl implements AgendaItemModel {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async findById(id: string): Promise<AgendaItemWithRelations | null> {
    const findByIdValidator =
      Prisma.validator<Prisma.AgendaItemFindUniqueArgs>()({
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
        },
      });

    return this.prisma.agendaItem.findUnique(findByIdValidator);
  }

  async findByAgendaGroupId(
    agendaGroupId: string
  ): Promise<AgendaItemWithRelations[]> {
    const findManyValidator = Prisma.validator<Prisma.AgendaItemFindManyArgs>()(
      {
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
        },
        orderBy: { order: 'asc' },
      }
    );

    return this.prisma.agendaItem.findMany(findManyValidator);
  }

  async create(data: CreateAgendaItemData): Promise<AgendaItem> {
    const createValidator = Prisma.validator<Prisma.AgendaItemCreateArgs>()({
      data: {
        title: data.title,
        startTime: data.startTime,
        order: data.order,
        type: data.type || 'STANDARD',
        agendaGroupId: data.agendaGroupId,
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
      },
    });

    return this.prisma.agendaItem.create(createValidator);
  }

  async update(id: string, data: UpdateAgendaItemData): Promise<AgendaItem> {
    const updateData: Prisma.AgendaItemUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
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
            boardMeeting: {
              select: {
                id: true,
                title: true,
                organizationId: true,
              },
            },
          },
        },
      },
    });

    return this.prisma.agendaItem.update(updateValidator);
  }

  async delete(id: string): Promise<AgendaItem> {
    const deleteValidator = Prisma.validator<Prisma.AgendaItemDeleteArgs>()({
      where: { id },
    });

    return this.prisma.agendaItem.delete(deleteValidator);
  }

  async reorderItems(
    agendaGroupId: string,
    itemOrders: Array<{ id: string; order: number }>
  ): Promise<void> {
    const ops = itemOrders.map(({ id, order }) =>
      this.prisma.agendaItem.update({
        where: { id, agendaGroupId },
        data: { order },
      })
    );

    if ('$transaction' in this.prisma) {
      await this.prisma.$transaction(ops);
    } else {
      await Promise.all(ops);
    }
  }

  async getMaxOrder(agendaGroupId: string): Promise<number> {
    const result = await this.prisma.agendaItem.aggregate({
      where: { agendaGroupId },
      _max: { order: true },
    });

    return result._max.order ?? -1;
  }

  async updateStatus(
    id: string,
    status: AgendaItemStatus
  ): Promise<AgendaItem> {
    const updateValidator = Prisma.validator<Prisma.AgendaItemUpdateArgs>()({
      where: { id },
      data: { status },
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
      },
    });

    return this.prisma.agendaItem.update(updateValidator);
  }

  async findByBoardMeetingId(
    boardMeetingId: string
  ): Promise<AgendaItemWithRelations[]> {
    const findManyValidator = Prisma.validator<Prisma.AgendaItemFindManyArgs>()(
      {
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
        },
        orderBy: [{ agendaGroup: { order: 'asc' } }, { order: 'asc' }],
      }
    );

    return this.prisma.agendaItem.findMany(findManyValidator);
  }
}
