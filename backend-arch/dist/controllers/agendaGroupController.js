"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendaGroupController = void 0;
const response_1 = require("../utils/response");
class AgendaGroupController {
    agendaGroupService;
    constructor(agendaGroupService) {
        this.agendaGroupService = agendaGroupService;
    }
    createAgendaGroup = async (req, res, next) => {
        try {
            const user = req.user;
            const data = req.body;
            const agendaGroup = await this.agendaGroupService.createAgendaGroup(data, user.id, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, agendaGroup, 'Agenda group created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    };
    getAgendaGroup = async (req, res, next) => {
        try {
            const user = req.user;
            const { id } = req.params;
            const agendaGroup = await this.agendaGroupService.getAgendaGroupById(id, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, agendaGroup, 'Agenda group retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getAgendaGroupsByBoardMeeting = async (req, res, next) => {
        try {
            const user = req.user;
            const { boardMeetingId } = req.params;
            const agendaGroups = await this.agendaGroupService.getAgendaGroupsByBoardMeetingId(boardMeetingId, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, agendaGroups, 'Agenda groups retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    updateAgendaGroup = async (req, res, next) => {
        try {
            const user = req.user;
            const { id } = req.params;
            const data = req.body;
            const agendaGroup = await this.agendaGroupService.updateAgendaGroup(id, data, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, agendaGroup, 'Agenda group updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    deleteAgendaGroup = async (req, res, next) => {
        try {
            const user = req.user;
            const { id } = req.params;
            await this.agendaGroupService.deleteAgendaGroup(id, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, null, 'Agenda group deleted successfully');
        }
        catch (error) {
            next(error);
        }
    };
    reorderAgendaGroups = async (req, res, next) => {
        try {
            const user = req.user;
            const { boardMeetingId } = req.params;
            const { groupOrders } = req.body;
            await this.agendaGroupService.reorderAgendaGroups(boardMeetingId, groupOrders, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, null, 'Agenda groups reordered successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AgendaGroupController = AgendaGroupController;
//# sourceMappingURL=agendaGroupController.js.map