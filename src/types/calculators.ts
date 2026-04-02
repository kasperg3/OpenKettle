export type IBUMethod = 'tinseth' | 'rager' | 'daniels';
export type FGMode = 'simple' | 'normal' | 'advanced';
export type ABVMethod = 'standard' | 'alternate';

export interface CalculatedStats {
  og: number;
  fg: number;
  abv: number;
  ibu: number;
  srm: number;
  ebc: number;
  bu_gu: number;
  attenuation: number;
  fermentability: number;
  mcu: number;
  total_grain_kg: number;
  mash_water_l: number;
  sparge_water_l: number;
  total_water_l: number;
  strike_temp_c: number;
  preboil_og: number;
}

export interface MashWaterResult {
  mash_water_l: number;
  sparge_water_l: number;
  total_water_l: number;
  grain_absorption_l: number;
  strike_temp_c: number;
}

export interface WaterIonResult {
  calcium_ppm: number;
  magnesium_ppm: number;
  sodium_ppm: number;
  chloride_ppm: number;
  sulfate_ppm: number;
  bicarbonate_ppm: number;
}
