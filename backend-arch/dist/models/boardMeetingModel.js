"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardMeetingModel = void 0;
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../config/database"));
class BoardMeetingModel {
    async findById(id) {
        const findByIdValidator = client_1.Prisma.validator()({
            where: { id },
            include: {
                organization: true,
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                agendaGroups: {
                    orderBy: { order: 'asc' },
                    include: {
                        agendaItems: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
        return database_1.default.boardMeeting.findUnique(findByIdValidator);
    }
    async findMany(organizationId, status, skip = 0, take = 10) {
        const whereClause = {};
        if (organizationId) {
            whereClause.organizationId = organizationId;
        }
        if (status) {
            whereClause.status = status;
        }
        const findManyValidator = client_1.Prisma.validator()({
            where: whereClause,
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                _count: {
                    select: {
                        agendaGroups: true,
                    },
                },
            },
            orderBy: { scheduledAt: 'desc' },
            skip,
            take,
        });
        return database_1.default.boardMeeting.findMany(findManyValidator);
    }
    async count(organizationId, status) {
        const whereClause = {};
        if (organizationId) {
            whereClause.organizationId = organizationId;
        }
        if (status) {
            whereClause.status = status;
        }
        return database_1.default.boardMeeting.count({ where: whereClause });
    }
    async create(data, createdById) {
        const createValidator = client_1.Prisma.validator()({
            data: {
                title: data.title,
                description: data.description || null,
                scheduledAt: data.scheduledAt,
                duration: data.duration || null,
                location: data.location || null,
                organizationId: data.organizationId,
                createdById,
            },
            include: {
                organization: true,
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        return database_1.default.boardMeeting.create(createValidator);
    }
    async update(id, data) {
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.scheduledAt !== undefined)
            updateData.scheduledAt = data.scheduledAt;
        if (data.duration !== undefined)
            updateData.duration = data.duration;
        if (data.location !== undefined)
            updateData.location = data.location;
        if (data.status !== undefined)
            updateData.status = data.status;
        const updateValidator = client_1.Prisma.validator()({
            where: { id },
            data: updateData,
            include: {
                organization: true,
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        return database_1.default.boardMeeting.update(updateValidator);
    }
    async delete(id) {
        const deleteValidator = client_1.Prisma.validator()({
            where: { id },
        });
        return database_1.default.boardMeeting.delete(deleteValidator);
    }
    async findByOrganizationId(organizationId) {
        const findManyValidator = client_1.Prisma.validator()({
            where: { organizationId },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                _count: {
                    select: {
                        agendaGroups: true,
                    },
                },
            },
            orderBy: { scheduledAt: 'desc' },
        });
        return database_1.default.boardMeeting.findMany(findManyValidator);
    }
}
exports.BoardMeetingModel = BoardMeetingModel;
//# sourceMappingURL=boardMeetingModel.js.map