import { PrismaClient, Prisma, Presentation } from '@prisma/client';
import { CreatePresentationData, UpdatePresentationData } from '../types';

export interface PresentationModel {
  create(data: CreatePresentationData): Promise<Presentation>;
  findById(id: string): Promise<Presentation | null>;
  findByBoardMeeting(boardMeetingId: string): Promise<Presentation[]>;
  update(id: string, data: UpdatePresentationData): Promise<Presentation>;
  delete(id: string): Promise<void>;
}

export class PresentationModelImpl implements PresentationModel {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreatePresentationData): Promise<Presentation> {
    const createValidator = Prisma.validator<Prisma.PresentationCreateArgs>()({
      data: {
        boardMeeting: {
          connect: { id: data.boardMeetingId }
        },
        ...(data.createdById && {
          createdBy: {
            connect: { id: data.createdById }
          }
        })
      },
      include: {
        boardMeeting: {
          select: {
            id: true,
            title: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        slides: {
          orderBy: { orderIndex: 'asc' },
          include: {
            agendaItem: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        }
      }
    });

    return this.prisma.presentation.create(createValidator);
  }

  async findById(id: string): Promise<Presentation | null> {
    const findByIdValidator = Prisma.validator<Prisma.PresentationFindUniqueArgs>()({
      where: { id },
      include: {
        boardMeeting: {
          select: {
            id: true,
            title: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        slides: {
          orderBy: { orderIndex: 'asc' },
          include: {
            agendaItem: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        }
      }
    });

    return this.prisma.presentation.findUnique(findByIdValidator);
  }

  async findByBoardMeeting(boardMeetingId: string): Promise<Presentation[]> {
    const findByBoardMeetingValidator = Prisma.validator<Prisma.PresentationFindManyArgs>()({
      where: { boardMeetingId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        _count: {
          select: {
            slides: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return this.prisma.presentation.findMany(findByBoardMeetingValidator);
  }

  async update(id: string, _data: UpdatePresentationData): Promise<Presentation> {
    const updateValidator = Prisma.validator<Prisma.PresentationUpdateArgs>()({
      where: { id },
      data: {
        // Currently no updatable fields in the schema, but keeping for future extensibility
      },
      include: {
        boardMeeting: {
          select: {
            id: true,
            title: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        slides: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return this.prisma.presentation.update(updateValidator);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.presentation.delete({
      where: { id }
    });
  }
}
