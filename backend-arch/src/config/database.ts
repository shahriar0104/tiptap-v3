import { PrismaClient } from '@prisma/client';

// Global variable to store the Prisma instance
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern for Prisma client with connection pooling
class DatabaseConnection {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      // Check if we're in development and use global variable to prevent multiple instances
      if (process.env.NODE_ENV === 'development' && global.__prisma) {
        DatabaseConnection.instance = global.__prisma;
      } else {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
          throw new Error('DATABASE_URL environment variable is required');
        }

        DatabaseConnection.instance = new PrismaClient({
          log:
            process.env.NODE_ENV === 'development'
              ? ['query', 'info', 'warn', 'error']
              : ['error'],
          datasources: {
            db: {
              url: databaseUrl,
            },
          },
          // Connection pool is handled by Prisma automatically
          // Additional configuration can be done via DATABASE_URL connection parameters
        });

        // Store in global variable for development hot reloading
        if (process.env.NODE_ENV === 'development') {
          global.__prisma = DatabaseConnection.instance;
        }
      }
    }

    return DatabaseConnection.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseConnection.instance) {
      await DatabaseConnection.instance.$disconnect();
    }
  }

  public static async connect(): Promise<void> {
    const client = DatabaseConnection.getInstance();
    await client.$connect();
  }
}

// Export the singleton instance
const prisma = DatabaseConnection.getInstance();

export default prisma;
export { DatabaseConnection };
