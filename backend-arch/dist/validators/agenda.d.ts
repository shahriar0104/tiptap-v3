import { z } from 'zod';
export declare const createAgendaGroupSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        order: z.ZodNumber;
        boardMeetingId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        order: number;
        boardMeetingId: string;
        description?: string | undefined;
    }, {
        title: string;
        order: number;
        boardMeetingId: string;
        description?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title: string;
        order: number;
        boardMeetingId: string;
        description?: string | undefined;
    };
}, {
    body: {
        title: string;
        order: number;
        boardMeetingId: string;
        description?: string | undefined;
    };
}>;
export declare const updateAgendaGroupSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        order: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        description?: string | undefined;
        order?: number | undefined;
    }, {
        title?: string | undefined;
        description?: string | undefined;
        order?: number | undefined;
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
        order?: number | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        title?: string | undefined;
        description?: string | undefined;
        order?: number | undefined;
    };
}>;
export declare const getAgendaGroupSchema: z.ZodObject<{
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
export declare const createAgendaItemSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        order: z.ZodNumber;
        duration: z.ZodOptional<z.ZodNumber>;
        type: z.ZodOptional<z.ZodEnum<["DISCUSSION", "PRESENTATION", "DECISION", "INFORMATION"]>>;
        agendaGroupId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        order: number;
        agendaGroupId: string;
        description?: string | undefined;
        duration?: number | undefined;
        type?: "DISCUSSION" | "PRESENTATION" | "DECISION" | "INFORMATION" | undefined;
    }, {
        title: string;
        order: number;
        agendaGroupId: string;
        description?: string | undefined;
        duration?: number | undefined;
        type?: "DISCUSSION" | "PRESENTATION" | "DECISION" | "INFORMATION" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title: string;
        order: number;
        agendaGroupId: string;
        description?: string | undefined;
        duration?: number | undefined;
        type?: "DISCUSSION" | "PRESENTATION" | "DECISION" | "INFORMATION" | undefined;
    };
}, {
    body: {
        title: string;
        order: number;
        agendaGroupId: string;
        description?: string | undefined;
        duration?: number | undefined;
        type?: "DISCUSSION" | "PRESENTATION" | "DECISION" | "INFORMATION" | undefined;
    };
}>;
export declare const updateAgendaItemSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        order: z.ZodOptional<z.ZodNumber>;
        duration: z.ZodOptional<z.ZodNumber>;
        type: z.ZodOptional<z.ZodEnum<["DISCUSSION", "PRESENTATION", "DECISION", "INFORMATION"]>>;
        status: z.ZodOptional<z.ZodEnum<["PENDING", "IN_PROGRESS", "COMPLETED", "DEFERRED"]>>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        description?: string | undefined;
        duration?: number | undefined;
        status?: "IN_PROGRESS" | "COMPLETED" | "PENDING" | "DEFERRED" | undefined;
        order?: number | undefined;
        type?: "DISCUSSION" | "PRESENTATION" | "DECISION" | "INFORMATION" | undefined;
    }, {
        title?: string | undefined;
        description?: string | undefined;
        duration?: number | undefined;
        status?: "IN_PROGRESS" | "COMPLETED" | "PENDING" | "DEFERRED" | undefined;
        order?: number | undefined;
        type?: "DISCUSSION" | "PRESENTATION" | "DECISION" | "INFORMATION" | undefined;
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
        duration?: number | undefined;
        status?: "IN_PROGRESS" | "COMPLETED" | "PENDING" | "DEFERRED" | undefined;
        order?: number | undefined;
        type?: "DISCUSSION" | "PRESENTATION" | "DECISION" | "INFORMATION" | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        title?: string | undefined;
        description?: string | undefined;
        duration?: number | undefined;
        status?: "IN_PROGRESS" | "COMPLETED" | "PENDING" | "DEFERRED" | undefined;
        order?: number | undefined;
        type?: "DISCUSSION" | "PRESENTATION" | "DECISION" | "INFORMATION" | undefined;
    };
}>;
export declare const getAgendaItemSchema: z.ZodObject<{
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
export type CreateAgendaGroupInput = z.infer<typeof createAgendaGroupSchema>['body'];
export type UpdateAgendaGroupInput = z.infer<typeof updateAgendaGroupSchema>['body'];
export type GetAgendaGroupParams = z.infer<typeof getAgendaGroupSchema>['params'];
export type CreateAgendaItemInput = z.infer<typeof createAgendaItemSchema>['body'];
export type UpdateAgendaItemInput = z.infer<typeof updateAgendaItemSchema>['body'];
export type GetAgendaItemParams = z.infer<typeof getAgendaItemSchema>['params'];
//# sourceMappingURL=agenda.d.ts.map