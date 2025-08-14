import { Prisma, User } from '@prisma/client';
import prisma from '../config/database';
import { CreateUserData } from '../types';

export class UserModel {
  async findById(id: string): Promise<User | null> {
    const findByIdValidator = Prisma.validator<Prisma.UserFindUniqueArgs>()({
      where: { id },
    });

    return prisma.user.findUnique(findByIdValidator);
  }

  async findByEmail(email: string): Promise<User | null> {
    const findByEmailValidator = Prisma.validator<Prisma.UserFindUniqueArgs>()({
      where: { email },
    });

    return prisma.user.findUnique(findByEmailValidator);
  }

  async create(data: CreateUserData): Promise<User> {
    const createValidator = Prisma.validator<Prisma.UserCreateArgs>()({
      data: {
        email: data.email,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        organizationId: data.organizationId || null,
      },
    });

    return prisma.user.create(createValidator);
  }

  async update(id: string, data: Partial<CreateUserData>): Promise<User> {
    const updateData: Record<string, unknown> = {};
    
    if (data.firstName !== undefined) updateData['firstName'] = data.firstName;
    if (data.lastName !== undefined) updateData['lastName'] = data.lastName;
    if (data.organizationId !== undefined) updateData['organizationId'] = data.organizationId;

    const updateValidator = Prisma.validator<Prisma.UserUpdateArgs>()({
      where: { id },
      data: updateData as Prisma.UserUpdateInput,
    });

    return prisma.user.update(updateValidator);
  }

  async delete(id: string): Promise<User> {
    const deleteValidator = Prisma.validator<Prisma.UserDeleteArgs>()({
      where: { id },
    });

    return prisma.user.delete(deleteValidator);
  }

  async findByOrganizationId(organizationId: string): Promise<User[]> {
    const findManyValidator = Prisma.validator<Prisma.UserFindManyArgs>()({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return prisma.user.findMany(findManyValidator);
  }
}
