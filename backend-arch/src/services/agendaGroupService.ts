import { Prisma } from '@prisma/client';
import { withModels, withTransactionModels } from '../utils/transaction';
import { CreateAgendaGroupData, UpdateAgendaGroupData } from '../types';
import type { CreateAgendaGroupWithItemsInput } from '../validators/agenda';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../utils/errors';

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
  createAgendaGroupWithItems(
    data: CreateAgendaGroupWithItemsInput,
    userOrganizationId?: string
  ): Promise<AgendaGroupWithRelations>;
  getAgendaGroupById(
    id: string,
    userOrganizationId?: string
  ): Promise<AgendaGroupWithRelations | null>;
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
  constructor() {}

  async createAgendaGroup(
    data: CreateAgendaGroupData,
    userOrganizationId?: string
  ): Promise<AgendaGroupWithRelations> {
    return withTransactionModels(async ({ models }) => {
      // Verify the board meeting exists and user has access
      const boardMeeting = await models.boardMeetingModel.findById(
        data.boardMeetingId
      );

      if (!boardMeeting) {
        throw new NotFoundError('Board meeting not found');
      }

      if (
        userOrganizationId &&
        boardMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this board meeting');
      }

      // If no order specified, set it to the next available order
      if (data.order === undefined || data.order < 0) {
        const maxOrder = await models.agendaGroupModel.getMaxOrder(
          data.boardMeetingId
        );
        data.order = maxOrder + 1;
      }

      return models.agendaGroupModel.create(data);
    });
  }

  async createAgendaGroupWithItems(
    data: CreateAgendaGroupWithItemsInput,
    userOrganizationId?: string
  ): Promise<AgendaGroupWithRelations> {
    return withTransactionModels(async ({ models }) => {
      // Verify the board meeting exists and user has access
      const boardMeeting = await models.boardMeetingModel.findById(
        data.boardMeetingId
      );

      if (!boardMeeting) {
        throw new NotFoundError('Board meeting not found');
      }

      if (
        userOrganizationId &&
        boardMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this board meeting');
      }

      // Determine order if not provided or invalid
      let order = data.order;
      if (order === undefined || order < 0) {
        const maxOrder = await models.agendaGroupModel.getMaxOrder(
          data.boardMeetingId
        );
        order = maxOrder + 1;
      }

      // Create group first
      const createdGroup = await models.agendaGroupModel.create({
        title: data.title,
        order,
        startTime: data.startTime as unknown as Date,
        // status currently not persisted at model level; kept for future extension
        boardMeetingId: data.boardMeetingId,
      });

      // Helper: map incoming type to existing enum in DB
      const mapType = (t: string | undefined): 'STANDARD' | 'DECISION' | 'INFO' => {
        if (!t) return 'STANDARD';
        const u = t.toUpperCase();
        if (u === 'APPROVE' || u === 'DECISION') return 'DECISION';
        if (u === 'NOTING' || u === 'INFO') return 'INFO';
        return 'STANDARD';
      };

      // Create items
      const sortedItems = (data.items || []).slice().sort((a, b) => a.order - b.order);
      for (const item of sortedItems) {
        await models.agendaItemModel.create({
          title: item.title,
          order: item.order,
          startTime: item.startTime as unknown as Date,
          type: mapType(item.type as any),
          agendaGroupId: createdGroup.id,
        });
      }

      // Return group with relations (including newly created items)
      const full = await models.agendaGroupModel.findById(createdGroup.id);
      if (!full) {
        throw new NotFoundError('Failed to load created agenda group');
      }
      return full;
    });
  }

  async getAgendaGroupById(
    id: string,
    userOrganizationId?: string
  ): Promise<AgendaGroupWithRelations | null> {
    return withModels(async ({ models }) => {
      const agendaGroup = await models.agendaGroupModel.findById(id);

      if (!agendaGroup) {
        throw new NotFoundError('Agenda group not found');
      }

      // Check if user has access to this agenda group
      if (
        userOrganizationId &&
        agendaGroup.boardMeeting &&
        agendaGroup.boardMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this agenda group');
      }

      return agendaGroup;
    });
  }

  async getAgendaGroupsByBoardMeetingId(
    boardMeetingId: string,
    userOrganizationId?: string
  ): Promise<AgendaGroupWithRelations[]> {
    return withModels(async ({ models }) => {
      // Verify the board meeting exists and user has access
      const boardMeeting =
        await models.boardMeetingModel.findById(boardMeetingId);

      if (!boardMeeting) {
        throw new NotFoundError('Board meeting not found');
      }

      if (
        userOrganizationId &&
        boardMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this board meeting');
      }

      return models.agendaGroupModel.findByBoardMeetingId(boardMeetingId);
    });
  }

  async updateAgendaGroup(
    id: string,
    data: UpdateAgendaGroupData,
    userOrganizationId?: string
  ): Promise<AgendaGroupWithRelations | null> {
    return withTransactionModels(async ({ models }) => {
      const existingGroup = await models.agendaGroupModel.findById(id);

      if (!existingGroup) {
        throw new NotFoundError('Agenda group not found');
      }

      // Check if user has access to this agenda group
      if (
        userOrganizationId &&
        existingGroup.boardMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this agenda group');
      }

      return models.agendaGroupModel.update(id, data);
    });
  }

  async deleteAgendaGroup(
    id: string,
    userOrganizationId?: string
  ): Promise<void> {
    return withTransactionModels(async ({ models }) => {
      const existingGroup = await models.agendaGroupModel.findById(id);

      if (!existingGroup) {
        throw new NotFoundError('Agenda group not found');
      }

      // Check if user has access to this agenda group
      if (
        userOrganizationId &&
        existingGroup.boardMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this agenda group');
      }

      await models.agendaGroupModel.delete(id);
    });
  }

  async reorderAgendaGroups(
    boardMeetingId: string,
    groupOrders: Array<{ id: string; order: number }>,
    userOrganizationId?: string
  ): Promise<void> {
    return withTransactionModels(async ({ models }) => {
      // Verify the board meeting exists and user has access
      const boardMeeting =
        await models.boardMeetingModel.findById(boardMeetingId);

      if (!boardMeeting) {
        throw new NotFoundError('Board meeting not found');
      }

      if (
        userOrganizationId &&
        boardMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this board meeting');
      }

      // Validate that all groups belong to the board meeting
      const existingGroups =
        await models.agendaGroupModel.findByBoardMeetingId(boardMeetingId);
      const existingGroupIds = new Set(
        existingGroups.map((g: { id: string }) => g.id)
      );

      for (const { id } of groupOrders) {
        if (!existingGroupIds.has(id)) {
          throw new ValidationError(
            `Agenda group ${id} does not belong to this board meeting`
          );
        }
      }

      // Validate orders are sequential and start from 0
      const sortedOrders = groupOrders.map(g => g.order).sort((a, b) => a - b);
      for (let i = 0; i < sortedOrders.length; i++) {
        if (sortedOrders[i] !== i) {
          throw new ValidationError(
            'Orders must be sequential starting from 0'
          );
        }
      }

      await models.agendaGroupModel.reorderGroups(boardMeetingId, groupOrders);
    });
  }
}
