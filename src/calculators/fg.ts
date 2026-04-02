import type { RecipeYeast, RecipeFermentable } from '@/types';
import type { FGMode } from '@/types';

/**
 * Mash temperature correction factor.
 * Higher temps leave more unfermentable dextrins → higher FG.
 * Calibrated around 65°C (149°F) as neutral.
 */
export function mashTempFermentabilityFactor(mashTempC: number): number {
  // ~0.7% shift per degree C above/below 65°C
  const neutral = 65;
  const delta = mashTempC - neutral;
  return 1 + delta * 0.007;
}

/**
 * Weighted average attenuation across all yeasts.
 */
function weightedAttenuation(yeasts: RecipeYeast[]): number {
  if (yeasts.length === 0) return 75;
  const total = yeasts.reduce((sum, y) => sum + y.avg_attenuation, 0);
  return total / yeasts.length;
}

/**
 * Advanced FG: per-fermentable fermentability weighted by gravity contribution.
 */
function advancedFG(
  og: number,
  fermentables: RecipeFermentable[],
  yeasts: RecipeYeast[],
  mashTempC: number
): number {
  if (fermentables.length === 0) return og;

  const totalPPG = fermentables.reduce((sum, f) => sum + f.ppg * f.amount_kg, 0);
  if (totalPPG === 0) return og;

  // Weighted fermentability of grain bill
  const weightedFermentability =
    fermentables.reduce((sum, f) => {
      const weight = (f.ppg * f.amount_kg) / totalPPG;
      return sum + f.fermentability * weight;
    }, 0) / 100;

  const attenuation = weightedAttenuation(yeasts) / 100;
  const tempFactor = mashTempFermentabilityFactor(mashTempC);

  // Effective attenuation is capped by grain fermentability, adjusted for mash temp
  const effectiveAttenuation = Math.min(attenuation, weightedFermentability * tempFactor);
  const gravityPoints = (og - 1) * 1000;

  return 1 + (gravityPoints * (1 - effectiveAttenuation)) / 1000;
}

/**
 * Final Gravity calculation.
 *
 * - simple:   FG = OG × (1 - attenuation%)
 * - normal:   weighted avg attenuation + mash temp correction
 * - advanced: per-fermentable fermentability × mash temp correction
 */
export function calculateFG(
  og: number,
  yeasts: RecipeYeast[],
  fermentables: RecipeFermentable[],
  mode: FGMode,
  mashTempC = 66
): number {
  if (og <= 1.0) return 1.0;

  const attenuation = weightedAttenuation(yeasts) / 100;
  const gravityPoints = (og - 1) * 1000;

  switch (mode) {
    case 'simple':
      return 1 + (gravityPoints * (1 - attenuation)) / 1000;

    case 'normal': {
      const tempFactor = mashTempFermentabilityFactor(mashTempC);
      const adjusted = Math.min(attenuation * tempFactor, 0.98);
      return 1 + (gravityPoints * (1 - adjusted)) / 1000;
    }

    case 'advanced':
      return advancedFG(og, fermentables, yeasts, mashTempC);
  }
}
