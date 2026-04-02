import type { RecipeFermentable } from '@/types';
import { kgToLbs, lToGal } from '@/lib/utils';

/**
 * Points per pound per gallon contributed by a single fermentable.
 * Extracts use 100% efficiency; mashed grains use brewhouse efficiency.
 */
function isExtract(type: RecipeFermentable['type']): boolean {
  return type === 'extract' || type === 'dry_extract' || type === 'sugar';
}

/**
 * Total gravity points in the kettle before efficiency loss.
 * Returns gravity points (e.g. 55 means 1.055 OG in a 1-gallon batch).
 */
export function totalGravityPoints(
  fermentables: RecipeFermentable[],
  efficiencyPct: number
): number {
  return fermentables.reduce((sum, f) => {
    const lbs = kgToLbs(f.amount_kg);
    const efficiency = isExtract(f.type) ? 1 : efficiencyPct / 100;
    return sum + f.ppg * lbs * efficiency;
  }, 0);
}

/**
 * Original Gravity.
 * OG = 1 + total_points / volume_gallons / 1000
 */
export function calculateOG(
  fermentables: RecipeFermentable[],
  batchSizeL: number,
  efficiencyPct: number
): number {
  if (batchSizeL <= 0 || fermentables.length === 0) return 1.0;
  const points = totalGravityPoints(fermentables, efficiencyPct);
  const gallons = lToGal(batchSizeL);
  return 1 + points / gallons / 1000;
}

/**
 * Pre-boil gravity estimate given boil volume.
 */
export function calculatePreBoilOG(
  fermentables: RecipeFermentable[],
  boilSizeL: number,
  efficiencyPct: number
): number {
  if (boilSizeL <= 0) return 1.0;
  const points = totalGravityPoints(fermentables, efficiencyPct);
  const gallons = lToGal(boilSizeL);
  return 1 + points / gallons / 1000;
}
