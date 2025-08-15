import { AgendaItem, AgendaItemStatus } from '@prisma/client';
import type { AgendaItemModel } from '../models/agendaItemModel';
import type { AgendaGroupModel } from '../models/agendaGroupModel';
import { CreateAgendaItemData, UpdateAgendaItemData } from '../types';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';

export interface AgendaItemService {
  create(data: CreateAgendaItemData): Promise<AgendaItem>;
  createAgendaItem(data: CreateAgendaItemData, userOrganizationId?: string): Promise<AgendaItem>;
  getAgendaItemById(id: string, userOrganizationId?: string): Promise<AgendaItem>;
  getAgendaItemsByGroup(agendaGroupId: string, userOrganizationId?: string): Promise<AgendaItem[]>;
  getAgendaItemsByBoardMeeting(boardMeetingId: string, userOrganizationId?: string): Promise<AgendaItem[]>;
  updateAgendaItem(id: string, data: UpdateAgendaItemData, userOrganizationId?: string): Promise<AgendaItem>;
  deleteAgendaItem(id: string, userOrganizationId?: string): Promise<void>;
  updateAgendaItemStatus(id: string, status: AgendaItemStatus, userOrganizationId?: string): Promise<AgendaItem>;
  reorderAgendaItems(
    agendaGroupId: string,
    itemOrders: Array<{ id: string; order: number }>,
    userOrganizationId?: string
  ): Promise<void>;
}

export class AgendaItemServiceImpl implements AgendaItemService {
  constructor(
    private agendaItemModel: AgendaItemModel,
    private agendaGroupModel: AgendaGroupModel
  ) {}

  async create(data: CreateAgendaItemData): Promise<AgendaItem> {
    // Get the agenda group to verify it exists and get organization access
    const agendaGroup = await this.agendaGroupModel.findById(data.agendaGroupId);
    if (!agendaGroup) {
      throw new NotFoundError('Agenda group not found');
    }

    return this.agendaItemModel.create(data);
  }

  async createAgendaItem(data: CreateAgendaItemData, _userOrganizationId?: string): Promise<AgendaItem> {
    // Get the agenda group to verify it exists and get organization access
    const agendaGroup = await this.agendaGroupModel.findById(data.agendaGroupId);
    if (!agendaGroup) {
      throw new NotFoundError('Agenda group not found');
    }

    return this.agendaItemModel.create(data);
  }

  async getAgendaItemById(id: string, _userOrganizationId?: string): Promise<AgendaItem> {
    const agendaItem = await this.agendaItemModel.findById(id);
    
    if (!agendaItem) {
      throw new NotFoundError('Agenda item not found');
    }

    // TODO: Add organization access check when needed

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
    _userOrganizationId?: string
  ): Promise<AgendaItem[]> {
    // Note: We'll validate access through the model query itself
    const items = await this.agendaItemModel.findByBoardMeetingId(boardMeetingId);
    
    // TODO: Add organization access check when needed

    return items;
  }

  async updateAgendaItem(
    id: string,
    data: UpdateAgendaItemData,
    _userOrganizationId?: string
  ): Promise<AgendaItem> {
    const existingItem = await this.agendaItemModel.findById(id);
    
    if (!existingItem) {
      throw new NotFoundError('Agenda item not found');
    }

    // TODO: Add organization access check when needed

    // Validate status transition if status is being updated
    if (data.status && data.status !== existingItem.status) {
      this.validateStatusTransition(existingItem.status, data.status);
    }

    return this.agendaItemModel.update(id, data);
  }

  async deleteAgendaItem(id: string, _userOrganizationId?: string): Promise<void> {
    const existingItem = await this.agendaItemModel.findById(id);
    
    if (!existingItem) {
      throw new NotFoundError('Agenda item not found');
    }

    // TODO: Add organization access check when needed

    await this.agendaItemModel.delete(id);
  }

  async updateAgendaItemStatus(
    id: string,
    status: AgendaItemStatus,
    _userOrganizationId?: string
  ): Promise<AgendaItem> {
    const existingItem = await this.agendaItemModel.findById(id);
    
    if (!existingItem) {
      throw new NotFoundError('Agenda item not found');
    }

    // TODO: Add organization access check when needed

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
