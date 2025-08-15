import { PrismaClient, Prisma, OrgMember, OrgRole } from '@prisma/client';

export interface CreateOrgMemberData {
  organizationId: string;
  userId: string;
  role: OrgRole;
}

export interface UpdateOrgMemberData {
  role?: OrgRole;
}

export interface OrgMemberModel {
  findById(id: string): Promise<OrgMember | null>;
  findByUserAndOrganization(
    userId: string,
    organizationId: string
  ): Promise<OrgMember | null>;
  create(data: CreateOrgMemberData): Promise<OrgMember>;
  updateRole(id: string, role: OrgRole): Promise<OrgMember>;
  delete(id: string): Promise<OrgMember>;
  findByOrganizationId(organizationId: string): Promise<OrgMember[]>;
  findByUserId(userId: string): Promise<OrgMember[]>;
  findByRole(organizationId: string, role: OrgRole): Promise<OrgMember[]>;
  checkUserAccess(
    userId: string,
    organizationId: string,
    requiredRoles: OrgRole[]
  ): Promise<boolean>;
}

export class OrgMemberModelImpl implements OrgMemberModel {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async findById(id: string): Promise<OrgMember | null> {
    const findByIdValidator =
      Prisma.validator<Prisma.OrgMemberFindUniqueArgs>()({
        where: { id },
        include: {
          user: true,
          organization: true,
        },
      });

    return this.prisma.orgMember.findUnique(findByIdValidator);
  }

  async findByUserAndOrganization(
    userId: string,
    organizationId: string
  ): Promise<OrgMember | null> {
    const findUniqueValidator =
      Prisma.validator<Prisma.OrgMemberFindUniqueArgs>()({
        where: {
          organizationId_userId: {
            organizationId,
            userId,
          },
        },
        include: {
          user: true,
          organization: true,
        },
      });

    return this.prisma.orgMember.findUnique(findUniqueValidator);
  }

  async create(data: CreateOrgMemberData): Promise<OrgMember> {
    const createValidator = Prisma.validator<Prisma.OrgMemberCreateArgs>()({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        role: data.role,
      },
      include: {
        user: true,
        organization: true,
      },
    });

    return this.prisma.orgMember.create(createValidator);
  }

  async updateRole(id: string, role: OrgRole): Promise<OrgMember> {
    const updateValidator = Prisma.validator<Prisma.OrgMemberUpdateArgs>()({
      where: { id },
      data: {
        role,
      },
      include: {
        user: true,
        organization: true,
      },
    });

    return this.prisma.orgMember.update(updateValidator);
  }

  async delete(id: string): Promise<OrgMember> {
    const deleteValidator = Prisma.validator<Prisma.OrgMemberDeleteArgs>()({
      where: { id },
    });

    return this.prisma.orgMember.delete(deleteValidator);
  }

  async findByOrganizationId(organizationId: string): Promise<OrgMember[]> {
    const findManyValidator = Prisma.validator<Prisma.OrgMemberFindManyArgs>()({
      where: { organizationId },
      include: {
        user: true,
      },
      orderBy: { joinedAt: 'desc' },
    });

    return this.prisma.orgMember.findMany(findManyValidator);
  }

  async findByUserId(userId: string): Promise<OrgMember[]> {
    const findManyValidator = Prisma.validator<Prisma.OrgMemberFindManyArgs>()({
      where: { userId },
      include: {
        organization: true,
      },
      orderBy: { joinedAt: 'desc' },
    });

    return this.prisma.orgMember.findMany(findManyValidator);
  }

  async findByRole(
    organizationId: string,
    role: OrgRole
  ): Promise<OrgMember[]> {
    const findManyValidator = Prisma.validator<Prisma.OrgMemberFindManyArgs>()({
      where: {
        organizationId,
        role,
      },
      include: {
        user: true,
      },
      orderBy: { joinedAt: 'desc' },
    });

    return this.prisma.orgMember.findMany(findManyValidator);
  }

  async checkUserAccess(
    userId: string,
    organizationId: string,
    requiredRoles: OrgRole[]
  ): Promise<boolean> {
    const member = await this.findByUserAndOrganization(userId, organizationId);
    return member ? requiredRoles.includes(member.role) : false;
  }
}
