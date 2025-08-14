"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgendaItemSchema = exports.updateAgendaItemSchema = exports.createAgendaItemSchema = exports.getAgendaGroupSchema = exports.updateAgendaGroupSchema = exports.createAgendaGroupSchema = void 0;
const zod_1 = require("zod");
exports.createAgendaGroupSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required').max(255, 'Title too long'),
        description: zod_1.z.string().max(1000, 'Description too long').optional(),
        order: zod_1.z.number().int().min(0, 'Order must be non-negative'),
        boardMeetingId: zod_1.z.string().uuid('Invalid board meeting ID'),
    }),
});
exports.updateAgendaGroupSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
        description: zod_1.z.string().max(1000, 'Description too long').optional(),
        order: zod_1.z.number().int().min(0, 'Order must be non-negative').optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid agenda group ID'),
    }),
});
exports.getAgendaGroupSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid agenda group ID'),
    }),
});
exports.createAgendaItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required').max(255, 'Title too long'),
        description: zod_1.z.string().max(1000, 'Description too long').optional(),
        order: zod_1.z.number().int().min(0, 'Order must be non-negative'),
        duration: zod_1.z.number().int().positive('Duration must be positive').optional(),
        type: zod_1.z.enum(['DISCUSSION', 'PRESENTATION', 'DECISION', 'INFORMATION']).optional(),
        agendaGroupId: zod_1.z.string().uuid('Invalid agenda group ID'),
    }),
});
exports.updateAgendaItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
        description: zod_1.z.string().max(1000, 'Description too long').optional(),
        order: zod_1.z.number().int().min(0, 'Order must be non-negative').optional(),
        duration: zod_1.z.number().int().positive('Duration must be positive').optional(),
        type: zod_1.z.enum(['DISCUSSION', 'PRESENTATION', 'DECISION', 'INFORMATION']).optional(),
        status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED']).optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid agenda item ID'),
    }),
});
exports.getAgendaItemSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid agenda item ID'),
    }),
});
//# sourceMappingURL=agenda.js.map