import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabaseConfigError } from '@/lib/supabase';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { RecipesPage } from '@/pages/RecipesPage';
import { RecipeDetailPage } from '@/pages/RecipeDetailPage';
import { RecipeEditorPage } from '@/pages/RecipeEditorPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LoginPage } from '@/pages/LoginPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { UserProfilePage } from '@/pages/UserProfilePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AuthInitializer() {
  const initialize = useAuthStore(s => s.initialize);
  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);
  return null;
}

function ConfigBanner() {
  if (!supabaseConfigError) return null;
  return (
    <div className="sticky top-0 z-50 flex items-center gap-2 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-300 dark:border-amber-700 px-4 py-2 text-sm text-amber-900 dark:text-amber-200">
      <span className="font-semibold flex-shrink-0">Config missing</span>
      <span className="truncate">{supabaseConfigError}</span>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <ConfigBanner />
        <AuthInitializer />
        <Routes>
          {/* Standalone pages (no AppShell) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* All other routes use AppShell */}
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/new" element={<RecipeEditorPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/recipes/:id/edit" element={<RecipeEditorPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/users/:username" element={<UserProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}
