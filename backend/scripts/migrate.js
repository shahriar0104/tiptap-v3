#!/usr/bin/env node

import { spawn } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Run Prisma migration using DIRECT_URL for Supabase
 */
async function runMigration() {
  console.log('🔄 Running Prisma migration with direct URL...');
  
  // Check if DIRECT_URL is available
  if (!process.env.DIRECT_URL) {
    console.error('❌ DIRECT_URL environment variable is required for migrations');
    console.log('Please add DIRECT_URL to your .env file with the direct Supabase connection string');
    process.exit(1);
  }

  // Get migration name from command line args
  const migrationName = process.argv[2] || 'migration';
  
  // Set up environment for Prisma
  const env = {
    ...process.env,
    DATABASE_URL: process.env.DIRECT_URL, // Use direct URL for migration
  };

  // Run prisma migrate dev
  const prismaProcess = spawn('npx', ['prisma', 'migrate', 'dev', '--name', migrationName], {
    stdio: 'inherit',
    env,
    cwd: path.join(__dirname, '..'),
  });

  prismaProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Migration completed successfully');
      console.log('🔄 Generating Prisma client...');
      
      // Generate Prisma client after successful migration
      const generateProcess = spawn('npx', ['prisma', 'generate'], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
      });

      generateProcess.on('close', (generateCode) => {
        if (generateCode === 0) {
          console.log('✅ Prisma client generated successfully');
        } else {
          console.error('❌ Failed to generate Prisma client');
          process.exit(generateCode);
        }
      });
    } else {
      console.error('❌ Migration failed');
      process.exit(code);
    }
  });

  prismaProcess.on('error', (error) => {
    console.error('❌ Failed to start migration process:', error);
    process.exit(1);
  });
}

// Run the migration
runMigration().catch((error) => {
  console.error('❌ Migration script failed:', error);
  process.exit(1);
});
