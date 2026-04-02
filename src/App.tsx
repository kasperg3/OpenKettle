import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { RecipesPage } from '@/pages/RecipesPage';
import { RecipeDetailPage } from '@/pages/RecipeDetailPage';
import { RecipeEditorPage } from '@/pages/RecipeEditorPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LoginPage } from '@/pages/LoginPage';
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AuthInitializer />
        <Routes>
          {/* Login page has its own layout */}
          <Route path="/login" element={<LoginPage />} />

          {/* All other routes use AppShell */}
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/new" element={<RecipeEditorPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/recipes/:id/edit" element={<RecipeEditorPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}
