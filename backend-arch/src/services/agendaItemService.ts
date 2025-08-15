import { AgendaItem, AgendaItemStatus } from '@prisma/client';
import { withModels, withTransactionModels } from '../utils/transaction';
import { CreateAgendaItemData, UpdateAgendaItemData } from '../types';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../utils/errors';

export interface AgendaItemService {
  create(data: CreateAgendaItemData): Promise<AgendaItem>;
  createAgendaItem(
    data: CreateAgendaItemData,
    userOrganizationId?: string
  ): Promise<AgendaItem>;
  getAgendaItemById(
    id: string,
    userOrganizationId?: string
  ): Promise<AgendaItem>;
  getAgendaItemsByGroup(
    agendaGroupId: string,
    userOrganizationId?: string
  ): Promise<AgendaItem[]>;
  getAgendaItemsByBoardMeeting(
    boardMeetingId: string,
    userOrganizationId?: string
  ): Promise<AgendaItem[]>;
  updateAgendaItem(
    id: string,
    data: UpdateAgendaItemData,
    userOrganizationId?: string
  ): Promise<AgendaItem>;
  deleteAgendaItem(id: string, userOrganizationId?: string): Promise<void>;
  updateAgendaItemStatus(
    id: string,
    status: AgendaItemStatus,
    userOrganizationId?: string
  ): Promise<AgendaItem>;
  reorderAgendaItems(
    agendaGroupId: string,
    itemOrders: Array<{ id: string; order: number }>,
    userOrganizationId?: string
  ): Promise<void>;
}

export class AgendaItemServiceImpl implements AgendaItemService {
  constructor() {}

  async create(data: CreateAgendaItemData): Promise<AgendaItem> {
    return withTransactionModels(async ({ models }) => {
      // Get the agenda group to verify it exists and get organization access
      const agendaGroup = await models.agendaGroupModel.findById(
        data.agendaGroupId
      );
      if (!agendaGroup) {
        throw new NotFoundError('Agenda group not found');
      }

      // If no order provided, set next available
      if (data.order === undefined || data.order < 0) {
        const maxOrder = await models.agendaItemModel.getMaxOrder(
          data.agendaGroupId
        );
        data.order = maxOrder + 1;
      }

      return models.agendaItemModel.create(data);
    });
  }

  async createAgendaItem(
    data: CreateAgendaItemData,
    _userOrganizationId?: string
  ): Promise<AgendaItem> {
    return withTransactionModels(async ({ models }) => {
      // Get the agenda group to verify it exists and get organization access
      const agendaGroup = await models.agendaGroupModel.findById(
        data.agendaGroupId
      );
      if (!agendaGroup) {
        throw new NotFoundError('Agenda group not found');
      }

      // If no order provided, set next available
      if (data.order === undefined || data.order < 0) {
        const maxOrder = await models.agendaItemModel.getMaxOrder(
          data.agendaGroupId
        );
        data.order = maxOrder + 1;
      }

      return models.agendaItemModel.create(data);
    });
  }

  async getAgendaItemById(
    id: string,
    _userOrganizationId?: string
  ): Promise<AgendaItem> {
    return withModels(async ({ models }) => {
      const agendaItem = await models.agendaItemModel.findById(id);

      if (!agendaItem) {
        throw new NotFoundError('Agenda item not found');
      }

      // TODO: Add organization access check when needed

      return agendaItem;
    });
  }

  async getAgendaItemsByGroup(
    agendaGroupId: string,
    userOrganizationId?: string
  ): Promise<AgendaItem[]> {
    return withModels(async ({ models }) => {
      // Verify the agenda group exists and user has access
      const agendaGroup = await models.agendaGroupModel.findById(agendaGroupId);

      if (!agendaGroup) {
        throw new NotFoundError('Agenda group not found');
      }

      if (
        userOrganizationId &&
        agendaGroup.boardMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this agenda group');
      }

      return models.agendaItemModel.findByAgendaGroupId(agendaGroupId);
    });
  }

