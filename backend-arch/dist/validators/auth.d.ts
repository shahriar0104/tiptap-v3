import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
    }, {
        email: string;
        password: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        password: string;
    };
}, {
    body: {
        email: string;
        password: string;
    };
}>;
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        organizationId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
        organizationId?: string | undefined;
    }, {
        email: string;
        password: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
        organizationId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        password: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
        organizationId?: string | undefined;
    };
}, {
    body: {
        email: string;
        password: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
        organizationId?: string | undefined;
    };
}>;
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RegisterInput = z.infer<typeof registerSchema>['body'];
//# sourceMappingURL=auth.d.ts.map