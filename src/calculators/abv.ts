import type { ABVMethod } from '@/types';

/**
 * Standard ABV formula. Accurate up to ~8% ABV.
 * ABV = (OG - FG) × 131.25
 */
export function standardABV(og: number, fg: number): number {
  return (og - fg) * 131.25;
}

/**
 * Alternate (more accurate) ABV for high-gravity beers.
 * Based on the formula by Balling / de Clerck.
 */
export function alternateABV(og: number, fg: number): number {
  return (76.08 * (og - fg)) / (1.775 - og) * (fg / 0.794);
}

export function calculateABV(og: number, fg: number, method: ABVMethod = 'standard'): number {
  if (og <= fg || og <= 1.0) return 0;
  const abv = method === 'alternate' ? alternateABV(og, fg) : standardABV(og, fg);
  return Math.max(0, abv);
}

/**
 * Apparent attenuation percentage.
 */
export function apparentAttenuation(og: number, fg: number): number {
  if (og <= 1.0) return 0;
  return ((og - fg) / (og - 1)) * 100;
}
