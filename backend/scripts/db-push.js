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
 * Run Prisma db push using DIRECT_URL for Supabase
 */
async function runDbPush() {
  console.log('🔄 Running Prisma db push with direct URL...');
  
  // Check if DIRECT_URL is available
  if (!process.env.DIRECT_URL) {
    console.error('❌ DIRECT_URL environment variable is required for db operations');
    console.log('Please add DIRECT_URL to your .env file with the direct Supabase connection string');
    process.exit(1);
  }

  // Set up environment for Prisma
  const env = {
    ...process.env,
    DATABASE_URL: process.env.DIRECT_URL, // Use direct URL for db push
  };

  // Run prisma db push
  const prismaProcess = spawn('npx', ['prisma', 'db', 'push'], {
    stdio: 'inherit',
    env,
    cwd: path.join(__dirname, '..'),
  });

  prismaProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Database schema pushed successfully');
      console.log('🔄 Generating Prisma client...');
      
      // Generate Prisma client after successful push
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
      console.error('❌ Database push failed');
      process.exit(code);
    }
  });

  prismaProcess.on('error', (error) => {
    console.error('❌ Failed to start db push process:', error);
    process.exit(1);
  });
}

// Run the db push
runDbPush().catch((error) => {
  console.error('❌ DB push script failed:', error);
  process.exit(1);
});
