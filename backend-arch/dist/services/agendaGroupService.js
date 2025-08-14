"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendaGroupService = void 0;
const errors_1 = require("../utils/errors");
class AgendaGroupService {
    agendaGroupModel;
    boardMeetingModel;
    constructor(agendaGroupModel, boardMeetingModel) {
        this.agendaGroupModel = agendaGroupModel;
        this.boardMeetingModel = boardMeetingModel;
    }
    async createAgendaGroup(data, createdById, userOrganizationId) {
        const boardMeeting = await this.boardMeetingModel.findById(data.boardMeetingId);
        if (!boardMeeting) {
            throw new errors_1.NotFoundError('Board meeting not found');
        }
        if (userOrganizationId && boardMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this board meeting');
        }
        if (data.order === undefined || data.order < 0) {
            const maxOrder = await this.agendaGroupModel.getMaxOrder(data.boardMeetingId);
            data.order = maxOrder + 1;
        }
        return this.agendaGroupModel.create(data, createdById);
    }
    async getAgendaGroupById(id, userOrganizationId) {
        const agendaGroup = await this.agendaGroupModel.findById(id);
        if (!agendaGroup) {
            throw new errors_1.NotFoundError('Agenda group not found');
        }
        if (userOrganizationId && agendaGroup.boardMeeting && agendaGroup.boardMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this agenda group');
        }
        return agendaGroup;
    }
    async getAgendaGroupsByBoardMeetingId(boardMeetingId, userOrganizationId) {
        const boardMeeting = await this.boardMeetingModel.findById(boardMeetingId);
        if (!boardMeeting) {
            throw new errors_1.NotFoundError('Board meeting not found');
        }
        if (userOrganizationId && boardMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this board meeting');
        }
        return this.agendaGroupModel.findByBoardMeetingId(boardMeetingId);
    }
    async updateAgendaGroup(id, data, userOrganizationId) {
        const existingGroup = await this.agendaGroupModel.findById(id);
        if (!existingGroup) {
            throw new errors_1.NotFoundError('Agenda group not found');
        }
        if (userOrganizationId && existingGroup.boardMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this agenda group');
        }
        return this.agendaGroupModel.update(id, data);
    }
    async deleteAgendaGroup(id, userOrganizationId) {
        const existingGroup = await this.agendaGroupModel.findById(id);
        if (!existingGroup) {
            throw new errors_1.NotFoundError('Agenda group not found');
        }
        if (userOrganizationId && existingGroup.boardMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this agenda group');
        }
        await this.agendaGroupModel.delete(id);
    }
    async reorderAgendaGroups(boardMeetingId, groupOrders, userOrganizationId) {
        const boardMeeting = await this.boardMeetingModel.findById(boardMeetingId);
        if (!boardMeeting) {
            throw new errors_1.NotFoundError('Board meeting not found');
        }
        if (userOrganizationId && boardMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this board meeting');
        }
        const existingGroups = await this.agendaGroupModel.findByBoardMeetingId(boardMeetingId);
        const existingGroupIds = new Set(existingGroups.map(g => g.id));
        for (const { id } of groupOrders) {
            if (!existingGroupIds.has(id)) {
                throw new errors_1.ValidationError(`Agenda group ${id} does not belong to this board meeting`);
            }
        }
        const sortedOrders = groupOrders.map(g => g.order).sort((a, b) => a - b);
        for (let i = 0; i < sortedOrders.length; i++) {
            if (sortedOrders[i] !== i) {
                throw new errors_1.ValidationError('Orders must be sequential starting from 0');
            }
        }
        await this.agendaGroupModel.reorderGroups(boardMeetingId, groupOrders);
    }
}
exports.AgendaGroupService = AgendaGroupService;
//# sourceMappingURL=agendaGroupService.js.map