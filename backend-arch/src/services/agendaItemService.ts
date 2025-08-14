import { AgendaItem, AgendaItemStatus } from '@prisma/client';
import { AgendaItemModel } from '../models/agendaItemModel';
import { AgendaGroupModel } from '../models/agendaGroupModel';
import { CreateAgendaItemData, UpdateAgendaItemData } from '../types';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';

export class AgendaItemService {
  constructor(
    private agendaItemModel: AgendaItemModel,
    private agendaGroupModel: AgendaGroupModel
  ) {}

  async createAgendaItem(
    data: CreateAgendaItemData,
    createdById: string,
    userOrganizationId?: string
  ): Promise<AgendaItem> {
    // Verify the agenda group exists and user has access
    const agendaGroup = await this.agendaGroupModel.findById(data.agendaGroupId);
    
    if (!agendaGroup) {
      throw new NotFoundError('Agenda group not found');
    }

    if (userOrganizationId && agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this agenda group');
    }

    // If no order specified, set it to the next available order
    if (data.order === undefined || data.order < 0) {
      const maxOrder = await this.agendaItemModel.getMaxOrder(data.agendaGroupId);
      data.order = maxOrder + 1;
    }

    return this.agendaItemModel.create(data, createdById);
  }

  async getAgendaItemById(id: string, userOrganizationId?: string): Promise<AgendaItem> {
    const agendaItem = await this.agendaItemModel.findById(id);
    
    if (!agendaItem) {
      throw new NotFoundError('Agenda item not found');
    }

    // Check if user has access to this agenda item
    if (userOrganizationId && agendaItem.agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this agenda item');
    }

    return agendaItem;
  }

  async getAgendaItemsByGroup(
    agendaGroupId: string,
    userOrganizationId?: string
  ): Promise<AgendaItem[]> {
    // Verify the agenda group exists and user has access
    const agendaGroup = await this.agendaGroupModel.findById(agendaGroupId);
    
    if (!agendaGroup) {
      throw new NotFoundError('Agenda group not found');
    }

    if (userOrganizationId && agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this agenda group');
    }

    return this.agendaItemModel.findByAgendaGroupId(agendaGroupId);
  }

  async getAgendaItemsByBoardMeeting(
    boardMeetingId: string,
    userOrganizationId?: string
  ): Promise<AgendaItem[]> {
    // Note: We'll validate access through the model query itself
    const items = await this.agendaItemModel.findByBoardMeetingId(boardMeetingId);
    
    // Check access for the first item (if any) to validate user has access to the board meeting
    if (items.length > 0 && userOrganizationId) {
      const firstItem = items[0];
      if (firstItem && firstItem.agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
        throw new ForbiddenError('Access denied to this board meeting');
      }
    }

    return items;
  }

  async updateAgendaItem(
    id: string,
    data: UpdateAgendaItemData,
    userOrganizationId?: string
  ): Promise<AgendaItem> {
    const existingItem = await this.agendaItemModel.findById(id);
    
    if (!existingItem) {
      throw new NotFoundError('Agenda item not found');
    }

    // Check if user has access to this agenda item
    if (userOrganizationId && existingItem.agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this agenda item');
    }

    // Validate status transition if status is being updated
    if (data.status && data.status !== existingItem.status) {
      this.validateStatusTransition(existingItem.status, data.status);
    }

    return this.agendaItemModel.update(id, data);
  }

  async deleteAgendaItem(id: string, userOrganizationId?: string): Promise<void> {
    const existingItem = await this.agendaItemModel.findById(id);
    
    if (!existingItem) {
      throw new NotFoundError('Agenda item not found');
    }

    // Check if user has access to this agenda item
    if (userOrganizationId && existingItem.agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this agenda item');
    }

    await this.agendaItemModel.delete(id);
  }

  async updateAgendaItemStatus(
    id: string,
    status: AgendaItemStatus,
    userOrganizationId?: string
  ): Promise<AgendaItem> {
    const existingItem = await this.agendaItemModel.findById(id);
    
    if (!existingItem) {
      throw new NotFoundError('Agenda item not found');
    }

    // Check if user has access to this agenda item
    if (userOrganizationId && existingItem.agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this agenda item');
    }

    // Validate status transition
    this.validateStatusTransition(existingItem.status, status);

    return this.agendaItemModel.updateStatus(id, status);
  }

  async reorderAgendaItems(
    agendaGroupId: string,
    itemOrders: Array<{ id: string; order: number }>,
    userOrganizationId?: string
  ): Promise<void> {
    // Verify the agenda group exists and user has access
    const agendaGroup = await this.agendaGroupModel.findById(agendaGroupId);
    
    if (!agendaGroup) {
      throw new NotFoundError('Agenda group not found');
    }

    if (userOrganizationId && agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
      throw new ForbiddenError('Access denied to this agenda group');
    }

    // Validate that all items belong to the agenda group
    const existingItems = await this.agendaItemModel.findByAgendaGroupId(agendaGroupId);
    const existingItemIds = new Set(existingItems.map(item => item.id));

    for (const { id } of itemOrders) {
      if (!existingItemIds.has(id)) {
        throw new ValidationError(`Agenda item ${id} does not belong to this agenda group`);
      }
    }

    // Validate orders are sequential and start from 0
    const sortedOrders = itemOrders.map(item => item.order).sort((a, b) => a - b);
    for (let i = 0; i < sortedOrders.length; i++) {
      if (sortedOrders[i] !== i) {
        throw new ValidationError('Orders must be sequential starting from 0');
      }
    }

    await this.agendaItemModel.reorderItems(agendaGroupId, itemOrders);
  }

  private validateStatusTransition(currentStatus: AgendaItemStatus, newStatus: AgendaItemStatus): void {
    const validTransitions: Record<AgendaItemStatus, AgendaItemStatus[]> = {
      PENDING: ['IN_PROGRESS', 'DEFERRED'],
      IN_PROGRESS: ['COMPLETED', 'DEFERRED', 'PENDING'],
      COMPLETED: ['PENDING'], // Can reopen completed items
      DEFERRED: ['PENDING', 'IN_PROGRESS'],
    };

    const allowedTransitions = validTransitions[currentStatus];
    
    if (!allowedTransitions.includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
