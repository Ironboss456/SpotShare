import { createClient } from '@supabase/supabase-js';

// Access environment variables directly so Vite can replace them at build time.
// Using dynamic access (e.g. process.env[key]) prevents Vite's compile-time replacement.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// ------------------------------------------------------------------

let client;

// Validate keys before creating the client
if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  client = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("Supabase credentials missing or invalid. App running in offline mode.");
  
  // Return a mock client so the app doesn't crash on load
  client = {
    from: (table: string) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    })
  };
}

export const supabase = client as any;