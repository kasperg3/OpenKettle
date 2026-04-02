export type FermentableType =
  | 'grain'
  | 'adjunct'
  | 'sugar'
  | 'extract'
  | 'dry_extract'
  | 'fruit'
  | 'other';

export interface Fermentable {
  id: string;
  name: string;
  type: FermentableType;
  color_ebc: number;
  ppg: number;
  max_in_batch?: number;
  fermentability: number;
  protein?: number;
  diastatic_power?: number;
  moisture?: number;
  notes?: string;
  origin?: string;
  supplier?: string;
  is_global: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeFermentable {
  fermentable_id?: string;
  name: string;
  type: FermentableType;
  color_ebc: number;
  ppg: number;
  fermentability: number;
  amount_kg: number;
  notes?: string;
}

export type HopForm = 'pellet' | 'leaf' | 'cryo' | 'extract';
export type HopUse = 'boil' | 'whirlpool' | 'dry_hop' | 'first_wort' | 'mash';

export interface Hop {
  id: string;
  name: string;
  origin?: string;
  alpha_acid: number;
  beta_acid?: number;
  cohumulone?: number;
  myrcene?: number;
  humulene?: number;
  caryophyllene?: number;
  farnesene?: number;
  notes?: string;
  aroma_profile?: string[];
  is_global: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeHop {
  hop_id?: string;
  name: string;
  alpha_acid: number;
  amount_g: number;
  form: HopForm;
  use: HopUse;
  time_min: number;
  days_in_dry_hop?: number;
  ibu_contribution?: number;
  notes?: string;
}

export type YeastType = 'ale' | 'lager' | 'wine' | 'champagne' | 'other';
export type YeastForm = 'liquid' | 'dry' | 'slant' | 'culture';
export type Flocculation = 'low' | 'medium' | 'medium-high' | 'high' | 'very_high';

export interface Yeast {
  id: string;
  name: string;
  lab: string;
  code?: string;
  type: YeastType;
  form: YeastForm;
  min_attenuation?: number;
  max_attenuation?: number;
  avg_attenuation?: number;
  min_temp_c?: number;
  max_temp_c?: number;
  flocculation?: Flocculation;
  alcohol_tolerance?: string;
  notes?: string;
  is_global: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeYeast {
  yeast_id?: string;
  name: string;
  lab: string;
  code?: string;
  type: YeastType;
  form: YeastForm;
  avg_attenuation: number;
  min_temp_c?: number;
  max_temp_c?: number;
  flocculation?: Flocculation;
  amount: number;
  amount_unit: 'pkg' | 'g' | 'ml';
  notes?: string;
}

export type MiscType = 'spice' | 'fining' | 'water_agent' | 'herb' | 'flavor' | 'other';
export type MiscUse =
  | 'boil'
  | 'mash'
  | 'primary'
  | 'secondary'
  | 'bottling'
  | 'kegging'
  | 'sparge';

export interface Misc {
  id: string;
  name: string;
  type: MiscType;
  use_for?: string;
  notes?: string;
  is_global: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeMisc {
  misc_id?: string;
  name: string;
  type: MiscType;
  use: MiscUse;
  time_min?: number;
  amount: number;
  amount_unit: 'g' | 'kg' | 'ml' | 'l' | 'tsp' | 'tbsp' | 'oz' | 'each';
  notes?: string;
}
