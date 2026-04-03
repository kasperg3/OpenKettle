import { describe, it, expect } from 'vitest';
import { calculateABV, standardABV, alternateABV, apparentAttenuation } from '@/calculators/abv';

describe('standardABV', () => {
  it('typical pale ale', () => {
    // (1.050 - 1.010) × 131.25 = 5.25%
    expect(standardABV(1.050, 1.010)).toBeCloseTo(5.25, 2);
  });

  it('higher gravity gives higher ABV', () => {
    expect(standardABV(1.070, 1.012)).toBeGreaterThan(standardABV(1.050, 1.010));
  });
});

describe('calculateABV', () => {
  it('returns 0 when OG <= FG', () => {
    expect(calculateABV(1.010, 1.010)).toBe(0);
    expect(calculateABV(1.005, 1.010)).toBe(0);
  });

  it('returns 0 when OG <= 1.0', () => {
    expect(calculateABV(1.0, 1.0)).toBe(0);
  });

  it('standard method for ~5% beer', () => {
    const abv = calculateABV(1.050, 1.010, 'standard');
    expect(abv).toBeCloseTo(5.25, 1);
  });

  it('alternate method for high-gravity (>8% ABV)', () => {
    const og = 1.090;
    const fg = 1.015;
    const standard = calculateABV(og, fg, 'standard');
    const alternate = calculateABV(og, fg, 'alternate');
    // Both should be in the ~9-10% range; alternate diverges from standard at high gravity
    expect(standard).toBeGreaterThan(8);
    expect(alternate).toBeGreaterThan(8);
    expect(alternate).not.toBeCloseTo(standard, 1);
  });
});

describe('apparentAttenuation', () => {
  it('75% attenuation for typical ale', () => {
    // OG 1.060, FG 1.015 → ((1.060 - 1.015) / (1.060 - 1)) × 100 = 75%
    expect(apparentAttenuation(1.060, 1.015)).toBeCloseTo(75, 0);
  });

  it('returns 0 when OG <= 1.0', () => {
    expect(apparentAttenuation(1.0, 1.0)).toBe(0);
  });
});
