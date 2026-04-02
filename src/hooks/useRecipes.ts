import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { generateSlug } from '@/lib/utils';
import type { Recipe, RecipeSummary, RecipeDraft } from '@/types';

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
        .select('id,user_id,name,slug,description,style_id,style_name,og,fg,abv,ibu,srm,ebc,batch_size_l,is_public,tags,created_at,updated_at')
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
      return (data ?? []) as RecipeSummary[];
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
        .select('id,user_id,name,slug,description,style_id,style_name,og,fg,abv,ibu,srm,ebc,batch_size_l,is_public,tags,created_at,updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as RecipeSummary[];
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

// Save (create or update)
export function useSaveRecipe() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (draft: RecipeDraft) => {
      if (!user) throw new Error('Not authenticated');

      const payload = {
        ...draft,
        user_id: user.id,
        slug: generateSlug(draft.name),
        // Cache computed stats for list views
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
