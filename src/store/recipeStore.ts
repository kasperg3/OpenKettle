import { create } from 'zustand';
import { produce } from 'immer';
import type {
  RecipeDraft, RecipeFermentable, RecipeHop, RecipeYeast, RecipeMisc,
} from '@/types';
import type {
  EquipmentProfileSnapshot, MashProfileSnapshot,
  FermentationProfileSnapshot, WaterProfileSnapshot,
} from '@/types';

const DEFAULT_EQUIPMENT: EquipmentProfileSnapshot = {
  name: 'Default Equipment',
  batch_size_l: 20,
  boil_size_l: 26,
  boil_time_min: 60,
  evaporation_rate_pct: 10,
  mash_tun_deadspace_l: 1,
  fermenter_loss_l: 1,
  trub_loss_l: 1,
  grain_absorption_l_kg: 1.04,
  hop_absorption_l_per_100g: 0.5,
  efficiency_pct: 72,
  is_default: true,
};

const DEFAULT_MASH: MashProfileSnapshot = {
  name: 'Single Infusion',
  steps: [{ name: 'Mash', type: 'infusion', temp_c: 66, time_min: 60 }],
  sparge_temp_c: 76,
  water_grain_ratio: 3.0,
  is_default: true,
};

const DEFAULT_FERMENTATION: FermentationProfileSnapshot = {
  name: 'Standard Ale',
  stages: [
    { name: 'Primary', temp_c: 20, days: 7 },
    { name: 'Cold Crash', temp_c: 2, days: 2, ramp_days: 1 },
  ],
  is_default: true,
};

export const EMPTY_DRAFT: RecipeDraft = {
  name: 'New Recipe',
  description: '',
  style_id: undefined,
  style_name: undefined,
  is_public: true,
  tags: [],
  version: 1,
  fermentables: [],
  hops: [],
  yeasts: [],
  miscs: [],
  mash_profile: DEFAULT_MASH,
  fermentation_profile: DEFAULT_FERMENTATION,
  water_profile: undefined,
  equipment_profile: DEFAULT_EQUIPMENT,
  recipe_notes: '',
  batch_notes: '',
};

interface RecipeStore {
  draft: RecipeDraft;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: Date;

  setDraft: (recipe: RecipeDraft) => void;
  resetDraft: () => void;
  updateField: <K extends keyof RecipeDraft>(key: K, value: RecipeDraft[K]) => void;

  addFermentable: (item: RecipeFermentable) => void;
  updateFermentable: (index: number, item: Partial<RecipeFermentable>) => void;
  removeFermentable: (index: number) => void;
  moveFermentable: (from: number, to: number) => void;

  addHop: (item: RecipeHop) => void;
  updateHop: (index: number, item: Partial<RecipeHop>) => void;
  removeHop: (index: number) => void;

  addYeast: (item: RecipeYeast) => void;
  updateYeast: (index: number, item: Partial<RecipeYeast>) => void;
  removeYeast: (index: number) => void;

  addMisc: (item: RecipeMisc) => void;
  updateMisc: (index: number, item: Partial<RecipeMisc>) => void;
  removeMisc: (index: number) => void;

  setEquipmentProfile: (profile: EquipmentProfileSnapshot) => void;
  setMashProfile: (profile: MashProfileSnapshot) => void;
  setFermentationProfile: (profile: FermentationProfileSnapshot) => void;
  setWaterProfile: (profile: WaterProfileSnapshot) => void;

  markSaved: () => void;
  setIsSaving: (v: boolean) => void;
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  draft: { ...EMPTY_DRAFT },
  isDirty: false,
  isSaving: false,
  lastSaved: undefined,

  setDraft: (recipe) => set({ draft: recipe, isDirty: false }),
  resetDraft: () => set({ draft: { ...EMPTY_DRAFT }, isDirty: false }),

  updateField: (key, value) =>
    set(produce((state: RecipeStore) => {
      (state.draft as Record<string, unknown>)[key as string] = value;
      state.isDirty = true;
    })),

  addFermentable: (item) =>
    set(produce((state: RecipeStore) => {
      state.draft.fermentables.push(item);
      state.isDirty = true;
    })),
  updateFermentable: (index, item) =>
    set(produce((state: RecipeStore) => {
      Object.assign(state.draft.fermentables[index], item);
      state.isDirty = true;
    })),
  removeFermentable: (index) =>
    set(produce((state: RecipeStore) => {
      state.draft.fermentables.splice(index, 1);
      state.isDirty = true;
    })),
  moveFermentable: (from, to) =>
    set(produce((state: RecipeStore) => {
      const [item] = state.draft.fermentables.splice(from, 1);
      state.draft.fermentables.splice(to, 0, item);
      state.isDirty = true;
    })),

  addHop: (item) =>
    set(produce((state: RecipeStore) => {
      state.draft.hops.push(item);
      state.isDirty = true;
    })),
  updateHop: (index, item) =>
    set(produce((state: RecipeStore) => {
      Object.assign(state.draft.hops[index], item);
      state.isDirty = true;
    })),
  removeHop: (index) =>
    set(produce((state: RecipeStore) => {
      state.draft.hops.splice(index, 1);
      state.isDirty = true;
    })),

  addYeast: (item) =>
    set(produce((state: RecipeStore) => {
      state.draft.yeasts.push(item);
      state.isDirty = true;
    })),
  updateYeast: (index, item) =>
    set(produce((state: RecipeStore) => {
      Object.assign(state.draft.yeasts[index], item);
      state.isDirty = true;
    })),
  removeYeast: (index) =>
    set(produce((state: RecipeStore) => {
      state.draft.yeasts.splice(index, 1);
      state.isDirty = true;
    })),

  addMisc: (item) =>
    set(produce((state: RecipeStore) => {
      state.draft.miscs.push(item);
      state.isDirty = true;
    })),
  updateMisc: (index, item) =>
    set(produce((state: RecipeStore) => {
      Object.assign(state.draft.miscs[index], item);
      state.isDirty = true;
    })),
  removeMisc: (index) =>
    set(produce((state: RecipeStore) => {
      state.draft.miscs.splice(index, 1);
      state.isDirty = true;
    })),

  setEquipmentProfile: (profile) =>
    set(produce((state: RecipeStore) => {
      state.draft.equipment_profile = profile;
      state.isDirty = true;
    })),
  setMashProfile: (profile) =>
    set(produce((state: RecipeStore) => {
      state.draft.mash_profile = profile;
      state.isDirty = true;
    })),
  setFermentationProfile: (profile) =>
    set(produce((state: RecipeStore) => {
      state.draft.fermentation_profile = profile;
      state.isDirty = true;
    })),
  setWaterProfile: (profile) =>
    set(produce((state: RecipeStore) => {
      state.draft.water_profile = profile;
      state.isDirty = true;
    })),

  markSaved: () => set({ isDirty: false, isSaving: false, lastSaved: new Date() }),
  setIsSaving: (v) => set({ isSaving: v }),
}));
