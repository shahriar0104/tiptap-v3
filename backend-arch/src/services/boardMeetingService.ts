import { BoardMeeting, BoardMeetingStatus } from '@prisma/client';
import { withModels, withTransactionModels } from '../utils/transaction';
import type { CreateBoardMeetingData as ModelCreateData } from '../models/boardMeetingModel';
import {
  CreateBoardMeetingData,
  UpdateBoardMeetingData,
  PaginatedResponse,
} from '../types';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../utils/errors';

export interface BoardMeetingService {
  createBoardMeeting(
    data: CreateBoardMeetingData,
    createdById: string
  ): Promise<BoardMeeting>;
  getBoardMeetingById(
    id: string,
    userOrganizationId?: string
  ): Promise<BoardMeeting>;
  getBoardMeetings(
    organizationId?: string,
    status?: BoardMeetingStatus,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<BoardMeeting>>;
  updateBoardMeeting(
    id: string,
    data: UpdateBoardMeetingData,
    userOrganizationId?: string
  ): Promise<BoardMeeting>;
  deleteBoardMeeting(id: string, userOrganizationId?: string): Promise<void>;
  updateMeetingStatus(
    id: string,
    status: BoardMeetingStatus,
    userOrganizationId?: string
  ): Promise<BoardMeeting>;
}

export class BoardMeetingServiceImpl implements BoardMeetingService {
  constructor() {}

  async createBoardMeeting(
    data: CreateBoardMeetingData,
    createdById: string
  ): Promise<BoardMeeting> {
    // Validate meeting date is in the future if provided
    if (data.meetingDate && new Date(data.meetingDate) <= new Date()) {
      throw new ValidationError('Meeting date must be in the future');
    }

    // Convert to model data format
    const modelData: ModelCreateData = {
      title: data.title,
      description: data.description || undefined,
      meetingDate: data.meetingDate || undefined,
      organizationId: data.organizationId,
    };

    return withTransactionModels(async ({ models }) => {
      return models.boardMeetingModel.create(modelData, createdById);
    });
  }

  async getBoardMeetingById(
    id: string,
    userOrganizationId?: string
  ): Promise<BoardMeeting> {
    return withModels(async ({ models }) => {
      const meeting = await models.boardMeetingModel.findById(id);

      if (!meeting) {
        throw new NotFoundError('Board meeting not found');
      }

      // Check if user has access to this meeting (same organization)
      if (userOrganizationId && meeting.organizationId !== userOrganizationId) {
        throw new ForbiddenError('Access denied to this board meeting');
      }

      return meeting;
    });
  }

  async getBoardMeetings(
    organizationId?: string,
    status?: BoardMeetingStatus,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<BoardMeeting>> {
    const skip = (page - 1) * limit;

    return withModels(async ({ models }) => {
      const [meetings, total] = await Promise.all([
        models.boardMeetingModel.findMany(organizationId, status, skip, limit),
        models.boardMeetingModel.count(organizationId, status),
      ]);

      return {
        data: meetings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  async updateBoardMeeting(
    id: string,
    data: UpdateBoardMeetingData,
    userOrganizationId?: string
  ): Promise<BoardMeeting> {
    return withTransactionModels(async ({ models }) => {
      const existingMeeting = await models.boardMeetingModel.findById(id);

      if (!existingMeeting) {
        throw new NotFoundError('Board meeting not found');
      }

      // Check if user has access to this meeting
      if (
        userOrganizationId &&
        existingMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this board meeting');
      }

      // Validate meeting date if being updated
      if (data.meetingDate && new Date(data.meetingDate) <= new Date()) {
        throw new ValidationError('Meeting date must be in the future');
      }

      // Validate status transitions
      if (data.status) {
        this.validateStatusTransition(existingMeeting.status, data.status);
      }

      return models.boardMeetingModel.update(id, data);
    });
  }

  async deleteBoardMeeting(
    id: string,
    userOrganizationId?: string
  ): Promise<void> {
    return withTransactionModels(async ({ models }) => {
      const existingMeeting = await models.boardMeetingModel.findById(id);

      if (!existingMeeting) {
        throw new NotFoundError('Board meeting not found');
      }

      // Check if user has access to this meeting
      if (
        userOrganizationId &&
        existingMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this board meeting');
      }

      // Only allow deletion of draft meetings
      if (existingMeeting.status !== 'DRAFT') {
        throw new ValidationError('Only draft meetings can be deleted');
      }

      await models.boardMeetingModel.delete(id);
    });
  }

  async updateMeetingStatus(
    id: string,
    status: BoardMeetingStatus,
    userOrganizationId?: string
  ): Promise<BoardMeeting> {
    return withTransactionModels(async ({ models }) => {
      const existingMeeting = await models.boardMeetingModel.findById(id);

      if (!existingMeeting) {
        throw new NotFoundError('Board meeting not found');
      }

      // Check if user has access to this meeting
      if (
        userOrganizationId &&
        existingMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this board meeting');
      }

      // Validate status transition
      this.validateStatusTransition(existingMeeting.status, status);

      return models.boardMeetingModel.update(id, { status });
    });
  }

  private validateStatusTransition(
    currentStatus: BoardMeetingStatus,
    newStatus: BoardMeetingStatus
  ): void {
    const validTransitions: Record<BoardMeetingStatus, BoardMeetingStatus[]> = {
      DRAFT: ['PUBLISHED', 'ARCHIVED'],
      PUBLISHED: ['ARCHIVED'],
      ARCHIVED: ['DRAFT'], // Can restore archived meetings to draft
    };

    const allowedTransitions = validTransitions[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
