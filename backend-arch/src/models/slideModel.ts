import { PrismaClient, Prisma, Slide } from '@prisma/client';
import { CreateSlideData, UpdateSlideData } from '../types';

export interface SlideModel {
  create(data: CreateSlideData): Promise<Slide>;
  findById(id: string): Promise<Slide | null>;
  findByPresentation(presentationId: string): Promise<Slide[]>;
  findByAgendaItem(agendaItemId: string): Promise<Slide[]>;
  update(id: string, data: UpdateSlideData): Promise<Slide>;
  delete(id: string): Promise<void>;
  reorderSlides(presentationId: string, slideIds: string[]): Promise<void>;
}

export class SlideModelImpl implements SlideModel {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateSlideData): Promise<Slide> {
    const createValidator = Prisma.validator<Prisma.SlideCreateArgs>()({
      data: {
        presentation: {
          connect: { id: data.presentationId }
        },
        ...(data.agendaItemId && {
          agendaItem: {
            connect: { id: data.agendaItemId }
          }
        }),
        kind: data.kind,
        title: data.title ?? null,
        bodyJson: data.bodyJson,
        orderIndex: data.orderIndex
      },
      include: {
        presentation: {
          select: {
            id: true,
            boardMeetingId: true,
          }
        },
        agendaItem: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    return this.prisma.slide.create(createValidator);
  }

  async findById(id: string): Promise<Slide | null> {
    const findByIdValidator = Prisma.validator<Prisma.SlideFindUniqueArgs>()({
      where: { id },
      include: {
        presentation: {
          select: {
            id: true,
            boardMeetingId: true,
          }
        },
        agendaItem: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    return this.prisma.slide.findUnique(findByIdValidator);
  }

  async findByPresentation(presentationId: string): Promise<Slide[]> {
    const findByPresentationValidator = Prisma.validator<Prisma.SlideFindManyArgs>()({
      where: { presentationId },
      include: {
        agendaItem: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: { orderIndex: 'asc' }
    });

    return this.prisma.slide.findMany(findByPresentationValidator);
  }

  async findByAgendaItem(agendaItemId: string): Promise<Slide[]> {
    const findByAgendaItemValidator = Prisma.validator<Prisma.SlideFindManyArgs>()({
      where: { agendaItemId },
      include: {
        presentation: {
          select: {
            id: true,
            boardMeetingId: true,
          }
        }
      },
      orderBy: { orderIndex: 'asc' }
    });

    return this.prisma.slide.findMany(findByAgendaItemValidator);
  }

  async update(id: string, data: UpdateSlideData): Promise<Slide> {
    const updateValidator = Prisma.validator<Prisma.SlideUpdateArgs>()({
      where: { id },
      data: {
        ...(data.kind !== undefined && { kind: data.kind }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.bodyJson !== undefined && { bodyJson: data.bodyJson }),
        ...(data.orderIndex !== undefined && { orderIndex: data.orderIndex }),
        ...(data.agendaItemId !== undefined && data.agendaItemId !== null && {
          agendaItem: {
            connect: { id: data.agendaItemId }
          }
        }),
        ...(data.agendaItemId === null && {
          agendaItem: {
            disconnect: true
          }
        })
      },
      include: {
        presentation: {
          select: {
            id: true,
            boardMeetingId: true,
          }
        },
        agendaItem: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    return this.prisma.slide.update(updateValidator);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.slide.delete({
      where: { id }
    });
  }

  async reorderSlides(presentationId: string, slideIds: string[]): Promise<void> {
    // Use transaction to update all slide orders atomically
    await this.prisma.$transaction(
      slideIds.map((slideId, index) =>
        this.prisma.slide.update({
          where: { 
            id: slideId,
            presentationId // Ensure slide belongs to the presentation
          },
          data: { orderIndex: index + 1 }
        })
      )
    );
  }
}
