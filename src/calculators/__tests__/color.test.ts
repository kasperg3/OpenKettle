import { describe, it, expect } from 'vitest';
import { calculateSRM, calculateEBC, calculateMCU, srmToHex } from '@/calculators/color';
import type { RecipeFermentable } from '@/types';

const grain = (name: string, amount_kg: number, color_ebc: number): RecipeFermentable => ({
  name, type: 'grain', amount_kg, ppg: 37, color_ebc, fermentability: 75,
});

describe('calculateMCU', () => {
  it('returns 0 for zero batch size', () => {
    expect(calculateMCU([grain('2-row', 4, 5)], 0)).toBe(0);
  });

  it('increases with darker grain', () => {
    const light = calculateMCU([grain('Pilsner', 4, 4)], 20);
    const dark = calculateMCU([grain('Munich', 4, 25)], 20);
    expect(dark).toBeGreaterThan(light);
  });
});

describe('calculateSRM', () => {
  it('returns 0 for no fermentables', () => {
    expect(calculateSRM([], 20)).toBe(0);
  });

  it('pale ale grain bill is light-colored (SRM 3–6)', () => {
    // 4 kg of pale malt (4 EBC ≈ 2 Lovibond)
    const srm = calculateSRM([grain('Pale Malt', 4, 4)], 20);
    expect(srm).toBeGreaterThan(2);
    expect(srm).toBeLessThan(8);
  });

  it('stout with roasted barley is dark (SRM > 30)', () => {
    const fermentables = [
      grain('Pale Malt', 4, 6),
      grain('Roasted Barley', 0.5, 1400),
    ];
    const srm = calculateSRM(fermentables, 20);
    expect(srm).toBeGreaterThan(30);
  });

  it('EBC is approximately 1.97× SRM', () => {
    const fermentables = [grain('Pale Malt', 4, 8)];
    const srm = calculateSRM(fermentables, 20);
    const ebc = calculateEBC(fermentables, 20);
    expect(ebc).toBeCloseTo(srm * 1.97, 3);
  });
});

describe('srmToHex', () => {
  it('returns a hex color string', () => {
    expect(srmToHex(5)).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('clamps to minimum (1)', () => {
    expect(srmToHex(-5)).toBe(srmToHex(1));
  });

  it('clamps to maximum (40)', () => {
    expect(srmToHex(100)).toBe(srmToHex(40));
  });

  it('pale beer is light-colored hex', () => {
    const pale = srmToHex(2);
    // Light beers should be yellowish — high red, high green
    const r = parseInt(pale.slice(1, 3), 16);
    const g = parseInt(pale.slice(3, 5), 16);
    expect(r).toBeGreaterThan(200);
    expect(g).toBeGreaterThan(180);
  });

  it('dark beer is dark hex', () => {
    const dark = srmToHex(40);
    const r = parseInt(dark.slice(1, 3), 16);
    expect(r).toBeLessThan(50);
  });
});
