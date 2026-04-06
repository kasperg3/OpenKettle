import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { Brew, StartBrewPayload, UpdateBrewPayload } from '@/types';

export function useBrews(recipeId?: string) {
  return useQuery<Brew[]>({
    queryKey: ['brews', recipeId],
    enabled: !!recipeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brews')
        .select('*')
        .eq('recipe_id', recipeId!)
        .order('brew_number', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Brew[];
    },
  });
}

export function useStartBrew() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StartBrewPayload) => {
      if (!user) throw new Error('Not authenticated');

      // Determine next brew number
      const { data: existing } = await supabase
        .from('brews')
        .select('brew_number')
        .eq('recipe_id', payload.recipe_id)
        .order('brew_number', { ascending: false })
        .limit(1);

      const nextNumber = existing && existing.length > 0
        ? existing[0].brew_number + 1
        : 1;

      const { data, error } = await supabase
        .from('brews')
        .insert({
          ...payload,
          brew_number: nextNumber,
          name: payload.name || `Brew #${nextNumber}`,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Brew;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['brews', data.recipe_id] });
    },
  });
}

export function useUpdateBrew() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, recipeId, ...payload }: UpdateBrewPayload & { id: string; recipeId: string }) => {
      const { data, error } = await supabase
        .from('brews')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Brew;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['brews', data.recipe_id] });
    },
  });
}

export function useDeleteBrew() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, recipeId }: { id: string; recipeId: string }) => {
      const { error } = await supabase.from('brews').delete().eq('id', id);
      if (error) throw error;
      return recipeId;
    },
    onSuccess: (recipeId) => {
      qc.invalidateQueries({ queryKey: ['brews', recipeId] });
    },
  });
}
