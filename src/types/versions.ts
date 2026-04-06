import type { RecipeDraft } from './recipe';

export interface RecipeStats {
  og?: number;
  fg?: number;
  abv?: number;
  ibu?: number;
  srm?: number;
  ebc?: number;
}

export interface RecipeVersion {
  id: string;
  recipe_id: string;
  version_number: number;
  name: string;
  changes_summary: string;
  draft: RecipeDraft;
  stats?: RecipeStats;
  created_at: string;
  brew_logs?: BrewLog[];
}

export interface BrewLog {
  id: string;
  recipe_version_id: string;
  brew_date?: string;
  actual_og?: number;
  actual_fg?: number;
  rating?: number;
  notes: string;
  created_at: string;
}

export interface SaveVersionPayload {
  recipe_id: string;
  name: string;
  changes_summary: string;
  draft: RecipeDraft;
  stats?: RecipeStats;
}

export interface SaveBrewLogPayload {
  recipe_version_id: string;
  brew_date?: string;
  actual_og?: number;
  actual_fg?: number;
  rating?: number;
  notes: string;
}
