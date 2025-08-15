import { Prisma } from '@prisma/client';
import type { AgendaGroupModel } from '../models/agendaGroupModel';
import type { BoardMeetingModel } from '../models/boardMeetingModel';
import { CreateAgendaGroupData, UpdateAgendaGroupData } from '../types';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';

type AgendaGroupWithRelations = Prisma.AgendaGroupGetPayload<{
  include: {
    boardMeeting: {
      select: {
        id: true;
        title: true;
        organizationId: true;
      };
    };
    agendaItems: {
      orderBy: {
        order: 'asc';
      };
    };
  };
}>;

export interface AgendaGroupService {
  createAgendaGroup(
    data: CreateAgendaGroupData,
    userOrganizationId?: string
  ): Promise<AgendaGroupWithRelations>;
  getAgendaGroupById(id: string, userOrganizationId?: string): Promise<AgendaGroupWithRelations | null>;
  getAgendaGroupsByBoardMeetingId(
    boardMeetingId: string,
    userOrganizationId?: string
  ): Promise<AgendaGroupWithRelations[]>;
  updateAgendaGroup(
    id: string,
    data: UpdateAgendaGroupData,
    userOrganizationId?: string
  ): Promise<AgendaGroupWithRelations | null>;
  deleteAgendaGroup(id: string, userOrganizationId?: string): Promise<void>;
  reorderAgendaGroups(
    boardMeetingId: string,
    groupOrders: Array<{ id: string; order: number }>,
    userOrganizationId?: string
  ): Promise<void>;
}

export class AgendaGroupServiceImpl implements AgendaGroupService {
  constructor(
    private agendaGroupModel: AgendaGroupModel,
    private boardMeetingModel: BoardMeetingModel
  ) {}

  async createAgendaGroup(
    data: CreateAgendaGroupData,
    userOrganizationId?: string
  ): Promise<AgendaGroupWithRelations> {
    // Verify the board meeting exists and user has access
    const boardMeeting = await this.boardMeetingModel.findById(data.boardMeetingId);
    
    if (!boardMeeting) {
      throw new NotFoundError('Board meeting not found');
    }

    if (userOrganizationId && boardMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this board meeting');
    }

    // If no order specified, set it to the next available order
    if (data.order === undefined || data.order < 0) {
      const maxOrder = await this.agendaGroupModel.getMaxOrder(data.boardMeetingId);
      data.order = maxOrder + 1;
    }

    return this.agendaGroupModel.create(data);
  }

  async getAgendaGroupById(id: string, userOrganizationId?: string): Promise<AgendaGroupWithRelations | null> {
    const agendaGroup = await this.agendaGroupModel.findById(id);
    
    if (!agendaGroup) {
      throw new NotFoundError('Agenda group not found');
    }

    // Check if user has access to this agenda group
    if (userOrganizationId && agendaGroup.boardMeeting && agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this agenda group');
    }

    return agendaGroup;
  }

  async getAgendaGroupsByBoardMeetingId(boardMeetingId: string, userOrganizationId?: string): Promise<AgendaGroupWithRelations[]> {
    // Verify the board meeting exists and user has access
    const boardMeeting = await this.boardMeetingModel.findById(boardMeetingId);
    
    if (!boardMeeting) {
      throw new NotFoundError('Board meeting not found');
    }

    if (userOrganizationId && boardMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this board meeting');
    }

    return this.agendaGroupModel.findByBoardMeetingId(boardMeetingId);
  }

  async updateAgendaGroup(id: string, data: UpdateAgendaGroupData, userOrganizationId?: string): Promise<AgendaGroupWithRelations | null> {
    const existingGroup = await this.agendaGroupModel.findById(id);
    
    if (!existingGroup) {
      throw new NotFoundError('Agenda group not found');
    }

    // Check if user has access to this agenda group
    if (userOrganizationId && existingGroup.boardMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this agenda group');
    }

    return this.agendaGroupModel.update(id, data);
  }

  async deleteAgendaGroup(id: string, userOrganizationId?: string): Promise<void> {
    const existingGroup = await this.agendaGroupModel.findById(id);
    
    if (!existingGroup) {
      throw new NotFoundError('Agenda group not found');
    }

    // Check if user has access to this agenda group
    if (userOrganizationId && existingGroup.boardMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this agenda group');
    }

    await this.agendaGroupModel.delete(id);
  }

  async reorderAgendaGroups(
    boardMeetingId: string,
    groupOrders: Array<{ id: string; order: number }>,
    userOrganizationId?: string
  ): Promise<void> {
    // Verify the board meeting exists and user has access
    const boardMeeting = await this.boardMeetingModel.findById(boardMeetingId);
    
    if (!boardMeeting) {
      throw new NotFoundError('Board meeting not found');
    }

    if (userOrganizationId && boardMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this board meeting');
    }

    // Validate that all groups belong to the board meeting
    const existingGroups = await this.agendaGroupModel.findByBoardMeetingId(boardMeetingId);
    const existingGroupIds = new Set(existingGroups.map(g => g.id));

    for (const { id } of groupOrders) {
      if (!existingGroupIds.has(id)) {
        throw new ValidationError(`Agenda group ${id} does not belong to this board meeting`);
      }
    }

    // Validate orders are sequential and start from 0
    const sortedOrders = groupOrders.map(g => g.order).sort((a, b) => a - b);
    for (let i = 0; i < sortedOrders.length; i++) {
      if (sortedOrders[i] !== i) {
        throw new ValidationError('Orders must be sequential starting from 0');
      }
    }

    await this.agendaGroupModel.reorderGroups(boardMeetingId, groupOrders);
  }
}
