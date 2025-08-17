import { PrismaClient, Prisma } from '@prisma/client';

export interface CreateAgendaItemDocumentData {
  agendaItemId: string;
  uploadId: string;
  role?: 'CONTEXT' | 'FIGURE' | 'APPENDIX';
}

export interface AgendaItemDocumentModel {
  create(data: CreateAgendaItemDocumentData): Promise<AgendaItemDocumentWithRelations>;
  findById(id: string): Promise<AgendaItemDocumentWithRelations | null>;
  findByAgendaItemId(agendaItemId: string): Promise<AgendaItemDocumentWithRelations[]>;
  delete(id: string): Promise<void>;
}

export type AgendaItemDocumentWithRelations = Prisma.AgendaItemDocumentGetPayload<{
  include: {
    upload: true;
    agendaItem: {
      select: { id: true; title: true; agendaGroupId: true };
    };
  };
}>;

export class AgendaItemDocumentModelImpl implements AgendaItemDocumentModel {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async create(
    data: CreateAgendaItemDocumentData
  ): Promise<AgendaItemDocumentWithRelations> {
    const createValidator =
      Prisma.validator<Prisma.AgendaItemDocumentCreateArgs>()({
        data: {
          agendaItem: { connect: { id: data.agendaItemId } },
          upload: { connect: { id: data.uploadId } },
          ...(data.role ? { role: data.role } : {}),
        },
        include: {
          upload: true,
          agendaItem: {
            select: { id: true, title: true, agendaGroupId: true },
          },
        },
      });

    return this.prisma.agendaItemDocument.create(createValidator);
  }

  async findById(id: string): Promise<AgendaItemDocumentWithRelations | null> {
    const findValidator =
      Prisma.validator<Prisma.AgendaItemDocumentFindUniqueArgs>()({
        where: { id },
        include: {
          upload: true,
          agendaItem: { select: { id: true, title: true, agendaGroupId: true } },
        },
      });

    return this.prisma.agendaItemDocument.findUnique(findValidator);
  }

  async findByAgendaItemId(
    agendaItemId: string
  ): Promise<AgendaItemDocumentWithRelations[]> {
    const findManyValidator =
      Prisma.validator<Prisma.AgendaItemDocumentFindManyArgs>()({
        where: { agendaItemId },
        include: {
          upload: true,
          agendaItem: { select: { id: true, title: true, agendaGroupId: true } },
        },
        orderBy: { role: 'asc' },
      });

    return this.prisma.agendaItemDocument.findMany(findManyValidator);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.agendaItemDocument.delete({ where: { id } });
  }
}
