// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';

    PORT: number;
    REQ_TIMEOUT: number;

    DATABASE_URL?: string;
    POOLER_URL?: string;

    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;

    JWT_SECRET?: string
    JWT_EXPIRES_IN?: string

    LOG_LEVEL: 'info' | 'warn' | 'error' | 'debug';
    LOG_PRETTY_PRINT: 'true' | 'false';

    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;

    ALLOWED_ORIGINS: 'http://localhost:3000' | 'http://localhost:3001';

    BACKEND_URL: string;
    FRONTEND_URL: string;
  }
}
