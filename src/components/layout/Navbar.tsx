import React, { useState, useEffect } from 'react';
import { Beer, Sun, Moon, LogOut, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export function Navbar() {
  const { user, signOut } = useAuthStore();
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a
            href="/#/"
            className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <Beer className="h-7 w-7 text-amber-500" />
            <span className="text-amber-500">OpenKettle</span>
          </a>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="/#/recipes"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Recipes
            </a>
            {user && (
              <a
                href="/#/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </a>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark((d) => !d)}
              className={cn(
                'rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'
              )}
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {user ? (
              <>
                <span className="hidden sm:block text-sm text-muted-foreground">
                  {user.email?.split('@')[0]}
                </span>
                <a
                  href="/#/recipes/new"
                  className="flex items-center gap-1 rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Recipe
                </a>
                <button
                  onClick={() => signOut()}
                  className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <a
                href="/#/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
