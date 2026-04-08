import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// Supabase chainable query-builder mock
// ---------------------------------------------------------------------------

/**
 * Creates a chainable Supabase query-builder mock.
 * Every chaining method returns `this` so the full Supabase DSL works.
 * The builder is also Promise-like (thenable) so `await q` resolves to
 * `{ data, error }`.  `.single()` and `.maybeSingle()` do the same.
 */
export function makeMockBuilder(resolved: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    textSearch: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resolved),
    maybeSingle: vi.fn().mockResolvedValue(resolved),
    // Make the builder itself awaitable (for queries not ending in .single())
    then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
      Promise.resolve(resolved).then(onFulfilled, onRejected),
  };
  return builder;
}

/**
 * Creates a minimal Supabase client mock.
 * `from()` returns a fresh builder pre-configured with the given response.
 */
export function makeSupabaseMock(resolved: { data: unknown; error: unknown }) {
  const builder = makeMockBuilder(resolved);
  const fromMock = vi.fn().mockReturnValue(builder);
  return { from: fromMock, builder };
}

// ---------------------------------------------------------------------------
// React Query wrapper for renderHook
// ---------------------------------------------------------------------------

/** Returns a wrapper component that provides a fresh QueryClient. */
export function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
}
