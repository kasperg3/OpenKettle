import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { generateSlug } from '@/lib/utils';
import type { Recipe, RecipeSummary, RecipeDraft, UserProfile } from '@/types';

type RowWithAuthor = Omit<RecipeSummary, 'author_username' | 'author_display_name'> & {
  user_profiles: Pick<UserProfile, 'username' | 'display_name'> | null;
};

function flattenAuthor(row: RowWithAuthor): RecipeSummary {
  const { user_profiles, ...rest } = row;
  return { ...rest, author_username: user_profiles?.username, author_display_name: user_profiles?.display_name };
}

// Public recipes
export function usePublicRecipes(options?: {
  search?: string;
  styleId?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['recipes', 'public', options],
    queryFn: async () => {
      let q = supabase
        .from('recipes')
        .select('id,user_id,name,slug,description,style_id,style_name,og,fg,abv,ibu,srm,ebc,batch_size_l,is_public,tags,forked_from_id,forked_from_name,created_at,updated_at,user_profiles(username,display_name)')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(options?.limit ?? 24)
        .range(options?.offset ?? 0, (options?.offset ?? 0) + (options?.limit ?? 24) - 1);

      if (options?.search) {
        q = q.textSearch('fts_vector', options.search);
      }
      if (options?.styleId) {
        q = q.eq('style_id', options.styleId);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(r => flattenAuthor(r as RowWithAuthor));
    },
  });
}

// User's own recipes
export function useMyRecipes() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['recipes', 'mine', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('recipes')
        .select('id,user_id,name,slug,description,style_id,style_name,og,fg,abv,ibu,srm,ebc,batch_size_l,is_public,tags,forked_from_id,forked_from_name,created_at,updated_at,user_profiles(username,display_name)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(r => flattenAuthor(r as RowWithAuthor));
    },
    enabled: !!user,
  });
}

// Single recipe by id
export function useRecipe(id: string | undefined) {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      if (!id) throw new Error('No id');
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Recipe;
    },
    enabled: !!id,
  });
}

// User profile by user id
export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['user_profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No userId');
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id,username,display_name,bio')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      return data as UserProfile | null;
    },
    enabled: !!userId,
  });
}

// User profile + public recipes by username
export function useUserByUsername(username: string | undefined) {
  return useQuery({
    queryKey: ['user_by_username', username],
    queryFn: async () => {
      if (!username) throw new Error('No username');
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id,username,display_name,bio')
        .eq('username', username)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!profile) return null;

      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select('id,user_id,name,slug,description,style_id,style_name,og,fg,abv,ibu,srm,ebc,batch_size_l,is_public,tags,created_at,updated_at')
        .eq('user_id', profile.id)
        .eq('is_public', true)
        .order('updated_at', { ascending: false });
      if (recipesError) throw recipesError;

      return {
        profile: profile as UserProfile,
        recipes: (recipes ?? []) as RecipeSummary[],
      };
    },
    enabled: !!username,
  });
}

export interface SaveRecipePayload {
  draft: RecipeDraft;
  stats?: { og?: number; fg?: number; abv?: number; ibu?: number; srm?: number; ebc?: number };
}

// Save (create or update)
export function useSaveRecipe() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({ draft, stats }: SaveRecipePayload) => {
      if (!user) throw new Error('Not authenticated');

      const payload = {
        ...draft,
        ...(stats ?? {}),
        user_id: user.id,
        slug: generateSlug(draft.name),
        batch_size_l: draft.equipment_profile?.batch_size_l,
      };

      if (draft.id) {
        const { data, error } = await supabase
          .from('recipes')
          .update(payload)
          .eq('id', draft.id)
          .eq('user_id', user.id)
          .select()
          .single();
        if (error) throw error;
        return data as Recipe;
      } else {
        const { data, error } = await supabase
          .from('recipes')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data as Recipe;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

// Delete
export function useDeleteRecipe() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}
