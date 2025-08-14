import { BoardMeeting, BoardMeetingStatus } from '@prisma/client';
import { BoardMeetingModel } from '../models/boardMeetingModel';
import { OrganizationModel } from '../models/organizationModel';
import { UserModel } from '../models/userModel';
import { CreateBoardMeetingData, UpdateBoardMeetingData, PaginatedResponse } from '../types';
import { NotFoundError, ForbiddenError, ValidationError, ConflictError } from '../utils/errors';
import { supabase } from '../config/supabase';

export class BoardMeetingService {
  constructor(
    private boardMeetingModel: BoardMeetingModel,
    private organizationModel: OrganizationModel,
    private userModel: UserModel
  ) {}

  async createBoardMeeting(
    data: CreateBoardMeetingData,
    createdById: string
  ): Promise<BoardMeeting> {
    // Validate scheduled date is in the future
    if (new Date(data.scheduledAt) <= new Date()) {
      throw new ValidationError('Scheduled date must be in the future');
    }

    return this.boardMeetingModel.create(data, createdById);
  }

  async getBoardMeetingById(id: string, userOrganizationId?: string): Promise<BoardMeeting> {
    const meeting = await this.boardMeetingModel.findById(id);
    
    if (!meeting) {
      throw new NotFoundError('Board meeting not found');
    }

    // Check if user has access to this meeting (same organization)
    if (userOrganizationId && meeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this board meeting');
    }

    return meeting;
  }

  async getBoardMeetings(
    organizationId?: string,
    status?: BoardMeetingStatus,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<BoardMeeting>> {
    const skip = (page - 1) * limit;
    
    const [meetings, total] = await Promise.all([
      this.boardMeetingModel.findMany(organizationId, status, skip, limit),
      this.boardMeetingModel.count(organizationId, status),
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
  }

  async updateBoardMeeting(
    id: string,
    data: UpdateBoardMeetingData,
    userOrganizationId?: string
  ): Promise<BoardMeeting> {
    const existingMeeting = await this.boardMeetingModel.findById(id);
    
    if (!existingMeeting) {
      throw new NotFoundError('Board meeting not found');
    }

    // Check if user has access to this meeting
    if (userOrganizationId && existingMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this board meeting');
    }

    // Validate scheduled date if being updated
    if (data.scheduledAt && new Date(data.scheduledAt) <= new Date()) {
      throw new ValidationError('Scheduled date must be in the future');
    }

    // Validate status transitions
    if (data.status) {
      this.validateStatusTransition(existingMeeting.status, data.status);
    }

    return this.boardMeetingModel.update(id, data);
  }

  async deleteBoardMeeting(id: string, userOrganizationId?: string): Promise<void> {
    const existingMeeting = await this.boardMeetingModel.findById(id);
    
    if (!existingMeeting) {
      throw new NotFoundError('Board meeting not found');
    }

    // Check if user has access to this meeting
    if (userOrganizationId && existingMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this board meeting');
    }

    // Only allow deletion of scheduled meetings
    if (existingMeeting.status !== 'SCHEDULED') {
      throw new ValidationError('Only scheduled meetings can be deleted');
    }

    await this.boardMeetingModel.delete(id);
  }

  async getBoardMeetingsByOrganization(organizationId: string): Promise<BoardMeeting[]> {
    return this.boardMeetingModel.findByOrganizationId(organizationId);
  }

  async updateMeetingStatus(
    id: string,
    status: BoardMeetingStatus,
    userOrganizationId?: string
  ): Promise<BoardMeeting> {
    const existingMeeting = await this.boardMeetingModel.findById(id);
    
    if (!existingMeeting) {
      throw new NotFoundError('Board meeting not found');
    }

    // Check if user has access to this meeting
    if (userOrganizationId && existingMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this board meeting');
    }

    // Validate status transition
    this.validateStatusTransition(existingMeeting.status, status);

    return this.boardMeetingModel.update(id, { status });
  }

  private validateStatusTransition(currentStatus: BoardMeetingStatus, newStatus: BoardMeetingStatus): void {
    const validTransitions: Record<BoardMeetingStatus, BoardMeetingStatus[]> = {
      SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [], // No transitions allowed from completed
      CANCELLED: ['SCHEDULED'], // Can reschedule cancelled meetings
    };

    const allowedTransitions = validTransitions[currentStatus];
    
    if (!allowedTransitions.includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  async createOrganizationWithBoardMeeting(data: {
    organizationName: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
    boardMeetingTitle: string;
    boardMeetingDescription?: string;
    boardMeetingScheduledAt: string;
    boardMeetingDuration?: number;
    boardMeetingLocation?: string;
  }): Promise<{
    organization: any;
    user: any;
    boardMeeting: any;
    session: any;
  }> {
    let supabaseUser: any = null;

    try {
      // 1. Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.adminEmail,
        password: data.adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: `${data.adminFirstName} ${data.adminLastName}`,
        },
      });

      if (authError || !authData.user) {
        throw new ConflictError(`Failed to create auth user: ${authError?.message}`);
      }

      supabaseUser = authData.user;

      // 2. Create organization
      const organization = await this.organizationModel.create({
        name: data.organizationName,
      });

      // 3. Create admin user
      const user = await this.userModel.create({
        id: supabaseUser.id,
        email: data.adminEmail,
        firstName: data.adminFirstName,
        lastName: data.adminLastName,
        role: 'ADMIN',
        organizationId: organization.id,
      });

      // 4. Update Supabase user metadata with organization info
      await supabase.auth.admin.updateUserById(supabaseUser.id, {
        user_metadata: {
          ...supabaseUser.user_metadata,
          organizationId: organization.id,
          role: 'ADMIN',
        },
      });

      // 5. Create initial board meeting
      const boardMeeting = await this.boardMeetingModel.create(
        {
          title: data.boardMeetingTitle,
          description: data.boardMeetingDescription,
          scheduledAt: new Date(data.boardMeetingScheduledAt),
          duration: data.boardMeetingDuration,
          location: data.boardMeetingLocation,
          organizationId: organization.id,
        },
        user.id
      );

      return {
        organization,
        user,
        boardMeeting,
        session: (authData as any).session || null,
      };
    } catch (error) {
      // If creation fails, clean up created Supabase user
      if (supabaseUser) {
        try {
          await supabase.auth.admin.deleteUser(supabaseUser.id);
        } catch (cleanupError) {
          console.error('Failed to cleanup Supabase user:', cleanupError);
        }
      }
      throw error;
    }
  }
}
