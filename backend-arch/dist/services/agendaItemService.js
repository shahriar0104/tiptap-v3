"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendaItemService = void 0;
const errors_1 = require("../utils/errors");
class AgendaItemService {
    agendaItemModel;
    agendaGroupModel;
    constructor(agendaItemModel, agendaGroupModel) {
        this.agendaItemModel = agendaItemModel;
        this.agendaGroupModel = agendaGroupModel;
    }
    async createAgendaItem(data, createdById, userOrganizationId) {
        const agendaGroup = await this.agendaGroupModel.findById(data.agendaGroupId);
        if (!agendaGroup) {
            throw new errors_1.NotFoundError('Agenda group not found');
        }
        if (userOrganizationId && agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this agenda group');
        }
        if (data.order === undefined || data.order < 0) {
            const maxOrder = await this.agendaItemModel.getMaxOrder(data.agendaGroupId);
            data.order = maxOrder + 1;
        }
        return this.agendaItemModel.create(data, createdById);
    }
    async getAgendaItemById(id, userOrganizationId) {
        const agendaItem = await this.agendaItemModel.findById(id);
        if (!agendaItem) {
            throw new errors_1.NotFoundError('Agenda item not found');
        }
        if (userOrganizationId && agendaItem.agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this agenda item');
        }
        return agendaItem;
    }
    async getAgendaItemsByGroup(agendaGroupId, userOrganizationId) {
        const agendaGroup = await this.agendaGroupModel.findById(agendaGroupId);
        if (!agendaGroup) {
            throw new errors_1.NotFoundError('Agenda group not found');
        }
        if (userOrganizationId && agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this agenda group');
        }
        return this.agendaItemModel.findByAgendaGroupId(agendaGroupId);
    }
    async getAgendaItemsByBoardMeeting(boardMeetingId, userOrganizationId) {
        const items = await this.agendaItemModel.findByBoardMeetingId(boardMeetingId);
        if (items.length > 0 && userOrganizationId) {
            const firstItem = items[0];
            if (firstItem && firstItem.agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
                throw new errors_1.ForbiddenError('Access denied to this board meeting');
            }
        }
        return items;
    }
    async updateAgendaItem(id, data, userOrganizationId) {
        const existingItem = await this.agendaItemModel.findById(id);
        if (!existingItem) {
            throw new errors_1.NotFoundError('Agenda item not found');
        }
        if (userOrganizationId && existingItem.agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this agenda item');
        }
        if (data.status && data.status !== existingItem.status) {
            this.validateStatusTransition(existingItem.status, data.status);
        }
        return this.agendaItemModel.update(id, data);
    }
    async deleteAgendaItem(id, userOrganizationId) {
        const existingItem = await this.agendaItemModel.findById(id);
        if (!existingItem) {
            throw new errors_1.NotFoundError('Agenda item not found');
        }
        if (userOrganizationId && existingItem.agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this agenda item');
        }
        await this.agendaItemModel.delete(id);
    }
    async updateAgendaItemStatus(id, status, userOrganizationId) {
        const existingItem = await this.agendaItemModel.findById(id);
        if (!existingItem) {
            throw new errors_1.NotFoundError('Agenda item not found');
        }
        if (userOrganizationId && existingItem.agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this agenda item');
        }
        this.validateStatusTransition(existingItem.status, status);
        return this.agendaItemModel.updateStatus(id, status);
    }
    async reorderAgendaItems(agendaGroupId, itemOrders, userOrganizationId) {
        const agendaGroup = await this.agendaGroupModel.findById(agendaGroupId);
        if (!agendaGroup) {
            throw new errors_1.NotFoundError('Agenda group not found');
        }
        if (userOrganizationId && agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this agenda group');
        }
        const existingItems = await this.agendaItemModel.findByAgendaGroupId(agendaGroupId);
        const existingItemIds = new Set(existingItems.map(item => item.id));
        for (const { id } of itemOrders) {
            if (!existingItemIds.has(id)) {
                throw new errors_1.ValidationError(`Agenda item ${id} does not belong to this agenda group`);
            }
        }
        const sortedOrders = itemOrders.map(item => item.order).sort((a, b) => a - b);
        for (let i = 0; i < sortedOrders.length; i++) {
            if (sortedOrders[i] !== i) {
                throw new errors_1.ValidationError('Orders must be sequential starting from 0');
            }
        }
        await this.agendaItemModel.reorderItems(agendaGroupId, itemOrders);
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            PENDING: ['IN_PROGRESS', 'DEFERRED'],
            IN_PROGRESS: ['COMPLETED', 'DEFERRED', 'PENDING'],
            COMPLETED: ['PENDING'],
            DEFERRED: ['PENDING', 'IN_PROGRESS'],
        };
        const allowedTransitions = validTransitions[currentStatus];
        if (!allowedTransitions.includes(newStatus)) {
            throw new errors_1.ValidationError(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }
    }
}
exports.AgendaItemService = AgendaItemService;
//# sourceMappingURL=agendaItemService.js.map