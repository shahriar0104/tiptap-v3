"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBoardMeetingsSchema = exports.getBoardMeetingSchema = exports.updateBoardMeetingSchema = exports.createBoardMeetingSchema = void 0;
const zod_1 = require("zod");
exports.createBoardMeetingSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required').max(255, 'Title too long'),
        description: zod_1.z.string().max(1000, 'Description too long').optional(),
        scheduledAt: zod_1.z.string().datetime('Invalid date format'),
        duration: zod_1.z.number().int().positive('Duration must be positive').optional(),
        location: zod_1.z.string().max(255, 'Location too long').optional(),
        organizationId: zod_1.z.string().uuid('Invalid organization ID'),
    }),
});
exports.updateBoardMeetingSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
        description: zod_1.z.string().max(1000, 'Description too long').optional(),
        scheduledAt: zod_1.z.string().datetime('Invalid date format').optional(),
        duration: zod_1.z.number().int().positive('Duration must be positive').optional(),
        location: zod_1.z.string().max(255, 'Location too long').optional(),
        status: zod_1.z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid meeting ID'),
    }),
});
exports.getBoardMeetingSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid meeting ID'),
    }),
});
exports.getBoardMeetingsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/, 'Page must be a number').optional(),
        limit: zod_1.z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
        organizationId: zod_1.z.string().uuid('Invalid organization ID').optional(),
        status: zod_1.z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    }),
});
//# sourceMappingURL=boardMeeting.js.map