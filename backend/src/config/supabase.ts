import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './app.js';

// Create Supabase client for server-side operations with better timeout handling
const supabase: SupabaseClient = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      fetch: (url: RequestInfo | URL, options: RequestInit = {}) => {
        return fetch(url, {
          ...options,
          // @ts-ignore - timeout is not in RequestInit type but works in Node.js
          timeout: parseInt(process.env['REQ_TIMEOUT'] || '30000'), // 30-second timeout instead of the default 10s
        });
      },
    },
  }
);

export const supabaseAdmin: SupabaseClient = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      persistSession: false,
    },
  }
);

export default supabase;
