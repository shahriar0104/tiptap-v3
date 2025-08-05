import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  console.log('🧪 Testing Database Connection...\n');

  // Check environment variables
  console.log('📋 Environment Variables Check:');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');

  if (!process.env.DATABASE_URL) {
    console.error('\n❌ DATABASE_URL is required but not set');
    console.log('💡 Please set DATABASE_URL in your .env file');
    process.exit(1);
  }

  // Validate DATABASE_URL format
  console.log('\n🔍 DATABASE_URL Format Check:');
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('   Protocol:', url.protocol);
    console.log('   Host:', url.hostname);
    console.log('   Port:', url.port || 'default');
    console.log('   Database:', url.pathname.slice(1));
    console.log('   Username:', url.username ? '✅ Set' : '❌ Missing');
    console.log('   Password:', url.password ? '✅ Set' : '❌ Missing');
  } catch (error) {
    console.error('   ❌ Invalid DATABASE_URL format:', error.message);
    process.exit(1);
  }

  // Test Prisma connection
  console.log('\n🔗 Testing Prisma Connection:');
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    console.log('   Connecting to database...');
    await prisma.$connect();
    console.log('   ✅ Prisma connection successful');

    console.log('   Testing query...');
    const result = await prisma.$queryRaw`SELECT 1 as test, current_database() as database, current_user as user`;
    console.log('   ✅ Query test successful');
    console.log('   Database:', result[0].database);
    console.log('   User:', result[0].user);

    // Test schema access
    console.log('\n📊 Testing Schema Access:');
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `;
      console.log('   ✅ Schema access successful');
      console.log('   Tables found:', tables.length);
      if (tables.length > 0) {
        console.log('   Table names:', tables.map(t => t.table_name).join(', '));
      }
    } catch (schemaError) {
      console.log('   ⚠️ Schema access failed (this might be normal for new databases):', schemaError.message);
    }

    console.log('\n✅ Database connection test completed successfully!');
    console.log('🚀 Your database is ready to use.');

  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error('   Error:', error.message);
    
    // Provide specific troubleshooting tips based on error
    if (error.message.includes('authentication')) {
      console.log('\n💡 Authentication Error - Check:');
      console.log('   1. Database username and password in DATABASE_URL');
      console.log('   2. User permissions in Supabase');
      console.log('   3. Database role and privileges');
    } else if (error.message.includes('connection')) {
      console.log('\n💡 Connection Error - Check:');
      console.log('   1. Database is running and accessible');
      console.log('   2. Firewall settings');
      console.log('   3. Network connectivity');
      console.log('   4. Supabase project status');
    } else if (error.message.includes('database')) {
      console.log('\n💡 Database Error - Check:');
      console.log('   1. Database name in DATABASE_URL');
      console.log('   2. Database exists in Supabase');
      console.log('   3. Run migrations: npm run prisma:migrate');
    }

    console.log('\n🔧 General Troubleshooting:');
    console.log('   1. Verify your Supabase project is active');
    console.log('   2. Check your IP is allowed in Supabase settings');
    console.log('   3. Ensure DATABASE_URL is copied correctly from Supabase');
    console.log('   4. Try regenerating Prisma client: npm run prisma:generate');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabaseConnection().catch(console.error); 