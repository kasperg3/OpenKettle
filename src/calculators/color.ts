import type { RecipeFermentable } from '@/types';
import { kgToLbs, lToGal, ebcToLovibond } from '@/lib/utils';

/**
 * SRM color hex lookup table (SRM 1–40).
 * Values based on standard beer color reference.
 */
const SRM_HEX_MAP: Record<number, string> = {
  1: '#FFE699',
  2: '#FFD878',
  3: '#FFCA5A',
  4: '#FFBF42',
  5: '#FBB123',
  6: '#F8A600',
  7: '#F39C00',
  8: '#EA8F00',
  9: '#E58500',
  10: '#DE7C00',
  11: '#D77200',
  12: '#CF6900',
  13: '#CB6200',
  14: '#C35900',
  15: '#BB5100',
  16: '#B54C00',
  17: '#B04500',
  18: '#A63E00',
  19: '#A13700',
  20: '#9B3200',
  21: '#952D00',
  22: '#8E2900',
  23: '#882300',
  24: '#821E00',
  25: '#7B1A00',
  26: '#771900',
  27: '#701400',
  28: '#6A1000',
  29: '#640D00',
  30: '#5E0B00',
  35: '#3D0708',
  40: '#1A0000',
};

/**
 * Returns hex color for a given SRM value.
 * Interpolates for values not in the lookup table.
 */
export function srmToHex(srm: number): string {
  const clamped = Math.max(1, Math.min(40, Math.round(srm)));
  if (SRM_HEX_MAP[clamped]) return SRM_HEX_MAP[clamped];
  // Find nearest neighbors
  const keys = Object.keys(SRM_HEX_MAP).map(Number).sort((a, b) => a - b);
  const lower = keys.filter(k => k <= clamped).pop() ?? keys[0];
  return SRM_HEX_MAP[lower];
}

/**
 * Malt Color Units.
 * MCU = sum(color_lovibond_i × weight_lbs_i) / volume_gallons
 */
export function calculateMCU(fermentables: RecipeFermentable[], batchSizeL: number): number {
  if (batchSizeL <= 0) return 0;
  const gallons = lToGal(batchSizeL);
  const totalMCU = fermentables.reduce((sum, f) => {
    const lovibond = ebcToLovibond(f.color_ebc);
    const lbs = kgToLbs(f.amount_kg);
    return sum + lovibond * lbs;
  }, 0);
  return totalMCU / gallons;
}

/**
 * SRM via Morey equation.
 * SRM = 1.4922 × MCU^0.6859
 */
export function calculateSRM(fermentables: RecipeFermentable[], batchSizeL: number): number {
  const mcu = calculateMCU(fermentables, batchSizeL);
  if (mcu <= 0) return 0;
  return 1.4922 * Math.pow(mcu, 0.6859);
}

export function calculateEBC(fermentables: RecipeFermentable[], batchSizeL: number): number {
  return calculateSRM(fermentables, batchSizeL) * 1.97;
}
