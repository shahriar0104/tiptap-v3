import { UserModel } from '../userModel';
import { User, UserRole } from '@prisma/client';

// Mock Prisma client
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import prisma from '../../config/database';

const mockPrisma = prisma as any;

describe('UserModel', () => {
  let userModel: UserModel;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'John Doe',
    avatar: null,
    role: UserRole.MEMBER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    userModel = new UserModel();
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userModel.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await userModel.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userModel.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const createData = {
        id: 'user-1',
        email: 'new@example.com',
        name: 'Jane Smith',
        role: UserRole.MEMBER,
        isActive: true,
      };

      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await userModel.create(createData);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          id: createData.id,
          email: createData.email,
          name: createData.name,
          avatar: null,
          role: createData.role,
          isActive: createData.isActive,
        },
      });
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateData = {
        name: 'Jane Smith',
        avatar: 'https://cdn.example.com/avatar.png',
      };

      const updatedUser = { ...mockUser, ...updateData } as User;
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await userModel.update('user-1', updateData);

      expect(result).toEqual(updatedUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: updateData,
      });
    });
  });

  describe('findByOrganizationId', () => {
    it('should find users by organization id', async () => {
      const orgUsers = [mockUser, { ...mockUser, id: 'user-2' } as User];
      mockPrisma.user.findMany.mockResolvedValue(orgUsers);

      const result = await userModel.findByOrganizationId('org-1');

      expect(result).toEqual(orgUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          memberships: {
            some: {
              organizationId: 'org-1',
            },
          },
        },
        include: {
          memberships: {
            where: {
              organizationId: 'org-1',
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
