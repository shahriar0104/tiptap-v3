"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendaItemModel = void 0;
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../config/database"));
class AgendaItemModel {
    async findById(id) {
        const findByIdValidator = client_1.Prisma.validator()({
            where: { id },
            include: {
                agendaGroup: {
                    select: {
                        id: true,
                        title: true,
                        boardMeetingId: true,
                        boardMeeting: {
                            select: {
                                id: true,
                                title: true,
                                organizationId: true,
                            },
                        },
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
            },
        });
        return database_1.default.agendaItem.findUnique(findByIdValidator);
    }
    async findByAgendaGroupId(agendaGroupId) {
        const findManyValidator = client_1.Prisma.validator()({
            where: { agendaGroupId },
            include: {
                agendaGroup: {
                    select: {
                        id: true,
                        title: true,
                        boardMeetingId: true,
                        boardMeeting: {
                            select: {
                                id: true,
                                title: true,
                                organizationId: true,
                            },
                        },
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
            },
            orderBy: { order: 'asc' },
        });
        return database_1.default.agendaItem.findMany(findManyValidator);
    }
    async create(data, createdById) {
        const createValidator = client_1.Prisma.validator()({
            data: {
                title: data.title,
                description: data.description || null,
                order: data.order,
                duration: data.duration || null,
                type: data.type || 'DISCUSSION',
                agendaGroupId: data.agendaGroupId,
                createdById,
            },
            include: {
                agendaGroup: {
                    select: {
                        id: true,
                        title: true,
                        boardMeetingId: true,
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
            },
        });
        return database_1.default.agendaItem.create(createValidator);
    }
    async update(id, data) {
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.order !== undefined)
            updateData.order = data.order;
        if (data.duration !== undefined)
            updateData.duration = data.duration;
        if (data.type !== undefined)
            updateData.type = data.type;
        if (data.status !== undefined)
            updateData.status = data.status;
        const updateValidator = client_1.Prisma.validator()({
            where: { id },
            data: updateData,
            include: {
                agendaGroup: {
                    select: {
                        id: true,
                        title: true,
                        boardMeetingId: true,
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
            },
        });
        return database_1.default.agendaItem.update(updateValidator);
    }
    async delete(id) {
        const deleteValidator = client_1.Prisma.validator()({
            where: { id },
        });
        return database_1.default.agendaItem.delete(deleteValidator);
    }
    async reorderItems(agendaGroupId, itemOrders) {
        await database_1.default.$transaction(itemOrders.map(({ id, order }) => database_1.default.agendaItem.update({
            where: { id, agendaGroupId },
            data: { order },
        })));
    }
    async getMaxOrder(agendaGroupId) {
        const result = await database_1.default.agendaItem.aggregate({
            where: { agendaGroupId },
            _max: { order: true },
        });
        return result._max.order ?? -1;
    }
    async updateStatus(id, status) {
        const updateValidator = client_1.Prisma.validator()({
            where: { id },
            data: { status },
            include: {
                agendaGroup: {
                    select: {
                        id: true,
                        title: true,
                        boardMeetingId: true,
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
            },
        });
        return database_1.default.agendaItem.update(updateValidator);
    }
    async findByBoardMeetingId(boardMeetingId) {
        const findManyValidator = client_1.Prisma.validator()({
            where: {
                agendaGroup: {
                    boardMeetingId,
                },
            },
            include: {
                agendaGroup: {
                    select: {
                        id: true,
                        title: true,
                        boardMeetingId: true,
                        boardMeeting: {
                            select: {
                                id: true,
                                title: true,
                                organizationId: true,
                            },
                        },
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
            },
            orderBy: [
                { agendaGroup: { order: 'asc' } },
                { order: 'asc' },
            ],
        });
        return database_1.default.agendaItem.findMany(findManyValidator);
    }
}
exports.AgendaItemModel = AgendaItemModel;
//# sourceMappingURL=agendaItemModel.js.map