"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const PORT = process.env['PORT'] || 4000;
async function startServer() {
    try {
        await database_1.DatabaseConnection.connect();
        console.log('✅ Database connected successfully (singleton with connection pooling)');
        const server = app_1.default.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
            console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
            console.log(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
        });
        const gracefulShutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
            server.close(async () => {
                console.log('📪 HTTP server closed');
                try {
                    await database_1.DatabaseConnection.disconnect();
                    console.log('🔌 Database disconnected');
                    process.exit(0);
                }
                catch (error) {
                    console.error('❌ Error during database disconnect:', error);
                    process.exit(1);
                }
            });
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
startServer().catch((error) => {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map