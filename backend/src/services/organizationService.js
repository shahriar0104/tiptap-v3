import database from '../config/database.js';
import {ApiError} from '../middleware/errorHandler.js';

class OrganizationService {
  constructor() {
    this._prisma = null;
  }

  // Lazy-load the Prisma client
  get prisma() {
    if (!this._prisma) {
      this._prisma = database.getClient();
    }
    return this._prisma;
  }

  /**
   * Create a new organization with the first admin user (Supabase Auth)
   */
  async createOrganization({ name, domain, description, adminUser }) {
    try {
      // Generate unique slug from organization name
      const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      let slug = baseSlug;
      let counter = 1;

      // Ensure slug is unique
      while (await this.prisma.organization.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Create organization and admin user in a transaction
      const result = await database.transaction(async (tx) => {
        // Create organization
        const organization = await tx.organization.create({
          data: {
            name,
            slug,
            domain,
            description,
          },
        });

        // Create an admin user (using Supabase user ID)
        const user = await tx.user.create({
          data: {
            id: adminUser.id, // Use Supabase user ID
            email: adminUser.email,
            name: adminUser.name,
            avatar: adminUser.avatar,
            role: 'ADMIN',
            organizationId: organization.id,
          },
        });

        return { organization, user };
      });

      return result;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw new ApiError('Failed to create organization', 500);
    }
  }

  /**
   * Add a new user to an existing organization
   */
  async addUserToOrganization({ organizationId, userData, role = 'MEMBER' }) {
    try {
      // Check if an organization exists
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
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar,
          role,
          organizationId,
        },
        include: {
          organization: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Error adding user to organization:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to add user to organization', 500);
    }
  }

  /**
   * Get organization by ID with users
   */
  async getOrganizationById(organizationId) {
    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: organizationId },
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
            },
          },
          _count: {
            select: {
              boardMeetings: true,
              users: true,
            },
          },
        },
      });

      if (!organization) {
        throw new ApiError('Organization not found', 404);
      }

      return organization;
    } catch (error) {
      console.error('Error fetching organization:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to fetch organization', 500);
    }
  }

  /**
   * Update organization details
   */
  async updateOrganization(organizationId, updateData) {
    try {
      const organization = await this.prisma.organization.update({
        where: { id: organizationId },
        data: updateData,
        include: {
          _count: {
            select: {
              users: true,
              boardMeetings: true,
            },
          },
        },
      });

      return organization;
    } catch (error) {
      console.error('Error updating organization:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to update organization', 500);
    }
  }

  /**
   * Update user role within organization
   */
  async updateUserRole(organizationId, userId, newRole) {
    try {
      // Verify user belongs to the organization
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          organizationId,
        },
      });

      if (!user) {
        throw new ApiError('User not found in this organization', 404);
      }

      // Update user role
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
        include: {
          organization: true,
        },
      });

      return updatedUser;
    } catch (error) {
      console.error('Error updating user role:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to update user role', 500);
    }
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(organizationId, userId) {
    try {
      // Verify user belongs to the organization
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          organizationId,
        },
      });

      if (!user) {
        throw new ApiError('User not found in this organization', 404);
      }

      // Don't allow removing the last admin
      if (user.role === 'ADMIN') {
        const adminCount = await this.prisma.user.count({
          where: {
            organizationId,
            role: 'ADMIN',
            isActive: true,
          },
        });

        if (adminCount <= 1) {
          throw new ApiError('Cannot remove the last admin from organization', 400);
        }
      }

      // Soft delete by setting isActive to false
      await this.prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing user from organization:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to remove user from organization', 500);
    }
  }
}

export default new OrganizationService();
