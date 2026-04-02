import type { WaterIonResult } from '@/types';
import type { WaterProfileSnapshot, RecipeFermentable } from '@/types';

/**
 * Ion contributions per gram of mineral dissolved in 1 litre.
 * Values in mg/L per g/L (i.e. ppm per g/L).
 */
export interface MineralData {
  label: string;
  formula: string;
  calcium_ppm: number;
  magnesium_ppm: number;
  sodium_ppm: number;
  chloride_ppm: number;
  sulfate_ppm: number;
  bicarbonate_ppm: number;
}

export const MINERALS: Record<string, MineralData> = {
  calcium_sulfate: {
    label: 'Calcium Sulfate (Gypsum)',
    formula: 'CaSO₄·2H₂O',
    calcium_ppm: 232.8,
    magnesium_ppm: 0,
    sodium_ppm: 0,
    chloride_ppm: 0,
    sulfate_ppm: 557.7,
    bicarbonate_ppm: 0,
  },
  calcium_chloride: {
    label: 'Calcium Chloride',
    formula: 'CaCl₂·2H₂O',
    calcium_ppm: 272.6,
    magnesium_ppm: 0,
    sodium_ppm: 0,
    chloride_ppm: 481.8,
    sulfate_ppm: 0,
    bicarbonate_ppm: 0,
  },
  magnesium_sulfate: {
    label: 'Magnesium Sulfate (Epsom Salt)',
    formula: 'MgSO₄·7H₂O',
    calcium_ppm: 0,
    magnesium_ppm: 98.6,
    sodium_ppm: 0,
    chloride_ppm: 0,
    sulfate_ppm: 389.6,
    bicarbonate_ppm: 0,
  },
  sodium_chloride: {
    label: 'Sodium Chloride (Table Salt)',
    formula: 'NaCl',
    calcium_ppm: 0,
    magnesium_ppm: 0,
    sodium_ppm: 393.4,
    chloride_ppm: 606.6,
    sulfate_ppm: 0,
    bicarbonate_ppm: 0,
  },
  sodium_bicarbonate: {
    label: 'Sodium Bicarbonate (Baking Soda)',
    formula: 'NaHCO₃',
    calcium_ppm: 0,
    magnesium_ppm: 0,
    sodium_ppm: 274.1,
    chloride_ppm: 0,
    sulfate_ppm: 0,
    bicarbonate_ppm: 725.9,
  },
  calcium_carbonate: {
    label: 'Calcium Carbonate (Chalk)',
    formula: 'CaCO₃',
    calcium_ppm: 200.0,
    magnesium_ppm: 0,
    sodium_ppm: 0,
    chloride_ppm: 0,
    sulfate_ppm: 0,
    bicarbonate_ppm: 600.0,
  },
  magnesium_chloride: {
    label: 'Magnesium Chloride',
    formula: 'MgCl₂·6H₂O',
    calcium_ppm: 0,
    magnesium_ppm: 119.5,
    sodium_ppm: 0,
    chloride_ppm: 348.8,
    sulfate_ppm: 0,
    bicarbonate_ppm: 0,
  },
  lactic_acid: {
    label: 'Lactic Acid (88%)',
    formula: 'C₃H₆O₃',
    calcium_ppm: 0,
    magnesium_ppm: 0,
    sodium_ppm: 0,
    chloride_ppm: 0,
    sulfate_ppm: 0,
    bicarbonate_ppm: -88.0, // alkalinity reduction
  },
};

/**
 * Calculate resulting water ion profile after mineral additions.
 */
export function calculateWaterProfile(
  sourceProfile: Partial<WaterProfileSnapshot>,
  additions: Array<{ mineral: string; amount_g: number }>,
  volumeL: number
): WaterIonResult {
  const base = {
    calcium_ppm: sourceProfile.calcium_ppm ?? 0,
    magnesium_ppm: sourceProfile.magnesium_ppm ?? 0,
    sodium_ppm: sourceProfile.sodium_ppm ?? 0,
    chloride_ppm: sourceProfile.chloride_ppm ?? 0,
    sulfate_ppm: sourceProfile.sulfate_ppm ?? 0,
    bicarbonate_ppm: sourceProfile.bicarbonate_ppm ?? 0,
  };

  const result = { ...base };

  for (const addition of additions) {
    const mineral = MINERALS[addition.mineral];
    if (!mineral || addition.amount_g <= 0 || volumeL <= 0) continue;
    const gPerL = addition.amount_g / volumeL;
    result.calcium_ppm += mineral.calcium_ppm * gPerL;
    result.magnesium_ppm += mineral.magnesium_ppm * gPerL;
    result.sodium_ppm += mineral.sodium_ppm * gPerL;
    result.chloride_ppm += mineral.chloride_ppm * gPerL;
    result.sulfate_ppm += mineral.sulfate_ppm * gPerL;
    result.bicarbonate_ppm += mineral.bicarbonate_ppm * gPerL;
  }

  // Clamp negative values
  result.calcium_ppm = Math.max(0, result.calcium_ppm);
  result.magnesium_ppm = Math.max(0, result.magnesium_ppm);
  result.sodium_ppm = Math.max(0, result.sodium_ppm);
  result.chloride_ppm = Math.max(0, result.chloride_ppm);
  result.sulfate_ppm = Math.max(0, result.sulfate_ppm);
  result.bicarbonate_ppm = Math.max(0, result.bicarbonate_ppm);

  return result;
}

/**
 * Estimate mash pH using simplified residual alkalinity model.
 * This is an approximation — real-world pH depends on many factors.
 */
export function estimateMashPH(
  waterIons: WaterIonResult,
  fermentables: RecipeFermentable[],
  mashWaterL: number
): number {
  if (fermentables.length === 0 || mashWaterL <= 0) return 5.4;

  // Residual alkalinity (RA) in ppm as CaCO3
  const ra = waterIons.bicarbonate_ppm - waterIons.calcium_ppm / 3.5 - waterIons.magnesium_ppm / 7;

  // Weighted grain color (darker malts lower pH)
  const totalKg = fermentables.reduce((s, f) => s + f.amount_kg, 0);
  if (totalKg === 0) return 5.4;
  const avgEBC =
    fermentables.reduce((s, f) => s + f.color_ebc * f.amount_kg, 0) / totalKg;

  // Base pH from grain bill (lighter = higher, darker = lower)
  // Approximation: base is 5.72 for pale malt, drops by ~0.013 per EBC unit
  const grainPH = 5.72 - avgEBC * 0.013;

  // RA correction: +0.01 pH per 17.8 ppm RA (1°dH residual alkalinity)
  const raCorrectedPH = grainPH + ra / 178;

  return Math.max(4.5, Math.min(6.5, raCorrectedPH));
}

/**
 * Chloride to sulfate ratio.
 * >1 = malt-forward, <1 = hop-forward.
 */
export function chlorideSulfateRatio(chloride: number, sulfate: number): number {
  if (sulfate === 0) return chloride > 0 ? 999 : 1;
  return chloride / sulfate;
}
