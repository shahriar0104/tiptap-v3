"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnection = void 0;
const client_1 = require("@prisma/client");
class DatabaseConnection {
    static instance;
    constructor() { }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            if (process.env['NODE_ENV'] === 'development' && global.__prisma) {
                DatabaseConnection.instance = global.__prisma;
            }
            else {
                const databaseUrl = process.env['DATABASE_URL'];
                if (!databaseUrl) {
                    throw new Error('DATABASE_URL environment variable is required');
                }
                DatabaseConnection.instance = new client_1.PrismaClient({
                    log: process.env['NODE_ENV'] === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
                    datasources: {
                        db: {
                            url: databaseUrl,
                        },
                    },
                });
                if (process.env['NODE_ENV'] === 'development') {
                    global.__prisma = DatabaseConnection.instance;
                }
            }
        }
        return DatabaseConnection.instance;
    }
    static async disconnect() {
        if (DatabaseConnection.instance) {
            await DatabaseConnection.instance.$disconnect();
        }
    }
    static async connect() {
        const client = DatabaseConnection.getInstance();
        await client.$connect();
    }
}
exports.DatabaseConnection = DatabaseConnection;
const prisma = DatabaseConnection.getInstance();
exports.default = prisma;
//# sourceMappingURL=database.js.map