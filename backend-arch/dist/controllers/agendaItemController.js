"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendaItemController = void 0;
const response_1 = require("../utils/response");
class AgendaItemController {
    agendaItemService;
    constructor(agendaItemService) {
        this.agendaItemService = agendaItemService;
    }
    createAgendaItem = async (req, res, next) => {
        try {
            const user = req.user;
            const data = req.body;
            const agendaItem = await this.agendaItemService.createAgendaItem(data, user.id, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, agendaItem, 'Agenda item created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    };
    getAgendaItem = async (req, res, next) => {
        try {
            const user = req.user;
            const { id } = req.params;
            const agendaItem = await this.agendaItemService.getAgendaItemById(id, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, agendaItem, 'Agenda item retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getAgendaItemsByGroup = async (req, res, next) => {
        try {
            const user = req.user;
            const { agendaGroupId } = req.params;
            const agendaItems = await this.agendaItemService.getAgendaItemsByGroup(agendaGroupId, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, agendaItems, 'Agenda items retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getAgendaItemsByBoardMeeting = async (req, res, next) => {
        try {
            const user = req.user;
            const { boardMeetingId } = req.params;
            const agendaItems = await this.agendaItemService.getAgendaItemsByBoardMeeting(boardMeetingId, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, agendaItems, 'Agenda items retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    updateAgendaItem = async (req, res, next) => {
        try {
            const user = req.user;
            const { id } = req.params;
            const data = req.body;
            const agendaItem = await this.agendaItemService.updateAgendaItem(id, data, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, agendaItem, 'Agenda item updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    deleteAgendaItem = async (req, res, next) => {
        try {
            const user = req.user;
            const { id } = req.params;
            await this.agendaItemService.deleteAgendaItem(id, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, null, 'Agenda item deleted successfully');
        }
        catch (error) {
            next(error);
        }
    };
    updateAgendaItemStatus = async (req, res, next) => {
        try {
            const user = req.user;
            const { id } = req.params;
            const { status } = req.body;
            const agendaItem = await this.agendaItemService.updateAgendaItemStatus(id, status, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, agendaItem, 'Agenda item status updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    reorderAgendaItems = async (req, res, next) => {
        try {
            const user = req.user;
            const { agendaGroupId } = req.params;
            const { itemOrders } = req.body;
            await this.agendaItemService.reorderAgendaItems(agendaGroupId, itemOrders, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, null, 'Agenda items reordered successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AgendaItemController = AgendaItemController;
//# sourceMappingURL=agendaItemController.js.map