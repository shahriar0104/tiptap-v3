import { z } from 'zod';
export declare const createBoardMeetingSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        scheduledAt: z.ZodString;
        duration: z.ZodOptional<z.ZodNumber>;
        location: z.ZodOptional<z.ZodString>;
        organizationId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        organizationId: string;
        title: string;
        scheduledAt: string;
        description?: string | undefined;
        duration?: number | undefined;
        location?: string | undefined;
    }, {
        organizationId: string;
        title: string;
        scheduledAt: string;
        description?: string | undefined;
        duration?: number | undefined;
        location?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        organizationId: string;
        title: string;
        scheduledAt: string;
        description?: string | undefined;
        duration?: number | undefined;
        location?: string | undefined;
    };
}, {
    body: {
        organizationId: string;
        title: string;
        scheduledAt: string;
        description?: string | undefined;
        duration?: number | undefined;
        location?: string | undefined;
    };
}>;
export declare const updateBoardMeetingSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        scheduledAt: z.ZodOptional<z.ZodString>;
        duration: z.ZodOptional<z.ZodNumber>;
        location: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]>>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        description?: string | undefined;
        scheduledAt?: string | undefined;
        duration?: number | undefined;
        location?: string | undefined;
        status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | undefined;
    }, {
        title?: string | undefined;
        description?: string | undefined;
        scheduledAt?: string | undefined;
        duration?: number | undefined;
        location?: string | undefined;
        status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | undefined;
    }>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        title?: string | undefined;
        description?: string | undefined;
        scheduledAt?: string | undefined;
        duration?: number | undefined;
        location?: string | undefined;
        status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        title?: string | undefined;
        description?: string | undefined;
        scheduledAt?: string | undefined;
        duration?: number | undefined;
        location?: string | undefined;
        status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | undefined;
    };
}>;
export declare const getBoardMeetingSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export declare const getBoardMeetingsSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        organizationId: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]>>;
    }, "strip", z.ZodTypeAny, {
        limit?: string | undefined;
        organizationId?: string | undefined;
        status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | undefined;
        page?: string | undefined;
    }, {
        limit?: string | undefined;
        organizationId?: string | undefined;
        status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | undefined;
        page?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit?: string | undefined;
        organizationId?: string | undefined;
        status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | undefined;
        page?: string | undefined;
    };
}, {
    query: {
        limit?: string | undefined;
        organizationId?: string | undefined;
        status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | undefined;
        page?: string | undefined;
    };
}>;
export type CreateBoardMeetingInput = z.infer<typeof createBoardMeetingSchema>['body'];
export type UpdateBoardMeetingInput = z.infer<typeof updateBoardMeetingSchema>['body'];
export type GetBoardMeetingParams = z.infer<typeof getBoardMeetingSchema>['params'];
export type GetBoardMeetingsQuery = z.infer<typeof getBoardMeetingsSchema>['query'];
//# sourceMappingURL=boardMeeting.d.ts.map