import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  // Server configuration
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  
  // CORS
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4000'
    ],
  },
  
  // Paths
  paths: {
    root: path.join(__dirname, '../../'),
    src: path.join(__dirname, '../'),
  },
  
  // Validation
  validation: {
    maxTitleLength: 255,
    maxDescriptionLength: 1000,
    maxAgendaItems: 50,
  },
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

export default config; 