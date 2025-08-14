import { Organization, Prisma } from '@prisma/client';
import prisma from '../config/database';

export class OrganizationModel {
  async create(data: Prisma.OrganizationCreateInput): Promise<Organization> {
    return prisma.organization.create({
      data,
    });
  }

  async findById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Organization | null> {
    return prisma.organization.findFirst({
      where: { name },
    });
  }

  async update(id: string, data: Prisma.OrganizationUpdateInput): Promise<Organization> {
    return prisma.organization.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Organization> {
    return prisma.organization.delete({
      where: { id },
    });
  }

  async findAll(): Promise<Organization[]> {
    return prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
