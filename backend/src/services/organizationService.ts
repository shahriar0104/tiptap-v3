import database from '../config/database.js';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middleware/errorHandler.js';
import { 
  ServiceResponse, 
  Organization, 
  User, 
  UserRole,
  OrganizationWithUsers,
  OrganizationWithBoardMeetings
} from '../types/index.js';

interface CreateOrganizationData {
  name: string;
  slug: string;
  domain?: string;
  description?: string;
}

interface AdminUserData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AddUserData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
}

class OrganizationService {
  private _prisma: PrismaClient | null = null;

  // Lazy-load the Prisma client
  private get prisma(): PrismaClient {
    if (!this._prisma) {
      this._prisma = database.getClient();
    }
    return this._prisma;
  }

  /**
   * Create a new organization and assign user as admin
   */
  async createOrganization(
    organizationData: CreateOrganizationData,
    userId: string
  ): Promise<ServiceResponse<{ organization: Organization; user: User }>> {
    try {
      // Generate unique slug from organization name
      const baseSlug = organizationData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      let slug = organizationData.slug || baseSlug;
      let counter = 1;

      // Ensure slug is unique
      while (await this.prisma.organization.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Create organization and update user in a transaction
      const result = await database.transaction(async (tx) => {
        // Create organization
        const organization = await tx.organization.create({
          data: {
            name: organizationData.name,
            slug,
            domain: organizationData.domain || null,
            description: organizationData.description || null,
          },
        });

        // Update user to be admin of this organization
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            role: UserRole.ADMIN,
            organizationId: organization.id,
          },
          include: {
            organization: true,
          },
        });

        return { organization, user };
      });

      return {
        success: true,
        data: result,
        message: 'Organization created successfully',
      };
    } catch (error) {
      console.error('Error creating organization:', error);
      throw new ApiError('Failed to create organization', 500);
    }
  }

  /**
   * Add a new user to an existing organization
   */
  async addUserToOrganization(
    organizationId: string,
    userData: AddUserData,
    role: UserRole = UserRole.MEMBER
  ): Promise<ServiceResponse<User>> {
    try {
      // Check if organization exists
      const organization = await this.prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new ApiError('Organization not found', 404);
      }

      // Check if user already exists in any organization
      const existingUser = await this.prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new ApiError('User already exists in another organization', 409);
      }

      // Create new user
      const user = await this.prisma.user.create({
        data: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar || null,
          role: userData.role,
          organizationId,
        },
        include: {
          organization: true,
        },
      });

      return {
        success: true,
        data: user,
        message: 'User added to organization successfully',
      };
    } catch (error) {
      console.error('Error adding user to organization:', error);
      throw error;
    }
  }

  /**
   * Get organization by ID with users
   */
  async getOrganizationById(id: string): Promise<ServiceResponse<OrganizationWithUsers>> {
    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
              role: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!organization) {
        throw new ApiError('Organization not found', 404);
      }

      return {
        success: true,
        data: organization as OrganizationWithUsers,
        message: 'Organization retrieved successfully',
      };
    } catch (error) {
      console.error('Error getting organization by ID:', error);
      throw error;
    }
  }

  /**
   * Get organization by slug
   */
  async getOrganizationBySlug(slug: string): Promise<ServiceResponse<Organization>> {
    try {
      const organization = await this.prisma.organization.findUnique({
        where: { slug },
      });

      if (!organization) {
        throw new ApiError('Organization not found', 404);
      }

      return {
        success: true,
        data: organization,
        message: 'Organization retrieved successfully',
      };
    } catch (error) {
      console.error('Error getting organization by slug:', error);
      throw error;
    }
  }

  /**
   * Update organization
   */
  async updateOrganization(
    id: string,
    updateData: Partial<CreateOrganizationData>,
    userId: string
  ): Promise<ServiceResponse<Organization>> {
    try {
      // Check if user is admin of this organization
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true, role: true },
      });

      if (!user || user.organizationId !== id || user.role !== UserRole.ADMIN) {
        throw new ApiError('Permission denied: Only organization admins can update organization', 403);
      }

      // If slug is being updated, ensure it's unique
      if (updateData.slug) {
        const existingOrg = await this.prisma.organization.findUnique({
          where: { slug: updateData.slug },
        });

        if (existingOrg && existingOrg.id !== id) {
          throw new ApiError('Organization slug already exists', 409);
        }
      }

      const updatedOrganization = await this.prisma.organization.update({
        where: { id },
        data: updateData,
      });

      return {
        success: true,
        data: updatedOrganization,
        message: 'Organization updated successfully',
      };
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  }

  /**
   * Delete organization (admin only)
   */
  async deleteOrganization(id: string, userId: string): Promise<ServiceResponse> {
    try {
      // Check if user is admin of this organization
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true, role: true },
      });

      if (!user || user.organizationId !== id || user.role !== UserRole.ADMIN) {
        throw new ApiError('Permission denied: Only organization admins can delete organization', 403);
      }

      await this.prisma.organization.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Organization deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(
    organizationId: string,
    userIdToRemove: string,
    adminUserId: string
  ): Promise<ServiceResponse> {
    try {
      // Check if admin user has permission
      const adminUser = await this.prisma.user.findUnique({
        where: { id: adminUserId },
        select: { organizationId: true, role: true },
      });

      if (!adminUser || adminUser.organizationId !== organizationId || adminUser.role !== UserRole.ADMIN) {
        throw new ApiError('Permission denied: Only organization admins can remove users', 403);
      }

      // Cannot remove yourself if you're the only admin
      if (adminUserId === userIdToRemove) {
        const adminCount = await this.prisma.user.count({
          where: {
            organizationId,
            role: UserRole.ADMIN,
          },
        });

        if (adminCount <= 1) {
          throw new ApiError('Cannot remove the last admin from organization', 400);
        }
      }

      // Remove user from organization
      await this.prisma.user.update({
        where: { id: userIdToRemove },
        data: {
          organizationId: null,
          role: UserRole.MEMBER,
        },
      });

      return {
        success: true,
        message: 'User removed from organization successfully',
      };
    } catch (error) {
      console.error('Error removing user from organization:', error);
      throw error;
    }
  }

  /**
   * Update user role in organization
   */
  async updateUserRole(
    organizationId: string,
    userIdToUpdate: string,
    newRole: UserRole,
    adminUserId: string
  ): Promise<ServiceResponse<User>> {
    try {
      // Check if admin user has permission
      const adminUser = await this.prisma.user.findUnique({
        where: { id: adminUserId },
        select: { organizationId: true, role: true },
      });

      if (!adminUser || adminUser.organizationId !== organizationId || adminUser.role !== UserRole.ADMIN) {
        throw new ApiError('Permission denied: Only organization admins can update user roles', 403);
      }

      // Cannot demote yourself if you're the only admin
      if (adminUserId === userIdToUpdate && newRole !== UserRole.ADMIN) {
        const adminCount = await this.prisma.user.count({
          where: {
            organizationId,
            role: UserRole.ADMIN,
          },
        });

        if (adminCount <= 1) {
          throw new ApiError('Cannot demote the last admin in organization', 400);
        }
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: userIdToUpdate },
        data: { role: newRole },
        include: {
          organization: true,
        },
      });

      return {
        success: true,
        data: updatedUser,
        message: 'User role updated successfully',
      };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }
}

export default new OrganizationService();
