import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type {
  RecipeVersion,
  BrewLog,
  SaveVersionPayload,
  SaveBrewLogPayload,
} from '@/types';

// ── Queries ──────────────────────────────────────────────────────────────────

export function useRecipeVersions(recipeId?: string) {
  return useQuery<RecipeVersion[]>({
    queryKey: ['recipe-versions', recipeId],
    enabled: !!recipeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_versions')
        .select('*')
        .eq('recipe_id', recipeId!)
        .order('version_number', { ascending: false });
      if (error) throw error;
      return (data ?? []) as RecipeVersion[];
    },
  });
}

export function useBrewLogs(versionId?: string) {
  return useQuery<BrewLog[]>({
    queryKey: ['brew-logs', versionId],
    enabled: !!versionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brew_logs')
        .select('*')
        .eq('recipe_version_id', versionId!)
        .order('brew_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as BrewLog[];
    },
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useSaveVersion() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveVersionPayload) => {
      if (!user) throw new Error('Not authenticated');

      // Determine next version number
      const { data: existing } = await supabase
        .from('recipe_versions')
        .select('version_number')
        .eq('recipe_id', payload.recipe_id)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = existing && existing.length > 0
        ? existing[0].version_number + 1
        : 1;

      const { data, error } = await supabase
        .from('recipe_versions')
        .insert({
          recipe_id: payload.recipe_id,
          version_number: nextVersion,
          name: payload.name || `v${nextVersion}`,
          changes_summary: payload.changes_summary,
          draft: payload.draft,
          stats: payload.stats ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as RecipeVersion;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['recipe-versions', data.recipe_id] });
    },
  });
}

export function useDeleteVersion() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, recipeId }: { id: string; recipeId: string }) => {
      const { error } = await supabase
        .from('recipe_versions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return recipeId;
    },
    onSuccess: (recipeId) => {
      qc.invalidateQueries({ queryKey: ['recipe-versions', recipeId] });
    },
  });
}

export function useSaveBrewLog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveBrewLogPayload) => {
      const { data, error } = await supabase
        .from('brew_logs')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as BrewLog;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['brew-logs', data.recipe_version_id] });
    },
  });
}

export function useUpdateBrewLog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<SaveBrewLogPayload> & { id: string }) => {
      const { data, error } = await supabase
        .from('brew_logs')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as BrewLog;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['brew-logs', data.recipe_version_id] });
    },
  });
}

export function useDeleteBrewLog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, versionId }: { id: string; versionId: string }) => {
      const { error } = await supabase
        .from('brew_logs')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return versionId;
    },
    onSuccess: (versionId) => {
      qc.invalidateQueries({ queryKey: ['brew-logs', versionId] });
    },
  });
}
