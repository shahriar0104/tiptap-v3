import {createClient} from '@supabase/supabase-js';
import {config} from './app.js';

// Create Supabase client for server-side operations with better timeout handling
const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          timeout: process.env.REQ_TIMEOUT, // 30-second timeout instead of the default 10s
        });
      },
    },
  }
);

export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      persistSession: false,
    },
  }
);

export default supabase;
