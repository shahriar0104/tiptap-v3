"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardMeetingController = void 0;
const response_1 = require("../utils/response");
class BoardMeetingController {
    boardMeetingService;
    constructor(boardMeetingService) {
        this.boardMeetingService = boardMeetingService;
    }
    createBoardMeeting = async (req, res, next) => {
        try {
            const user = req.user;
            const data = req.body;
            const meetingData = {
                ...data,
                scheduledAt: new Date(data.scheduledAt),
            };
            const meeting = await this.boardMeetingService.createBoardMeeting(meetingData, user.id);
            (0, response_1.sendSuccess)(res, meeting, 'Board meeting created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    };
    getBoardMeeting = async (req, res, next) => {
        try {
            const user = req.user;
            const { id } = req.params;
            const meeting = await this.boardMeetingService.getBoardMeetingById(id, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, meeting, 'Board meeting retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getBoardMeetings = async (req, res, next) => {
        try {
            const user = req.user;
            const query = req.query;
            const page = query.page ? parseInt(query.page, 10) : 1;
            const limit = query.limit ? parseInt(query.limit, 10) : 10;
            const organizationId = query.organizationId || user.organizationId;
            const status = query.status;
            const result = await this.boardMeetingService.getBoardMeetings(organizationId || undefined, status, page, limit);
            (0, response_1.sendPaginatedResponse)(res, result.data, result.pagination.page, result.pagination.limit, result.pagination.total, 'Board meetings retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    updateBoardMeeting = async (req, res, next) => {
        try {
            const user = req.user;
            const { id } = req.params;
            const data = req.body;
            const updateData = {
                ...data,
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
            };
            const meeting = await this.boardMeetingService.updateBoardMeeting(id, updateData, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, meeting, 'Board meeting updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    deleteBoardMeeting = async (req, res, next) => {
        try {
            const user = req.user;
            const { id } = req.params;
            await this.boardMeetingService.deleteBoardMeeting(id, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, null, 'Board meeting deleted successfully');
        }
        catch (error) {
            next(error);
        }
    };
    updateMeetingStatus = async (req, res, next) => {
        try {
            const user = req.user;
            const { id } = req.params;
            const { status } = req.body;
            const meeting = await this.boardMeetingService.updateMeetingStatus(id, status, user.organizationId || undefined);
            (0, response_1.sendSuccess)(res, meeting, 'Meeting status updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getOrganizationMeetings = async (req, res, next) => {
        try {
            const user = req.user;
            if (!user.organizationId) {
                throw new Error('User is not part of an organization');
            }
            const meetings = await this.boardMeetingService.getBoardMeetingsByOrganization(user.organizationId);
            (0, response_1.sendSuccess)(res, meetings, 'Organization meetings retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    createOrganizationWithBoardMeeting = async (req, res, next) => {
        try {
            const data = req.body;
            const result = await this.boardMeetingService.createOrganizationWithBoardMeeting(data);
            (0, response_1.sendSuccess)(res, result, 'Organization and board meeting created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.BoardMeetingController = BoardMeetingController;
//# sourceMappingURL=boardMeetingController.js.map