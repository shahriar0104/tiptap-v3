import { AuthService } from '../authService';
import { UserModel } from '../../models/userModel';
import { OrganizationModel } from '../../models/organizationModel';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { User, UserRole } from '@prisma/client';

// Mock the UserModel
jest.mock('../../models/userModel');
jest.mock('../../models/organizationModel');
jest.mock('../../config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

const MockedUserModel = UserModel as jest.MockedClass<typeof UserModel>;
const MockedOrganizationModel = OrganizationModel as jest.MockedClass<typeof OrganizationModel>;

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserModel: jest.Mocked<UserModel>;
  let mockOrganizationModel: jest.Mocked<OrganizationModel>;

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
    mockUserModel = new MockedUserModel() as jest.Mocked<UserModel>;
    mockOrganizationModel = new MockedOrganizationModel() as jest.Mocked<OrganizationModel>;
    authService = new AuthService(mockUserModel, mockOrganizationModel);
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return user when user exists', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser('user-1');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith('user-1');
    });

    it('should throw NotFoundError when user does not exist', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(authService.getCurrentUser('user-1')).rejects.toThrow(NotFoundError);
      expect(mockUserModel.findById).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updateData = { name: 'Jane Smith' };
      const updatedUser = { ...mockUser, ...updateData };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.update.mockResolvedValue(updatedUser);

      const result = await authService.updateUserProfile('user-1', updateData);

      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith('user-1');
      expect(mockUserModel.update).toHaveBeenCalledWith('user-1', updateData);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(
        authService.updateUserProfile('user-1', { name: 'Jane' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError when email already exists', async () => {
      const updateData = { email: 'existing@example.com' };
      const existingUser = { ...mockUser, id: 'user-2' };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.findByEmail.mockResolvedValue(existingUser);

      await expect(
        authService.updateUserProfile('user-1', updateData)
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('getUsersByOrganization', () => {
    it('should return users from organization', async () => {
      const orgUsers = [mockUser, { ...mockUser, id: 'user-2' }];
      mockUserModel.findByOrganizationId.mockResolvedValue(orgUsers);

      const result = await authService.getUsersByOrganization('org-1');

      expect(result).toEqual(orgUsers);
      expect(mockUserModel.findByOrganizationId).toHaveBeenCalledWith('org-1');
    });
  });
});
