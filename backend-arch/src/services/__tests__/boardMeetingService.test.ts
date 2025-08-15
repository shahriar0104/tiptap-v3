import { BoardMeetingServiceImpl } from '../boardMeetingService';
import type { BoardMeetingModel } from '../../models/boardMeetingModel';
import type { OrganizationModel } from '../../models/organizationModel';
import type { UserModel } from '../../models/userModel';
import { NotFoundError, ForbiddenError, ValidationError } from '../../utils/errors';
import { BoardMeeting, BoardMeetingStatus } from '@prisma/client';

describe('BoardMeetingService', () => {
  let boardMeetingService: BoardMeetingServiceImpl;
  let mockBoardMeetingModel: jest.Mocked<BoardMeetingModel>;
  let mockOrganizationModel: Partial<OrganizationModel>;
  let mockUserModel: Partial<UserModel>;

  const mockBoardMeeting: BoardMeeting = {
    id: 'meeting-1',
    title: 'Test Meeting',
    description: 'Test Description',
    meetingDate: new Date('2026-12-31T10:00:00Z'),
    status: BoardMeetingStatus.DRAFT,
    organizationId: 'org-1',
    createdById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockBoardMeetingModel = {
      findById: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn() as any,
      findByOrganizationId: jest.fn(),
    } as unknown as jest.Mocked<BoardMeetingModel>;

    mockOrganizationModel = {} as Partial<OrganizationModel>;
    mockUserModel = {} as Partial<UserModel>;

    boardMeetingService = new BoardMeetingServiceImpl(
      mockBoardMeetingModel,
      mockOrganizationModel as OrganizationModel,
      mockUserModel as UserModel
    );
    jest.clearAllMocks();
  });

  describe('createBoardMeeting', () => {
    it('should create board meeting successfully', async () => {
      const createData = {
        title: 'Test Meeting',
        description: 'Test Description',
        meetingDate: new Date('2026-12-31T10:00:00Z'),
        organizationId: 'org-1',
      };

      mockBoardMeetingModel.create.mockResolvedValue(mockBoardMeeting);

      const result = await boardMeetingService.createBoardMeeting(createData, 'user-1');

      expect(result).toEqual(mockBoardMeeting);
      expect(mockBoardMeetingModel.create).toHaveBeenCalledWith(createData, 'user-1');
    });

    it('should throw ValidationError for past scheduled date', async () => {
      const createData = {
        title: 'Test Meeting',
        meetingDate: new Date('2020-01-01T10:00:00Z'), // Past date
        organizationId: 'org-1',
      };

      await expect(
        boardMeetingService.createBoardMeeting(createData, 'user-1')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getBoardMeetingById', () => {
    it('should return board meeting when user has access', async () => {
      mockBoardMeetingModel.findById.mockResolvedValue(mockBoardMeeting);

      const result = await boardMeetingService.getBoardMeetingById('meeting-1', 'org-1');

      expect(result).toEqual(mockBoardMeeting);
      expect(mockBoardMeetingModel.findById).toHaveBeenCalledWith('meeting-1');
    });

    it('should throw NotFoundError when meeting does not exist', async () => {
      mockBoardMeetingModel.findById.mockResolvedValue(null);

      await expect(
        boardMeetingService.getBoardMeetingById('meeting-1', 'org-1')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user does not have access', async () => {
      mockBoardMeetingModel.findById.mockResolvedValue(mockBoardMeeting);

      await expect(
        boardMeetingService.getBoardMeetingById('meeting-1', 'org-2')
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('updateMeetingStatus', () => {
    it('should update status successfully with valid transition', async () => {
      const updatedMeeting = { ...mockBoardMeeting, status: BoardMeetingStatus.PUBLISHED };

      mockBoardMeetingModel.findById.mockResolvedValue(mockBoardMeeting);
      mockBoardMeetingModel.update.mockResolvedValue(updatedMeeting);

      const result = await boardMeetingService.updateMeetingStatus(
        'meeting-1',
        BoardMeetingStatus.PUBLISHED,
        'org-1'
      );

      expect(result).toEqual(updatedMeeting);
      expect(mockBoardMeetingModel.update).toHaveBeenCalledWith('meeting-1', { status: BoardMeetingStatus.PUBLISHED });
    });

    it('should throw ValidationError for invalid status transition', async () => {
      const archivedMeeting = { ...mockBoardMeeting, status: BoardMeetingStatus.ARCHIVED };
      mockBoardMeetingModel.findById.mockResolvedValue(archivedMeeting);

      await expect(
        boardMeetingService.updateMeetingStatus('meeting-1', BoardMeetingStatus.PUBLISHED, 'org-1')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteBoardMeeting', () => {
    it('should delete scheduled meeting successfully', async () => {
      mockBoardMeetingModel.findById.mockResolvedValue({ ...mockBoardMeeting, status: BoardMeetingStatus.DRAFT });
      mockBoardMeetingModel.delete.mockResolvedValue(mockBoardMeeting);

      await boardMeetingService.deleteBoardMeeting('meeting-1', 'org-1');

      expect(mockBoardMeetingModel.delete).toHaveBeenCalledWith('meeting-1');
    });

    it('should throw ValidationError when trying to delete non-scheduled meeting', async () => {
      const publishedMeeting = { ...mockBoardMeeting, status: BoardMeetingStatus.PUBLISHED };
      mockBoardMeetingModel.findById.mockResolvedValue(publishedMeeting);

      await expect(
        boardMeetingService.deleteBoardMeeting('meeting-1', 'org-1')
      ).rejects.toThrow(ValidationError);
    });
  });
});
