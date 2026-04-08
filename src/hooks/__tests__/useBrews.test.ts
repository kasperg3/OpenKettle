// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { makeSupabaseMock, makeMockBuilder, createWrapper } from './testUtils';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabase', () => ({ supabase: {} }));
vi.mock('@/store/authStore', () => ({ useAuthStore: vi.fn() }));

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useBrews, useStartBrew, useUpdateBrew, useDeleteBrew } from '@/hooks/useBrews';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-abc' };

function setAuth(user: typeof MOCK_USER | null = MOCK_USER) {
  vi.mocked(useAuthStore).mockImplementation((selector?: (s: any) => any) => {
    const state = { user };
    return selector ? selector(state) : (state as any);
  });
}

function attachMock(mock: ReturnType<typeof makeSupabaseMock>) {
  (supabase as any).from = mock.from;
}

// ---------------------------------------------------------------------------
// useBrews
// ---------------------------------------------------------------------------

describe('useBrews', () => {
  beforeEach(() => setAuth(null));

  it('is disabled when recipeId is undefined', async () => {
    const mock = makeSupabaseMock({ data: null, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useBrews(undefined), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

    expect(mock.from).not.toHaveBeenCalled();
  });

  it('queries the brews table filtered by recipe_id', async () => {
    const brews = [
      { id: 'b1', recipe_id: 'r1', brew_number: 2, name: 'Brew #2' },
      { id: 'b2', recipe_id: 'r1', brew_number: 1, name: 'Brew #1' },
    ];
    const mock = makeSupabaseMock({ data: brews, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useBrews('r1'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mock.from).toHaveBeenCalledWith('brews');
    expect(mock.builder.select).toHaveBeenCalledWith('*');
    expect(mock.builder.eq).toHaveBeenCalledWith('recipe_id', 'r1');
    expect(mock.builder.order).toHaveBeenCalledWith('brew_number', { ascending: false });
    expect(result.current.data).toHaveLength(2);
  });

  it('returns an empty array when no brews exist', async () => {
    const mock = makeSupabaseMock({ data: [], error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useBrews('r-empty'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('surfaces Supabase errors', async () => {
    const mock = makeSupabaseMock({ data: null, error: { message: 'relation does not exist' } });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useBrews('r1'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ message: 'relation does not exist' });
  });
});

// ---------------------------------------------------------------------------
// useStartBrew
// ---------------------------------------------------------------------------

describe('useStartBrew', () => {
  it('throws when user is not authenticated', async () => {
    setAuth(null);
    const mock = makeSupabaseMock({ data: null, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useStartBrew(), { wrapper: Wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          recipe_id: 'r1',
          name: 'Brew #1',
          notes: '',
          draft: { name: 'Test', is_public: false, version: 1, fermentables: [], hops: [], yeasts: [], miscs: [] },
        })
      ).rejects.toThrow('Not authenticated');
    });
  });

  it('assigns brew_number 1 when no existing brews', async () => {
    setAuth(MOCK_USER);

    // First call: select existing brew numbers (empty)
    const existingBuilder = makeMockBuilder({ data: [], error: null });
    // Second call: insert new brew
    const insertedBrew = { id: 'b1', recipe_id: 'r1', brew_number: 1, name: 'Brew #1' };
    const insertBuilder = makeMockBuilder({ data: insertedBrew, error: null });

    const fromMock = vi.fn()
      .mockReturnValueOnce(existingBuilder)
      .mockReturnValueOnce(insertBuilder);
    (supabase as any).from = fromMock;
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useStartBrew(), { wrapper: Wrapper });

    await act(async () => {
      const data = await result.current.mutateAsync({
        recipe_id: 'r1',
        name: 'First Brew',
        notes: '',
        draft: { name: 'Test', is_public: false, version: 1, fermentables: [], hops: [], yeasts: [], miscs: [] },
      });
      expect(data).toMatchObject({ brew_number: 1 });
    });

    const insertPayload = vi.mocked(insertBuilder.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertPayload).toMatchObject({ brew_number: 1, recipe_id: 'r1' });
  });

  it('increments brew_number from the highest existing brew', async () => {
    setAuth(MOCK_USER);

    const existingBuilder = makeMockBuilder({ data: [{ brew_number: 3 }], error: null });
    const insertedBrew = { id: 'b4', recipe_id: 'r1', brew_number: 4, name: 'Brew #4' };
    const insertBuilder = makeMockBuilder({ data: insertedBrew, error: null });

    const fromMock = vi.fn()
      .mockReturnValueOnce(existingBuilder)
      .mockReturnValueOnce(insertBuilder);
    (supabase as any).from = fromMock;
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useStartBrew(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        recipe_id: 'r1',
        name: 'Latest Brew',
        notes: '',
        draft: { name: 'Test', is_public: false, version: 1, fermentables: [], hops: [], yeasts: [], miscs: [] },
      });
    });

    const insertPayload = vi.mocked(insertBuilder.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertPayload.brew_number).toBe(4);
  });

  it('uses a default name of "Brew #N" when no name is provided', async () => {
    setAuth(MOCK_USER);

    const existingBuilder = makeMockBuilder({ data: [], error: null });
    const insertedBrew = { id: 'b1', recipe_id: 'r1', brew_number: 1, name: 'Brew #1' };
    const insertBuilder = makeMockBuilder({ data: insertedBrew, error: null });

    vi.mocked(supabase as any).from = vi.fn()
      .mockReturnValueOnce(existingBuilder)
      .mockReturnValueOnce(insertBuilder);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useStartBrew(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        recipe_id: 'r1',
        name: '',  // empty → default applied
        notes: '',
        draft: { name: 'Test', is_public: false, version: 1, fermentables: [], hops: [], yeasts: [], miscs: [] },
      });
    });

    const insertPayload = vi.mocked(insertBuilder.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertPayload.name).toBe('Brew #1');
  });

  it('queries brew_number from the correct recipe', async () => {
    setAuth(MOCK_USER);

    const existingBuilder = makeMockBuilder({ data: [], error: null });
    const insertBuilder = makeMockBuilder({ data: { id: 'b1', recipe_id: 'r99', brew_number: 1 }, error: null });

    const fromMock = vi.fn()
      .mockReturnValueOnce(existingBuilder)
      .mockReturnValueOnce(insertBuilder);
    (supabase as any).from = fromMock;
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useStartBrew(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        recipe_id: 'r99',
        name: 'Brew',
        notes: '',
        draft: { name: 'Test', is_public: false, version: 1, fermentables: [], hops: [], yeasts: [], miscs: [] },
      });
    });

    // First from() call should be to fetch existing brews for recipe_id=r99
    expect(fromMock).toHaveBeenNthCalledWith(1, 'brews');
    expect(existingBuilder.eq).toHaveBeenCalledWith('recipe_id', 'r99');
    expect(existingBuilder.order).toHaveBeenCalledWith('brew_number', { ascending: false });
    expect(existingBuilder.limit).toHaveBeenCalledWith(1);
  });

  it('surfaces insert errors', async () => {
    setAuth(MOCK_USER);

    const existingBuilder = makeMockBuilder({ data: [], error: null });
    const insertBuilder = makeMockBuilder({ data: null, error: { message: 'insert failed' } });

    vi.mocked(supabase as any).from = vi.fn()
      .mockReturnValueOnce(existingBuilder)
      .mockReturnValueOnce(insertBuilder);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useStartBrew(), { wrapper: Wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          recipe_id: 'r1',
          name: 'Brew',
          notes: '',
          draft: { name: 'Test', is_public: false, version: 1, fermentables: [], hops: [], yeasts: [], miscs: [] },
        })
      ).rejects.toMatchObject({ message: 'insert failed' });
    });
  });
});

