// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { makeSupabaseMock, createWrapper } from './testUtils';

// ---------------------------------------------------------------------------
// Module mocks – must appear before any import of the mocked modules
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabase', () => ({ supabase: {} }));
vi.mock('@/store/authStore', () => ({ useAuthStore: vi.fn() }));

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import {
  usePublicRecipes,
  useMyRecipes,
  useRecipe,
  useUserProfile,
  useUserByUsername,
  useSaveRecipe,
  useDeleteRecipe,
} from '@/hooks/useRecipes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-123' };

function setAuth(user: typeof MOCK_USER | null = MOCK_USER) {
  vi.mocked(useAuthStore).mockReturnValue(user as any);
  // useSaveRecipe / useDeleteRecipe call useAuthStore((s) => s.user)
  // The selector is called with a state object, so we also support that:
  vi.mocked(useAuthStore).mockImplementation((selector?: (s: any) => any) => {
    const state = { user };
    return selector ? selector(state) : (state as any);
  });
}

function attachMock(mock: ReturnType<typeof makeSupabaseMock>) {
  (supabase as any).from = mock.from;
}

// ---------------------------------------------------------------------------
// usePublicRecipes
// ---------------------------------------------------------------------------

describe('usePublicRecipes', () => {
  beforeEach(() => setAuth(null));

  it('queries the recipes table with is_public = true', async () => {
    const recipe = {
      id: 'r1', name: 'Test IPA', is_public: true, user_profiles: null,
      user_id: 'u1', slug: 'test-ipa', description: null,
      style_id: null, style_name: null, og: null, fg: null, abv: null,
      ibu: null, srm: null, ebc: null, batch_size_l: null, tags: null,
      forked_from_id: null, forked_from_name: null,
      created_at: '2024-01-01', updated_at: '2024-01-01',
    };
    const mock = makeSupabaseMock({ data: [recipe], error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => usePublicRecipes(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mock.from).toHaveBeenCalledWith('recipes');
    expect(mock.builder.select).toHaveBeenCalled();
    expect(mock.builder.eq).toHaveBeenCalledWith('is_public', true);
    expect(mock.builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mock.builder.limit).toHaveBeenCalledWith(24);
  });

  it('applies text search when search option is provided', async () => {
    const mock = makeSupabaseMock({ data: [], error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => usePublicRecipes({ search: 'IPA' }), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mock.builder.textSearch).toHaveBeenCalledWith('fts_vector', 'IPA');
  });

  it('filters by styleId when provided', async () => {
    const mock = makeSupabaseMock({ data: [], error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => usePublicRecipes({ styleId: '21A' }), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const eqCalls = vi.mocked(mock.builder.eq as ReturnType<typeof vi.fn>).mock.calls;
    expect(eqCalls).toEqual(
      expect.arrayContaining([['is_public', true], ['style_id', '21A']])
    );
  });

  it('respects custom limit and offset', async () => {
    const mock = makeSupabaseMock({ data: [], error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(
      () => usePublicRecipes({ limit: 10, offset: 20 }),
      { wrapper: Wrapper }
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mock.builder.limit).toHaveBeenCalledWith(10);
    expect(mock.builder.range).toHaveBeenCalledWith(20, 29);
  });

  it('does NOT apply textSearch or styleId filters when not provided', async () => {
    const mock = makeSupabaseMock({ data: [], error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => usePublicRecipes(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mock.builder.textSearch).not.toHaveBeenCalled();
    // eq should only have been called once (is_public = true)
    const eqCalls = vi.mocked(mock.builder.eq as ReturnType<typeof vi.fn>).mock.calls;
    expect(eqCalls).not.toEqual(expect.arrayContaining([['style_id', expect.anything()]]));
  });

  it('flattens user_profiles into author fields', async () => {
    const recipe = {
      id: 'r1', name: 'Lager', is_public: true,
      user_profiles: { username: 'brewer42', display_name: 'Brewer 42' },
      user_id: 'u1', slug: 'lager', description: null,
      style_id: null, style_name: null, og: null, fg: null, abv: null,
      ibu: null, srm: null, ebc: null, batch_size_l: null, tags: null,
      forked_from_id: null, forked_from_name: null,
      created_at: '2024-01-01', updated_at: '2024-01-01',
    };
    const mock = makeSupabaseMock({ data: [recipe], error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => usePublicRecipes(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const first = result.current.data![0];
    expect(first.author_username).toBe('brewer42');
    expect(first.author_display_name).toBe('Brewer 42');
    expect((first as any).user_profiles).toBeUndefined();
  });

  it('surfaces Supabase errors as query errors', async () => {
    const mock = makeSupabaseMock({ data: null, error: { message: 'permission denied' } });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => usePublicRecipes(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({ message: 'permission denied' });
  });
});

// ---------------------------------------------------------------------------
// useMyRecipes
// ---------------------------------------------------------------------------

describe('useMyRecipes', () => {
  it('returns empty array and does not query when user is null', async () => {
    setAuth(null);
    const mock = makeSupabaseMock({ data: [], error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useMyRecipes(), { wrapper: Wrapper });
    // The query is disabled, so it stays in loading/idle; data should be undefined
    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

    expect(mock.from).not.toHaveBeenCalled();
  });

  it('filters by user_id when user is authenticated', async () => {
    setAuth(MOCK_USER);
    const mock = makeSupabaseMock({ data: [], error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useMyRecipes(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mock.from).toHaveBeenCalledWith('recipes');
    expect(mock.builder.eq).toHaveBeenCalledWith('user_id', MOCK_USER.id);
    expect(mock.builder.order).toHaveBeenCalledWith('updated_at', { ascending: false });
  });

  it('surfaces Supabase errors', async () => {
    setAuth(MOCK_USER);
    const mock = makeSupabaseMock({ data: null, error: { message: 'relation does not exist' } });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useMyRecipes(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ---------------------------------------------------------------------------
// useRecipe
// ---------------------------------------------------------------------------

describe('useRecipe', () => {
  beforeEach(() => setAuth(null));

  it('is disabled when id is undefined', async () => {
    const mock = makeSupabaseMock({ data: null, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useRecipe(undefined), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

    expect(mock.from).not.toHaveBeenCalled();
  });

  it('queries recipes by id and calls .single()', async () => {
    const recipe = { id: 'r1', name: 'My Stout', user_id: 'u1', is_public: false, version: 1, fermentables: [], hops: [], yeasts: [], miscs: [], created_at: '2024-01-01', updated_at: '2024-01-01' };
    const mock = makeSupabaseMock({ data: recipe, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useRecipe('r1'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mock.from).toHaveBeenCalledWith('recipes');
    expect(mock.builder.eq).toHaveBeenCalledWith('id', 'r1');
    expect(mock.builder.single).toHaveBeenCalled();
    expect(result.current.data).toMatchObject({ id: 'r1', name: 'My Stout' });
  });

  it('surfaces Supabase errors', async () => {
    const mock = makeSupabaseMock({ data: null, error: { message: 'no rows returned' } });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useRecipe('missing-id'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ---------------------------------------------------------------------------
// useUserProfile
// ---------------------------------------------------------------------------

describe('useUserProfile', () => {
  beforeEach(() => setAuth(null));

  it('is disabled when userId is undefined', async () => {
    const mock = makeSupabaseMock({ data: null, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useUserProfile(undefined), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(mock.from).not.toHaveBeenCalled();
  });

  it('queries user_profiles by id and calls .maybeSingle()', async () => {
    const profile = { id: 'u1', username: 'brewer', display_name: 'Brewer', bio: null };
    const mock = makeSupabaseMock({ data: profile, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useUserProfile('u1'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mock.from).toHaveBeenCalledWith('user_profiles');
    expect(mock.builder.eq).toHaveBeenCalledWith('id', 'u1');
    expect(mock.builder.maybeSingle).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// useUserByUsername
// ---------------------------------------------------------------------------

describe('useUserByUsername', () => {
  beforeEach(() => setAuth(null));

  it('is disabled when username is undefined', async () => {
    const mock = makeSupabaseMock({ data: null, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useUserByUsername(undefined), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(mock.from).not.toHaveBeenCalled();
  });

  it('returns null when profile is not found', async () => {
    const mock = makeSupabaseMock({ data: null, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useUserByUsername('ghost'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('fetches profile then public recipes for that user', async () => {
    const profile = { id: 'u2', username: 'alice', display_name: 'Alice', bio: '' };
    // First call: user_profiles, second call: recipes
    const builder1 = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: profile, error: null }),
    };
    const builder2 = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: (onFulfilled: (v: unknown) => unknown) =>
        Promise.resolve({ data: [], error: null }).then(onFulfilled),
    };
    const fromMock = vi.fn()
      .mockReturnValueOnce(builder1)
      .mockReturnValueOnce(builder2);
    (supabase as any).from = fromMock;
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useUserByUsername('alice'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fromMock).toHaveBeenNthCalledWith(1, 'user_profiles');
    expect(fromMock).toHaveBeenNthCalledWith(2, 'recipes');
    expect(builder2.eq).toHaveBeenCalledWith('user_id', profile.id);
    expect(builder2.eq).toHaveBeenCalledWith('is_public', true);
  });
});

// ---------------------------------------------------------------------------
// useSaveRecipe
// ---------------------------------------------------------------------------

describe('useSaveRecipe', () => {
  it('throws when user is not authenticated', async () => {
    setAuth(null);
    const mock = makeSupabaseMock({ data: null, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSaveRecipe(), { wrapper: Wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          draft: { name: 'Test', is_public: false, version: 1, fermentables: [], hops: [], yeasts: [], miscs: [] },
        })
      ).rejects.toThrow('Not authenticated');
    });
  });

  it('inserts a new recipe when draft has no id', async () => {
    setAuth(MOCK_USER);
    const newRecipe = { id: 'new-id', name: 'New Beer', user_id: MOCK_USER.id };
    const mock = makeSupabaseMock({ data: newRecipe, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSaveRecipe(), { wrapper: Wrapper });

    await act(async () => {
      const data = await result.current.mutateAsync({
        draft: { name: 'New Beer', is_public: false, version: 1, fermentables: [], hops: [], yeasts: [], miscs: [] },
      });
      expect(data).toMatchObject({ id: 'new-id' });
    });

    expect(mock.builder.insert).toHaveBeenCalled();
    expect(mock.builder.update).not.toHaveBeenCalled();
  });

  it('updates an existing recipe when draft has an id', async () => {
    setAuth(MOCK_USER);
    const updated = { id: 'existing-id', name: 'Updated Beer', user_id: MOCK_USER.id };
    const mock = makeSupabaseMock({ data: updated, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSaveRecipe(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        draft: { id: 'existing-id', name: 'Updated Beer', is_public: false, version: 1, fermentables: [], hops: [], yeasts: [], miscs: [] },
      });
    });

    expect(mock.builder.update).toHaveBeenCalled();
    expect(mock.builder.insert).not.toHaveBeenCalled();
    // Must scope the update to the owner
    expect(mock.builder.eq).toHaveBeenCalledWith('id', 'existing-id');
    expect(mock.builder.eq).toHaveBeenCalledWith('user_id', MOCK_USER.id);
  });

  it('sets user_id and slug on the payload', async () => {
    setAuth(MOCK_USER);
    const mock = makeSupabaseMock({ data: { id: 'x', name: 'My Porter', user_id: MOCK_USER.id }, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSaveRecipe(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        draft: { name: 'My Porter', is_public: false, version: 1, fermentables: [], hops: [], yeasts: [], miscs: [] },
      });
    });

    const insertPayload = vi.mocked(mock.builder.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertPayload).toMatchObject({ user_id: MOCK_USER.id });
    expect(insertPayload.slug).toBeTruthy();
  });

  it('merges stats into the payload', async () => {
    setAuth(MOCK_USER);
    const mock = makeSupabaseMock({ data: { id: 'x', name: 'Stout', user_id: MOCK_USER.id }, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSaveRecipe(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        draft: { name: 'Stout', is_public: false, version: 1, fermentables: [], hops: [], yeasts: [], miscs: [] },
        stats: { og: 1.065, fg: 1.015, abv: 6.5, ibu: 35, srm: 40, ebc: 79 },
      });
    });

    const insertPayload = vi.mocked(mock.builder.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(insertPayload).toMatchObject({ og: 1.065, fg: 1.015, abv: 6.5 });
  });

  it('throws Supabase errors', async () => {
    setAuth(MOCK_USER);
    const mock = makeSupabaseMock({ data: null, error: { message: 'duplicate key value' } });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSaveRecipe(), { wrapper: Wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          draft: { name: 'Dupe', is_public: false, version: 1, fermentables: [], hops: [], yeasts: [], miscs: [] },
        })
      ).rejects.toMatchObject({ message: 'duplicate key value' });
    });
  });
});

// ---------------------------------------------------------------------------
// useDeleteRecipe
// ---------------------------------------------------------------------------

describe('useDeleteRecipe', () => {
  it('throws when user is not authenticated', async () => {
    setAuth(null);
    const mock = makeSupabaseMock({ data: null, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteRecipe(), { wrapper: Wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('r1')).rejects.toThrow('Not authenticated');
    });
  });

  it('deletes from the recipes table scoped to the owner', async () => {
    setAuth(MOCK_USER);
    const mock = makeSupabaseMock({ data: null, error: null });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteRecipe(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync('r-to-delete');
    });

    expect(mock.from).toHaveBeenCalledWith('recipes');
    expect(mock.builder.delete).toHaveBeenCalled();
    expect(mock.builder.eq).toHaveBeenCalledWith('id', 'r-to-delete');
    expect(mock.builder.eq).toHaveBeenCalledWith('user_id', MOCK_USER.id);
  });

  it('throws Supabase errors', async () => {
    setAuth(MOCK_USER);
    const mock = makeSupabaseMock({ data: null, error: { message: 'permission denied' } });
    attachMock(mock);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteRecipe(), { wrapper: Wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync('r1')).rejects.toMatchObject({
        message: 'permission denied',
      });
    });
  });
});
