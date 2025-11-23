import { createClient } from '@supabase/supabase-js';

// Helper to safely access process.env without crashing in some bundlers
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return process.env[key];
  } catch {
    return undefined;
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_KEY');

// ------------------------------------------------------------------

let client;

// Validate keys before creating the client
if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  client = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("Supabase credentials missing in .env file. App running in offline mode.");
  
  // Return a mock client so the app doesn't crash on load
  client = {
    from: (table: string) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured in .env' } }),
    })
  };
}

export const supabase = client as any;