import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string | undefined;

// Capture config errors without throwing at module scope.
// A module-level throw crashes the entire app before React mounts,
// which cannot be caught by an error boundary.
export const supabaseConfigError: string | null =
  !supabaseUrl || !supabaseKey
    ? 'Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY). Copy .env.example to .env.local and fill in your values.'
    : null;

// Fall back to placeholder values so modules that import `supabase` don't
// fail to load. API calls will fail with network errors, which TanStack Query
// surfaces gracefully rather than crashing the app.
// Use || (not ??) because GitHub Actions sets unset secrets to "" not undefined.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export type { User, Session } from '@supabase/supabase-js';
