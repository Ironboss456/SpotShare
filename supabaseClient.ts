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
  
  // mockBuilder allows chaining methods like .select().eq().is() without crashing
  const mockBuilder = {
    select: () => mockBuilder,
    insert: () => mockBuilder,
    delete: () => mockBuilder,
    eq: () => mockBuilder,
    is: () => mockBuilder,
    then: (resolve: any) => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }).then(resolve)
  };

  // Return a mock client so the app doesn't crash on load
  client = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase credentials missing' } }),
      signUp: () => Promise.resolve({ error: { message: 'Supabase credentials missing' } }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: (table: string) => mockBuilder
  };
}

export const supabase = client as any;