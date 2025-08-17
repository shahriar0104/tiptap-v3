import { PrismaClient, Prisma, User, UserRole } from '@prisma/client';

export interface CreateUserData {
  id?: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: UserRole;
  isActive?: boolean;
  organizationId: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  avatar?: string;
  role?: UserRole;
  isActive?: boolean;
  organizationId?: string;
}

export interface UserModel {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<User>;
  findByOrganizationId(organizationId: string): Promise<User[]>;
  findActiveUsers(): Promise<User[]>;
}

export class UserModelImpl implements UserModel {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async findById(id: string): Promise<User | null> {
    const findByIdValidator = Prisma.validator<Prisma.UserFindUniqueArgs>()({
      where: { id },
    });

    return this.prisma.user.findUnique(findByIdValidator);
  }

  async findByEmail(email: string): Promise<User | null> {
    const findByEmailValidator = Prisma.validator<Prisma.UserFindUniqueArgs>()({
      where: { email },
    });

    return this.prisma.user.findUnique(findByEmailValidator);
  }

  async create(data: CreateUserData): Promise<User> {
    const createValidator = Prisma.validator<Prisma.UserCreateArgs>()({
      data: {
        id: data.id!,
        email: data.email,
        name: data.name ?? null,
        avatar: data.avatar ?? null,
        ...(data.role !== undefined && { role: data.role }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        organizationId: data.organizationId,
      },
    });

    return this.prisma.user.create(createValidator);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const updateData: Record<string, unknown> = {};

    if (data.email !== undefined) updateData['email'] = data.email;
    if (data.name !== undefined) updateData['name'] = data.name;
    if (data.avatar !== undefined) updateData['avatar'] = data.avatar;
    if (data.role !== undefined) updateData['role'] = data.role;
    if (data.isActive !== undefined) updateData['isActive'] = data.isActive;
    if (data.organizationId !== undefined)
      updateData['organizationId'] = data.organizationId;

    const updateValidator = Prisma.validator<Prisma.UserUpdateArgs>()({
      where: { id },
      data: updateData as Prisma.UserUpdateInput,
    });

    return this.prisma.user.update(updateValidator);
  }

  async delete(id: string): Promise<User> {
    const deleteValidator = Prisma.validator<Prisma.UserDeleteArgs>()({
      where: { id },
    });

    return this.prisma.user.delete(deleteValidator);
  }

  async findByOrganizationId(organizationId: string): Promise<User[]> {
    const findManyValidator = Prisma.validator<Prisma.UserFindManyArgs>()({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return this.prisma.user.findMany(findManyValidator);
  }

  async findActiveUsers(): Promise<User[]> {
    const findManyValidator = Prisma.validator<Prisma.UserFindManyArgs>()({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return this.prisma.user.findMany(findManyValidator);
  }
}

