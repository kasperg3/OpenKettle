import type {
  RecipeFermentable,
  RecipeHop,
  RecipeYeast,
  RecipeMisc,
} from './ingredients';
import type {
  MashProfileSnapshot,
  FermentationProfileSnapshot,
  EquipmentProfileSnapshot,
  WaterProfileSnapshot,
} from './profiles';

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  slug?: string;
  description?: string;
  style_id?: string;
  style_name?: string;
  forked_from_id?: string;
  forked_from_name?: string;
  og?: number;
  fg?: number;
  abv?: number;
  ibu?: number;
  srm?: number;
  ebc?: number;
  batch_size_l?: number;
  is_public: boolean;
  tags?: string[];
  version: number;
  fermentables: RecipeFermentable[];
  hops: RecipeHop[];
  yeasts: RecipeYeast[];
  miscs: RecipeMisc[];
  mash_profile?: MashProfileSnapshot;
  fermentation_profile?: FermentationProfileSnapshot;
  water_profile?: WaterProfileSnapshot;
  equipment_profile?: EquipmentProfileSnapshot;
  recipe_notes?: string;
  batch_notes?: string;
  created_at: string;
  updated_at: string;
}

export type RecipeDraft = Omit<Recipe, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'slug'> & {
  id?: string;
};

export interface RecipeSummary {
  id: string;
  user_id: string;
  name: string;
  slug?: string;
  description?: string;
  style_id?: string;
  style_name?: string;
  og?: number;
  fg?: number;
  abv?: number;
  ibu?: number;
  srm?: number;
  ebc?: number;
  batch_size_l?: number;
  is_public: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
  author_username?: string;
  author_display_name?: string;
  forked_from_id?: string;
  forked_from_name?: string;
}
