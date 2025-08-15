import { Prisma, OrgMember, OrgRole } from '@prisma/client';
import prisma from '../config/database';

export interface CreateOrgMemberData {
  organizationId: string;
  userId: string;
  role: OrgRole;
}

export interface UpdateOrgMemberData {
  role?: OrgRole;
}

export class OrgMemberModel {
  async findById(id: string): Promise<OrgMember | null> {
    const findByIdValidator = Prisma.validator<Prisma.OrgMemberFindUniqueArgs>()({
      where: { id },
      include: {
        user: true,
        organization: true,
      },
    });

    return prisma.orgMember.findUnique(findByIdValidator);
  }

  async findByUserAndOrganization(userId: string, organizationId: string): Promise<OrgMember | null> {
    const findUniqueValidator = Prisma.validator<Prisma.OrgMemberFindUniqueArgs>()({
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

    return prisma.orgMember.findUnique(findUniqueValidator);
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

    return prisma.orgMember.create(createValidator);
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

    return prisma.orgMember.update(updateValidator);
  }

  async delete(id: string): Promise<OrgMember> {
    const deleteValidator = Prisma.validator<Prisma.OrgMemberDeleteArgs>()({
      where: { id },
    });

    return prisma.orgMember.delete(deleteValidator);
  }

  async findByOrganizationId(organizationId: string): Promise<OrgMember[]> {
    const findManyValidator = Prisma.validator<Prisma.OrgMemberFindManyArgs>()({
      where: { organizationId },
      include: {
        user: true,
      },
      orderBy: { joinedAt: 'desc' },
    });

    return prisma.orgMember.findMany(findManyValidator);
  }

  async findByUserId(userId: string): Promise<OrgMember[]> {
    const findManyValidator = Prisma.validator<Prisma.OrgMemberFindManyArgs>()({
      where: { userId },
      include: {
        organization: true,
      },
      orderBy: { joinedAt: 'desc' },
    });

    return prisma.orgMember.findMany(findManyValidator);
  }

  async findByRole(organizationId: string, role: OrgRole): Promise<OrgMember[]> {
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

    return prisma.orgMember.findMany(findManyValidator);
  }

  async checkUserAccess(userId: string, organizationId: string, requiredRoles: OrgRole[]): Promise<boolean> {
    const member = await this.findByUserAndOrganization(userId, organizationId);
    return member ? requiredRoles.includes(member.role) : false;
  }
}
