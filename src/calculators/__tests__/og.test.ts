import { describe, it, expect } from 'vitest';
import { calculateOG, calculatePreBoilOG, totalGravityPoints } from '@/calculators/og';
import type { RecipeFermentable } from '@/types';

const grain = (name: string, amount_kg: number, ppg: number, type: RecipeFermentable['type'] = 'grain'): RecipeFermentable => ({
  name, type, amount_kg, ppg, color_ebc: 5, fermentability: 75,
});

describe('totalGravityPoints', () => {
  it('applies efficiency to grain', () => {
    const pts = totalGravityPoints([grain('2-row', 4, 37)], 72);
    // 37 ppg × 8.818 lbs × 0.72 = 234.9 pts
    expect(pts).toBeCloseTo(234.9, 0);
  });

  it('ignores efficiency for extracts', () => {
    const extract = grain('DME', 1, 46, 'dry_extract');
    const pts72 = totalGravityPoints([extract], 72);
    const pts100 = totalGravityPoints([extract], 100);
    // Extract always uses 100% efficiency
    expect(pts72).toBeCloseTo(pts100, 5);
  });

  it('returns 0 for empty grain bill', () => {
    expect(totalGravityPoints([], 72)).toBe(0);
  });
});

describe('calculateOG', () => {
  it('returns 1.0 for empty grain bill', () => {
    expect(calculateOG([], 20, 72)).toBe(1.0);
  });

  it('returns 1.0 for zero batch size', () => {
    expect(calculateOG([grain('2-row', 4, 37)], 0, 72)).toBe(1.0);
  });

  it('typical pale ale grain bill', () => {
    // 4 kg 2-row, 20 L, 72% → ~1.044
    const og = calculateOG([grain('2-row', 4, 37)], 20, 72);
    expect(og).toBeGreaterThan(1.040);
    expect(og).toBeLessThan(1.050);
  });

  it('higher efficiency gives higher OG', () => {
    const og72 = calculateOG([grain('2-row', 5, 37)], 20, 72);
    const og85 = calculateOG([grain('2-row', 5, 37)], 20, 85);
    expect(og85).toBeGreaterThan(og72);
  });

  it('pre-boil OG is lower than post-boil OG (more volume)', () => {
    const fermentables = [grain('2-row', 5, 37)];
    const og = calculateOG(fermentables, 20, 72);
    const preboil = calculatePreBoilOG(fermentables, 26, 72);
    expect(preboil).toBeLessThan(og);
  });
});
