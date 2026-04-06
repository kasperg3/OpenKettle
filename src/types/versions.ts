import type { RecipeDraft } from './recipe';

export interface PlannedStats {
  og?: number;
  fg?: number;
  abv?: number;
  ibu?: number;
  srm?: number;
  ebc?: number;
}

/** A brew is both the recipe snapshot AND all measurements for one brew session. */
export interface Brew {
  id: string;
  recipe_id: string;
  brew_number: number;
  name: string;
  notes: string;

  // Recipe state at brew start
  draft: RecipeDraft;

  // Planned (calculated) stats
  planned_og?: number;
  planned_fg?: number;
  planned_abv?: number;
  planned_ibu?: number;
  planned_srm?: number;
  planned_ebc?: number;

  // Brew day
  brew_date?: string;
  mash_temp_c?: number;
  mash_ph?: number;
  pre_boil_volume_l?: number;
  pre_boil_og?: number;
  pre_boil_ph?: number;
  post_boil_volume_l?: number;
  actual_og?: number;
  pitch_temp_c?: number;

  // Fermentation
  actual_fg?: number;
  fermentation_temp_c?: number;

  // Result
  rating?: number;

  created_at: string;
  updated_at: string;
}

export interface StartBrewPayload {
  recipe_id: string;
  name: string;
  notes: string;
  draft: RecipeDraft;
  planned_og?: number;
  planned_fg?: number;
  planned_abv?: number;
  planned_ibu?: number;
  planned_srm?: number;
  planned_ebc?: number;
  brew_date?: string;
}

export type UpdateBrewPayload = Partial<Omit<Brew, 'id' | 'recipe_id' | 'brew_number' | 'draft' | 'created_at' | 'updated_at'>>;
