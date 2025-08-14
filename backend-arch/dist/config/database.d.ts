import { PrismaClient } from '@prisma/client';
declare global {
    var __prisma: PrismaClient | undefined;
}
declare class DatabaseConnection {
    private static instance;
    private constructor();
    static getInstance(): PrismaClient;
    static disconnect(): Promise<void>;
    static connect(): Promise<void>;
}
declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export default prisma;
export { DatabaseConnection };
//# sourceMappingURL=database.d.ts.map