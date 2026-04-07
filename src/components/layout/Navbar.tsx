import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Beer, Sun, Moon, LogOut, Plus, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export function Navbar() {
  const { user, signOut } = useAuthStore();
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = (
    <>
      <Link
        to="/recipes"
        onClick={() => setMobileOpen(false)}
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Recipes
      </Link>
      {user && (
        <Link
          to="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Dashboard
        </Link>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <Beer className="h-7 w-7 text-amber-500" />
            <span className="text-amber-500">OpenKettle</span>
          </Link>

          {/* Center nav — desktop */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks}
          </div>

          {/* Right — desktop */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setDark((d) => !d)}
              className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {user ? (
              <>
                <span className="text-sm text-muted-foreground select-none">
                  {user.email?.split('@')[0]}
                </span>
                <Link
                  to="/recipes/new"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Recipe
                </Link>
                <button
                  onClick={() => signOut()}
                  className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile right — dark toggle + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setDark((d) => !d)}
              className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {navLinks}
            </div>
            <div className="border-t border-border pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <Link
                    to="/recipes/new"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors w-full justify-center"
                  >
                    <Plus className="h-4 w-4" />
                    New Recipe
                  </Link>
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors w-full justify-center cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors w-full"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
