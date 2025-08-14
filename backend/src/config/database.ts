import { PrismaClient } from '@prisma/client';

interface DatabaseUrlInfo {
  protocol?: string;
  host?: string;
  port?: string;
  database?: string;
  hasUsername?: boolean;
  hasPassword?: boolean;
  isValid: boolean;
  error?: string;
}

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'disconnected';
  message: string;
}

class Database {
  private prisma: PrismaClient | null = null;
  private _isConnected: boolean = false;

  async connect(): Promise<PrismaClient> {
    try {
      // Validate DATABASE_URL
      const databaseUrl = process.env['DATABASE_URL'];
      if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is required');
      }

      console.log('🔗 Attempting to connect to database...');
      console.log('📊 Database URL format check:', this.validateDatabaseUrl(databaseUrl));

      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
        log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn', 'info'] : ['error'],
        errorFormat: 'pretty',
      });

      // Test the connection with a simple query
      console.log('🧪 Testing database connection...');
      await this.prisma.$connect();
      
      // Test with a simple query to ensure the connection works
      try {
        await this.prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Database connection test successful');
      } catch (queryError) {
        const error = queryError as Error;
        console.error('❌ Database query test failed:', error);
        throw new Error(`Database connection test failed: ${error.message}`);
      }

      this._isConnected = true;
      console.log('✅ Database connected successfully');
      console.log('🌍 Environment:', process.env['NODE_ENV']);
      console.log('🔧 Prisma client generated and ready');
      
      return this.prisma;
    } catch (error) {
      const err = error as Error;
      console.error('❌ Database connection failed:');
      console.error('   Error:', err.message);
      console.error('   Stack:', err.stack);
      
      // Provide helpful debugging information
      this.printDebugInfo();
      
      throw error;
    }
  }

  private validateDatabaseUrl(url: string): DatabaseUrlInfo {
    try {
      const urlObj = new URL(url);
      return {
        protocol: urlObj.protocol,
        host: urlObj.hostname,
        port: urlObj.port,
        database: urlObj.pathname.slice(1),
        hasUsername: !!urlObj.username,
        hasPassword: !!urlObj.password,
        isValid: true
      };
    } catch (error) {
      const err = error as Error;
      return {
        isValid: false,
        error: err.message
      };
    }
  }

  private printDebugInfo(): void {
    console.log('\n🔍 Debug Information:');
    console.log('   NODE_ENV:', process.env['NODE_ENV']);
    console.log('   DATABASE_URL exists:', !!process.env['DATABASE_URL']);
    console.log('   SUPABASE_URL exists:', !!process.env['SUPABASE_URL']);
    console.log('   SUPABASE_ANON_KEY exists:', !!process.env['SUPABASE_ANON_KEY']);
    
    if (process.env['DATABASE_URL']) {
      const urlInfo = this.validateDatabaseUrl(process.env['DATABASE_URL']);
      console.log('   DATABASE_URL format:', urlInfo);
    }
    
    console.log('\n💡 Troubleshooting Tips:');
    console.log('   1. Check if your Supabase database is running');
    console.log('   2. Verify your DATABASE_URL format');
    console.log('   3. Ensure your IP is allowed in Supabase');
    console.log('   4. Check if Prisma client is generated: npm run prisma:generate');
    console.log('   5. Try running migrations: npm run prisma:migrate');
  }

  async disconnect(): Promise<void> {
    if (this.prisma) {
      try {
        await this.prisma.$disconnect();
        this._isConnected = false;
        console.log('✅ Database disconnected');
      } catch (error) {
        console.error('❌ Error disconnecting from database:', error);
      }
    }
  }

  getClient(): PrismaClient {
    if (!this.prisma) {
      throw new Error('Database not connected. Call connect() first.');
    }
    if (!this._isConnected) {
      throw new Error('Database connection is not ready. Please wait for connection to complete.');
    }
    return this.prisma;
  }

  isConnected(): boolean {
    return this._isConnected && this.prisma !== null;
  }

  // Helper method for transactions
  async transaction<T>(callback: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>): Promise<T> {
    if (!this.prisma) {
      throw new Error('Database not connected. Call connect() first.');
    }
    if (!this._isConnected) {
      throw new Error('Database connection is not ready. Please wait for connection to complete.');
    }
    
    return await this.prisma.$transaction(callback);
  }

  async executeTransaction<T>(callback: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>): Promise<T> {
    return this.getClient().$transaction(callback);
  }

  // Health check method
  async healthCheck(): Promise<HealthCheckResult> {
    try {
      if (!this.prisma || !this._isConnected) {
        return { status: 'disconnected', message: 'Database not connected' };
      }
      
      await this.prisma.$queryRaw`SELECT 1 as health_check`;
      return { status: 'healthy', message: 'Database connection is working' };
    } catch (error) {
      const err = error as Error;
      return { status: 'unhealthy', message: err.message };
    }
  }
}

// Create a singleton instance
const database = new Database();

export default database;
