import { describe, it, expect } from 'vitest';
import { calculateFG, mashTempFermentabilityFactor } from '@/calculators/fg';
import type { RecipeYeast, RecipeFermentable } from '@/types';

const yeast = (attenuation: number): RecipeYeast => ({
  name: 'Test Yeast', lab: 'Test', type: 'ale', form: 'dry',
  avg_attenuation: attenuation, min_temp_c: 18, max_temp_c: 22,
  amount: 1, amount_unit: 'pkg',
});

const grain = (amount_kg: number, fermentability = 75): RecipeFermentable => ({
  name: '2-row', type: 'grain', amount_kg, ppg: 37, color_ebc: 5, fermentability,
});

describe('mashTempFermentabilityFactor', () => {
  it('returns 1.0 at neutral 65°C', () => {
    expect(mashTempFermentabilityFactor(65)).toBeCloseTo(1.0, 5);
  });

  it('above 65°C decreases factor (less fermentable wort)', () => {
    // Higher temp leaves more unfermentable dextrins → lower fermentability factor
    expect(mashTempFermentabilityFactor(68)).toBeLessThan(1.0);
  });

  it('below 65°C increases factor (more fermentable wort)', () => {
    // Lower temp favors beta-amylase → more fermentable sugars
    expect(mashTempFermentabilityFactor(62)).toBeGreaterThan(1.0);
  });
});

describe('calculateFG', () => {
  const og = 1.050;

  it('returns 1.0 when OG <= 1.0', () => {
    expect(calculateFG(1.0, [yeast(75)], [grain(4)], 'simple')).toBe(1.0);
  });

  it('simple mode: FG decreases with higher attenuation', () => {
    const fg70 = calculateFG(og, [yeast(70)], [grain(4)], 'simple');
    const fg80 = calculateFG(og, [yeast(80)], [grain(4)], 'simple');
    expect(fg80).toBeLessThan(fg70);
  });

  it('simple mode: FG = OG × (1 - attenuation)', () => {
    // OG 1.050, 75% attenuation → gravity points = 50 → FG = 1 + (50 × 0.25 / 1000) = 1.0125
    const fg = calculateFG(og, [yeast(75)], [grain(4)], 'simple');
    expect(fg).toBeCloseTo(1.0125, 3);
  });

  it('normal mode: higher mash temp raises FG', () => {
    const fgLow = calculateFG(og, [yeast(75)], [grain(4)], 'normal', 62);
    const fgHigh = calculateFG(og, [yeast(75)], [grain(4)], 'normal', 70);
    expect(fgHigh).toBeGreaterThan(fgLow);
  });

  it('no yeasts defaults to 75% attenuation', () => {
    const fg = calculateFG(og, [], [grain(4)], 'simple');
    expect(fg).toBeCloseTo(1.0125, 3);
  });

  it('FG is always between 1.0 and OG', () => {
    const fg = calculateFG(og, [yeast(75)], [grain(4)], 'advanced');
    expect(fg).toBeGreaterThan(1.0);
    expect(fg).toBeLessThan(og);
  });
});
