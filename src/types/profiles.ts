export interface MashStep {
  name: string;
  type: 'infusion' | 'temperature' | 'decoction' | 'sparge';
  temp_c: number;
  time_min: number;
  ramp_time_min?: number;
  infusion_volume_l?: number;
  description?: string;
}

export interface MashProfile {
  id: string;
  user_id: string;
  name: string;
  steps: MashStep[];
  sparge_temp_c: number;
  water_grain_ratio: number;
  notes?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface FermentationStage {
  name: string;
  temp_c: number;
  days: number;
  ramp_days?: number;
}

export interface FermentationProfile {
  id: string;
  user_id: string;
  name: string;
  stages: FermentationStage[];
  notes?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipmentProfile {
  id: string;
  user_id: string;
  name: string;
  batch_size_l: number;
  boil_size_l: number;
  boil_time_min: number;
  evaporation_rate_pct: number;
  mash_tun_deadspace_l: number;
  fermenter_loss_l: number;
  trub_loss_l: number;
  grain_absorption_l_kg: number;
  hop_absorption_l_per_100g: number;
  efficiency_pct: number;
  is_default: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WaterProfile {
  id: string;
  user_id?: string;
  name: string;
  calcium_ppm: number;
  magnesium_ppm: number;
  sodium_ppm: number;
  chloride_ppm: number;
  sulfate_ppm: number;
  bicarbonate_ppm: number;
  ph?: number;
  notes?: string;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

export interface WaterAddition {
  mineral: string;
  amount_g: number;
}

// Snapshot types used inside recipes (no id/user_id/timestamps)
export type MashProfileSnapshot = Omit<MashProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type FermentationProfileSnapshot = Omit<FermentationProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type EquipmentProfileSnapshot = Omit<EquipmentProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type WaterProfileSnapshot = Omit<WaterProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
