import { describe, it, expect } from 'vitest';
import { tinsethIBU, ragerIBU, danielsIBU, calculateTotalIBU } from '@/calculators/ibu';
import type { RecipeHop } from '@/types';

// Shared test values: 28 g of 10% AA Cascade, 60 min, 20 L, OG 1.050
const AA = 10;
const G = 28;
const T = 60;
const L = 20;
const OG = 1.050;

describe('tinsethIBU', () => {
  it('returns 0 for zero time', () => {
    expect(tinsethIBU(AA, G, 0, L, OG)).toBe(0);
  });

  it('returns 0 for zero amount', () => {
    expect(tinsethIBU(AA, 0, T, L, OG)).toBe(0);
  });

  it('typical boil addition is in the 25–40 IBU range', () => {
    const ibu = tinsethIBU(AA, G, T, L, OG);
    expect(ibu).toBeGreaterThan(25);
    expect(ibu).toBeLessThan(40);
  });

  it('more hops = more IBU', () => {
    expect(tinsethIBU(AA, 56, T, L, OG)).toBeGreaterThan(tinsethIBU(AA, G, T, L, OG));
  });

  it('longer boil = more IBU', () => {
    expect(tinsethIBU(AA, G, 90, L, OG)).toBeGreaterThan(tinsethIBU(AA, G, T, L, OG));
  });

  it('higher OG (thicker wort) = fewer IBU', () => {
    expect(tinsethIBU(AA, G, T, L, 1.080)).toBeLessThan(tinsethIBU(AA, G, T, L, 1.040));
  });

  it('utilization multiplier scales result linearly', () => {
    const base = tinsethIBU(AA, G, T, L, OG, 1.0);
    const doubled = tinsethIBU(AA, G, T, L, OG, 2.0);
    expect(doubled).toBeCloseTo(base * 2, 5);
  });
});

describe('ragerIBU', () => {
  it('returns 0 for zero time', () => {
    expect(ragerIBU(AA, G, 0, L, OG)).toBe(0);
  });

  it('typical addition is in the 25–45 IBU range', () => {
    const ibu = ragerIBU(AA, G, T, L, OG);
    expect(ibu).toBeGreaterThan(25);
    expect(ibu).toBeLessThan(45);
  });

  it('high-gravity wort reduces IBU (gravity adjustment)', () => {
    // OG > 1.05 triggers the gravity adjustment factor
    expect(ragerIBU(AA, G, T, L, 1.080)).toBeLessThan(ragerIBU(AA, G, T, L, 1.045));
  });
});

describe('danielsIBU', () => {
  it('returns 0 for zero time', () => {
    expect(danielsIBU(AA, G, 0, L)).toBe(0);
  });

  it('typical addition produces reasonable IBU', () => {
    const ibu = danielsIBU(AA, G, T, L);
    expect(ibu).toBeGreaterThan(15);
    expect(ibu).toBeLessThan(50);
  });

  it('very short boil time gets lower utilization', () => {
    expect(danielsIBU(AA, G, 5, L)).toBeLessThan(danielsIBU(AA, G, 60, L));
  });
});

describe('calculateTotalIBU', () => {
  const hop = (use: RecipeHop['use'], time_min: number): RecipeHop => ({
    name: 'Cascade', alpha_acid: 10, amount_g: 28, form: 'pellet',
    use, time_min, days_in_dry_hop: use === 'dry_hop' ? 7 : undefined,
  });

  it('returns 0 for no hops', () => {
    expect(calculateTotalIBU([], 20, 1.050)).toBe(0);
  });

  it('returns 0 for zero batch size', () => {
    expect(calculateTotalIBU([hop('boil', 60)], 0, 1.050)).toBe(0);
  });

  it('dry hop contributes 0 IBU', () => {
    expect(calculateTotalIBU([hop('dry_hop', 60)], L, OG)).toBe(0);
  });

  it('mash hop contributes 0 IBU', () => {
    expect(calculateTotalIBU([hop('mash', 60)], L, OG)).toBe(0);
  });

  it('sums multiple boil additions', () => {
    const single = calculateTotalIBU([hop('boil', 60)], L, OG);
    const double = calculateTotalIBU([hop('boil', 60), hop('boil', 60)], L, OG);
    expect(double).toBeCloseTo(single * 2, 5);
  });
});
