import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppConfig } from '../types/index.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config: AppConfig & {
  database: { url: string };
  supabase: { url: string; anonKey: string; serviceRoleKey: string };
  jwt: { secret: string; expiresIn: string };
  logging: { level: string };
  rateLimit: { windowMs: number; maxRequests: number };
  cors: { allowedOrigins: string[] };
  paths: { root: string; src: string };
  validation: { maxTitleLength: number; maxDescriptionLength: number; maxAgendaItems: number };
} = {
  // Server configuration
  port: parseInt(process.env['PORT'] || '4000'),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  
  // Database configuration
  database: {
    url: process.env['DATABASE_URL'] || '',
  },
  
  // Supabase configuration
  supabase: {
    url: process.env['SUPABASE_URL'] || '',
    anonKey: process.env['SUPABASE_ANON_KEY'] || '',
    serviceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] || '',
  },
  
  // JWT configuration
  jwt: {
    secret: process.env['JWT_SECRET'] || 'your-secret-key',
    expiresIn: process.env['JWT_EXPIRES_IN'] || '7d',
  },
  
  // Logging
  logging: {
    level: process.env['LOG_LEVEL'] || 'info',
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
  },
  
  // CORS
  cors: {
    allowedOrigins: process.env['ALLOWED_ORIGINS']?.split(',') || [
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

  // Required AppConfig fields
  corsOrigins: process.env['ALLOWED_ORIGINS']?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4000'
  ],
  jwtSecret: process.env['JWT_SECRET'] || 'your-secret-key',
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '7d',
  rateLimitWindowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'),
  rateLimitMaxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
  cookieDomain: process.env['COOKIE_DOMAIN'] || 'localhost',
  frontendUrl: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  requestTimeout: parseInt(process.env['REQ_TIMEOUT'] || '30000'),
  logLevel: process.env['LOG_LEVEL'] || 'info',
};

// Validate required environment variables
const requiredEnvVars: string[] = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

export default config;
