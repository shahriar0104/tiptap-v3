"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendaGroupModel = void 0;
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../config/database"));
class AgendaGroupModel {
    async findById(id) {
        const findByIdValidator = client_1.Prisma.validator()({
            where: { id },
            include: {
                boardMeeting: {
                    select: {
                        id: true,
                        title: true,
                        organizationId: true,
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
                agendaItems: {
                    orderBy: { order: 'asc' },
                    include: {
                        createdBy: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });
        return database_1.default.agendaGroup.findUnique(findByIdValidator);
    }
    async findByBoardMeetingId(boardMeetingId) {
        const findManyValidator = client_1.Prisma.validator()({
            where: { boardMeetingId },
            include: {
                boardMeeting: {
                    select: {
                        id: true,
                        title: true,
                        organizationId: true,
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
                agendaItems: {
                    orderBy: { order: 'asc' },
                    include: {
                        createdBy: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
            orderBy: { order: 'asc' },
        });
        return database_1.default.agendaGroup.findMany(findManyValidator);
    }
    async create(data, createdById) {
        const createValidator = client_1.Prisma.validator()({
            data: {
                title: data.title,
                description: data.description || null,
                order: data.order,
                boardMeetingId: data.boardMeetingId,
                createdById,
            },
            include: {
                boardMeeting: {
                    select: {
                        id: true,
                        title: true,
                        organizationId: true,
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
        return database_1.default.agendaGroup.create(createValidator);
    }
    async update(id, data) {
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.order !== undefined)
            updateData.order = data.order;
        const updateValidator = client_1.Prisma.validator()({
            where: { id },
            data: updateData,
            include: {
                boardMeeting: {
                    select: {
                        id: true,
                        title: true,
                        organizationId: true,
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
                agendaItems: {
                    orderBy: { order: 'asc' },
                    include: {
                        createdBy: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });
        return database_1.default.agendaGroup.update(updateValidator);
    }
    async delete(id) {
        const deleteValidator = client_1.Prisma.validator()({
            where: { id },
        });
        return database_1.default.agendaGroup.delete(deleteValidator);
    }
    async reorderGroups(boardMeetingId, groupOrders) {
        await database_1.default.$transaction(groupOrders.map(({ id, order }) => database_1.default.agendaGroup.update({
            where: { id, boardMeetingId },
            data: { order },
        })));
    }
    async getMaxOrder(boardMeetingId) {
        const result = await database_1.default.agendaGroup.aggregate({
            where: { boardMeetingId },
            _max: { order: true },
        });
        return result._max.order ?? -1;
    }
}
exports.AgendaGroupModel = AgendaGroupModel;
//# sourceMappingURL=agendaGroupModel.js.map