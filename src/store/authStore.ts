import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setLoading: (loading) => set({ loading }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  initialize: () => {
    // Get initial session; catch network/config failures so loading never hangs
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        set({ session, user: session?.user ?? null, loading: false });
      })
      .catch(() => {
        set({ loading: false });
      });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      set({ session, user: session?.user ?? null, loading: false });

      // When the user arrives via a password-reset email, Supabase fires
      // PASSWORD_RECOVERY regardless of whether the token was in the URL
      // fragment (legacy implicit flow: #access_token=…) or a query-param
      // code (PKCE flow: ?code=…).  In the implicit case HashRouter can't
      // match the fragment to a route so ResetPasswordPage never mounts and
      // its own listener never fires.  Force-navigate here so the page is
      // always correct.
      if (event === 'PASSWORD_RECOVERY' && !window.location.hash.startsWith('#/reset-password')) {
        window.location.hash = '/reset-password';
      }
    });

    return () => subscription.unsubscribe();
  },
}));
