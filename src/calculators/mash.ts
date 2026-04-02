import type { MashWaterResult } from '@/types';

/**
 * Total mash water volume.
 * @param totalGrainKg   - total grain weight in kg
 * @param waterGrainRatio - L of water per kg of grain (typical: 2.5–4.0)
 */
export function mashWaterVolume(totalGrainKg: number, waterGrainRatio: number): number {
  return totalGrainKg * waterGrainRatio;
}

/**
 * Strike water temperature to hit target mash temperature.
 * Palmer's formula: T_strike = (0.2/r) × (T_target - T_grain) + T_target
 * where r = water-to-grain ratio (quarts/lb) — we adapt for L/kg (same ratio).
 */
export function strikeWaterTemp(
  grainTempC: number,
  targetMashTempC: number,
  waterGrainRatio: number
): number {
  return (0.2 / waterGrainRatio) * (targetMashTempC - grainTempC) + targetMashTempC;
}

/**
 * Sparge water volume needed to hit pre-boil volume.
 */
export function spargeWaterVolume(
  preboilVolumeL: number,
  mashWaterL: number,
  totalGrainKg: number,
  grainAbsorptionLKg: number,
  mashTunDeadspaceL: number
): number {
  const grainAbsorption = totalGrainKg * grainAbsorptionLKg;
  const firstRunnings = mashWaterL - grainAbsorption - mashTunDeadspaceL;
  const sparge = preboilVolumeL - firstRunnings;
  return Math.max(0, sparge);
}

/**
 * Full mash water calculation for brew day.
 */
export function calculateMashWater(
  totalGrainKg: number,
  waterGrainRatio: number,
  preboilVolumeL: number,
  grainTempC: number,
  targetMashTempC: number,
  grainAbsorptionLKg: number,
  mashTunDeadspaceL: number
): MashWaterResult {
  const mash_water_l = mashWaterVolume(totalGrainKg, waterGrainRatio);
  const grain_absorption_l = totalGrainKg * grainAbsorptionLKg;
  const sparge_water_l = spargeWaterVolume(
    preboilVolumeL,
    mash_water_l,
    totalGrainKg,
    grainAbsorptionLKg,
    mashTunDeadspaceL
  );
  const total_water_l = mash_water_l + sparge_water_l;
  const strike_temp_c = strikeWaterTemp(grainTempC, targetMashTempC, waterGrainRatio);

  return {
    mash_water_l,
    sparge_water_l,
    total_water_l,
    grain_absorption_l,
    strike_temp_c,
  };
}