// ---------------------------------------------------------------------------
// useUpdateBrew
// ---------------------------------------------------------------------------

describe('useUpdateBrew', () => {
  beforeEach(() => setAuth(null));

  it('updates the brew by id and returns the updated row', async () => {
    const updated = { id: 'b1', recipe_id: 'r1', brew_number: 1, actual_og: 1.052 };
    const mock = makeSupabaseMock({ data: updated, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useUpdateBrew(), { wrapper: Wrapper });

    await act(async () => {
      const data = await result.current.mutateAsync({
        id: 'b1',
        recipeId: 'r1',
        actual_og: 1.052,
      });
      expect(data).toMatchObject({ id: 'b1', actual_og: 1.052 });
    });

    expect(mock.from).toHaveBeenCalledWith('brews');
    expect(mock.builder.update).toHaveBeenCalled();
    expect(mock.builder.eq).toHaveBeenCalledWith('id', 'b1');
    expect(mock.builder.single).toHaveBeenCalled();
  });

  it('does not include id or recipeId in the update payload', async () => {
    const updated = { id: 'b2', recipe_id: 'r2', brew_number: 1 };
    const mock = makeSupabaseMock({ data: updated, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useUpdateBrew(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: 'b2', recipeId: 'r2', rating: 4 });
    });

    const updatePayload = vi.mocked(mock.builder.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(updatePayload).not.toHaveProperty('id');
    expect(updatePayload).not.toHaveProperty('recipeId');
    expect(updatePayload).toHaveProperty('rating', 4);
  });

  it('surfaces Supabase errors', async () => {
    const mock = makeSupabaseMock({ data: null, error: { message: 'update failed' } });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useUpdateBrew(), { wrapper: Wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'b1', recipeId: 'r1' })
      ).rejects.toMatchObject({ message: 'update failed' });
    });
  });
});

// ---------------------------------------------------------------------------
// useDeleteBrew
// ---------------------------------------------------------------------------

describe('useDeleteBrew', () => {
  beforeEach(() => setAuth(null));

  it('deletes the brew by id from the brews table', async () => {
    const mock = makeSupabaseMock({ data: null, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteBrew(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: 'b-del', recipeId: 'r1' });
    });

    expect(mock.from).toHaveBeenCalledWith('brews');
    expect(mock.builder.delete).toHaveBeenCalled();
    expect(mock.builder.eq).toHaveBeenCalledWith('id', 'b-del');
  });

  it('does NOT scope the delete to a specific user (public delete via RLS)', async () => {
    // The hook only filters by id — Row-Level Security in Supabase handles auth.
    // This test documents the intentional absence of a user_id filter on brews.
    const mock = makeSupabaseMock({ data: null, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteBrew(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: 'b1', recipeId: 'r1' });
    });

    const eqCalls = vi.mocked(mock.builder.eq as ReturnType<typeof vi.fn>).mock.calls;
    const hasUserIdFilter = eqCalls.some(([col]) => col === 'user_id');
    expect(hasUserIdFilter).toBe(false);
  });

  it('surfaces Supabase errors', async () => {
    const mock = makeSupabaseMock({ data: null, error: { message: 'delete failed' } });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteBrew(), { wrapper: Wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'b1', recipeId: 'r1' })
      ).rejects.toMatchObject({ message: 'delete failed' });
    });
  });
});
