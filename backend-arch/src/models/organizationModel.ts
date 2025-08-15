import { PrismaClient, Organization, Prisma } from '@prisma/client';

export interface OrganizationModel {
  create(data: Prisma.OrganizationCreateInput): Promise<Organization>;
  findById(id: string): Promise<Organization | null>;
  findByName(name: string): Promise<Organization | null>;
  update(
    id: string,
    data: Prisma.OrganizationUpdateInput
  ): Promise<Organization>;
  delete(id: string): Promise<Organization>;
  findAll(): Promise<Organization[]>;
}

export class OrganizationModelImpl implements OrganizationModel {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async create(data: Prisma.OrganizationCreateInput): Promise<Organization> {
    return this.prisma.organization.create({
      data,
    });
  }

  async findById(id: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Organization | null> {
    return this.prisma.organization.findFirst({
      where: { name },
    });
  }

  async update(
    id: string,
    data: Prisma.OrganizationUpdateInput
  ): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Organization> {
    return this.prisma.organization.delete({
      where: { id },
    });
  }

  async findAll(): Promise<Organization[]> {
    return this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