  async getAgendaItemsByBoardMeeting(
    boardMeetingId: string,
    _userOrganizationId?: string
  ): Promise<AgendaItem[]> {
    return withModels(async ({ models }) => {
      // Note: We'll validate access through the model query itself
      const items =
        await models.agendaItemModel.findByBoardMeetingId(boardMeetingId);

      // TODO: Add organization access check when needed

      return items;
    });
  }

  async updateAgendaItem(
    id: string,
    data: UpdateAgendaItemData,
    _userOrganizationId?: string
  ): Promise<AgendaItem> {
    return withTransactionModels(async ({ models }) => {
      const existingItem = await models.agendaItemModel.findById(id);

      if (!existingItem) {
        throw new NotFoundError('Agenda item not found');
      }

      // TODO: Add organization access check when needed

      // Validate status transition if status is being updated
      if (data.status && data.status !== (existingItem as AgendaItem).status) {
        this.validateStatusTransition(
          (existingItem as AgendaItem).status as AgendaItemStatus,
          data.status
        );
      }

      return models.agendaItemModel.update(id, data);
    });
  }

  async deleteAgendaItem(
    id: string,
    _userOrganizationId?: string
  ): Promise<void> {
    return withTransactionModels(async ({ models }) => {
      const existingItem = await models.agendaItemModel.findById(id);

      if (!existingItem) {
        throw new NotFoundError('Agenda item not found');
      }

      // TODO: Add organization access check when needed

      await models.agendaItemModel.delete(id);
    });
  }

  async updateAgendaItemStatus(
    id: string,
    status: AgendaItemStatus,
    _userOrganizationId?: string
  ): Promise<AgendaItem> {
    return withTransactionModels(async ({ models }) => {
      const existingItem = await models.agendaItemModel.findById(id);

      if (!existingItem) {
        throw new NotFoundError('Agenda item not found');
      }

      // TODO: Add organization access check when needed

      // Validate status transition
      this.validateStatusTransition(
        (existingItem as AgendaItem).status as AgendaItemStatus,
        status
      );

      return models.agendaItemModel.updateStatus(id, status);
    });
  }

  async reorderAgendaItems(
    agendaGroupId: string,
    itemOrders: Array<{ id: string; order: number }>,
    userOrganizationId?: string
  ): Promise<void> {
    return withTransactionModels(async ({ models }) => {
      // Verify the agenda group exists and user has access
      const agendaGroup = await models.agendaGroupModel.findById(agendaGroupId);

      if (!agendaGroup) {
        throw new NotFoundError('Agenda group not found');
      }

      if (
        userOrganizationId &&
        agendaGroup.boardMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this agenda group');
      }

      // Validate that all items belong to the agenda group
      const existingItems =
        await models.agendaItemModel.findByAgendaGroupId(agendaGroupId);
      const existingItemIds = new Set(
        existingItems.map((item: { id: string }) => item.id)
      );

      for (const { id } of itemOrders) {
        if (!existingItemIds.has(id)) {
          throw new ValidationError(
            `Agenda item ${id} does not belong to this agenda group`
          );
        }
      }

      // Validate orders are sequential and start from 0
      const sortedOrders = itemOrders
        .map(item => item.order)
        .sort((a, b) => a - b);
      for (let i = 0; i < sortedOrders.length; i++) {
        if (sortedOrders[i] !== i) {
          throw new ValidationError(
            'Orders must be sequential starting from 0'
          );
        }
      }

      await models.agendaItemModel.reorderItems(agendaGroupId, itemOrders);
    });
  }

  private validateStatusTransition(
    currentStatus: AgendaItemStatus,
    newStatus: AgendaItemStatus
  ): void {
    const validTransitions: Record<AgendaItemStatus, AgendaItemStatus[]> = {
      PENDING: ['IN_PROGRESS'],
      IN_PROGRESS: ['COMPLETED', 'PENDING'],
      COMPLETED: ['IN_PROGRESS'],
    };

    const allowedTransitions = validTransitions[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
