import app from './app';
import { DatabaseConnection } from './config/database';
import { ensureStorageBucket, BUCKET_NAME } from './utils/storage';

const PORT = process.env.PORT || 4000;

async function startServer(): Promise<void> {
  try {
    // Test database connection using singleton
    await DatabaseConnection.connect();
    console.log('✅ Database connected successfully (singleton with connection pooling)');

    // Ensure storage bucket exists (private)
    await ensureStorageBucket(BUCKET_NAME, false);

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('📪 HTTP server closed');
        
        try {
          await DatabaseConnection.disconnect();
          console.log('🔌 Database disconnected');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during database disconnect:', error);
          process.exit(1);
        }
      });
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer().catch((error) => {
  console.error('❌ Server startup failed:', error);
  process.exit(1);
});
