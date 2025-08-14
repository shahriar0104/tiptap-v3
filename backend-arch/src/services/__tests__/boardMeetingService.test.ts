import { BoardMeetingService } from '../boardMeetingService';
import { BoardMeetingModel } from '../../models/boardMeetingModel';
import { NotFoundError, ForbiddenError, ValidationError } from '../../utils/errors';
import { BoardMeeting, BoardMeetingStatus } from '@prisma/client';

// Mock the BoardMeetingModel
jest.mock('../../models/boardMeetingModel');

const MockedBoardMeetingModel = BoardMeetingModel as jest.MockedClass<typeof BoardMeetingModel>;

describe('BoardMeetingService', () => {
  let boardMeetingService: BoardMeetingService;
  let mockBoardMeetingModel: jest.Mocked<BoardMeetingModel>;

  const mockBoardMeeting: BoardMeeting = {
    id: 'meeting-1',
    title: 'Test Meeting',
    description: 'Test Description',
    scheduledAt: new Date('2024-12-31T10:00:00Z'),
    duration: 60,
    location: 'Conference Room A',
    status: 'SCHEDULED',
    organizationId: 'org-1',
    createdById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockBoardMeetingModel = new MockedBoardMeetingModel() as jest.Mocked<BoardMeetingModel>;
    boardMeetingService = new BoardMeetingService(mockBoardMeetingModel);
    jest.clearAllMocks();
  });

  describe('createBoardMeeting', () => {
    it('should create board meeting successfully', async () => {
      const createData = {
        title: 'Test Meeting',
        description: 'Test Description',
        scheduledAt: new Date('2026-12-31T10:00:00Z'),
        duration: 60,
        location: 'Conference Room A',
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
        scheduledAt: new Date('2020-01-01T10:00:00Z'), // Past date
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
      const updatedMeeting = { ...mockBoardMeeting, status: 'IN_PROGRESS' as BoardMeetingStatus };

      mockBoardMeetingModel.findById.mockResolvedValue(mockBoardMeeting);
      mockBoardMeetingModel.update.mockResolvedValue(updatedMeeting);

      const result = await boardMeetingService.updateMeetingStatus(
        'meeting-1',
        'IN_PROGRESS',
        'org-1'
      );

      expect(result).toEqual(updatedMeeting);
      expect(mockBoardMeetingModel.update).toHaveBeenCalledWith('meeting-1', { status: 'IN_PROGRESS' });
    });

    it('should throw ValidationError for invalid status transition', async () => {
      const completedMeeting = { ...mockBoardMeeting, status: 'COMPLETED' as BoardMeetingStatus };
      mockBoardMeetingModel.findById.mockResolvedValue(completedMeeting);

      await expect(
        boardMeetingService.updateMeetingStatus('meeting-1', 'IN_PROGRESS', 'org-1')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteBoardMeeting', () => {
    it('should delete scheduled meeting successfully', async () => {
      mockBoardMeetingModel.findById.mockResolvedValue(mockBoardMeeting);
      mockBoardMeetingModel.delete.mockResolvedValue(mockBoardMeeting);

      await boardMeetingService.deleteBoardMeeting('meeting-1', 'org-1');

      expect(mockBoardMeetingModel.delete).toHaveBeenCalledWith('meeting-1');
    });

    it('should throw ValidationError when trying to delete non-scheduled meeting', async () => {
      const completedMeeting = { ...mockBoardMeeting, status: 'COMPLETED' as BoardMeetingStatus };
      mockBoardMeetingModel.findById.mockResolvedValue(completedMeeting);

      await expect(
        boardMeetingService.deleteBoardMeeting('meeting-1', 'org-1')
      ).rejects.toThrow(ValidationError);
    });
  });
});
