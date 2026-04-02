import type { RecipeHop } from '@/types';
import type { IBUMethod } from '@/types';
import { lToGal } from '@/lib/utils';

/** Convert grams to ounces */
function gToOz(g: number): number {
  return g * 0.035274;
}

// ---------------------------------------------------------------------------
// Tinseth
// ---------------------------------------------------------------------------

/**
 * Tinseth bigness factor.
 */
function tinsethBigness(wortGravity: number): number {
  return 1.65 * Math.pow(0.000125, wortGravity - 1);
}

/**
 * Tinseth time factor.
 */
function tinsethTimeFactor(timeMin: number): number {
  return (1 - Math.exp(-0.04 * timeMin)) / 4.15;
}

export function tinsethIBU(
  alphaAcidPct: number,
  amountG: number,
  boilTimeMin: number,
  batchSizeL: number,
  wortGravity: number,
  utilizationMultiplier = 1.0
): number {
  if (boilTimeMin <= 0 || amountG <= 0) return 0;
  const gallons = lToGal(batchSizeL);
  const utilization = tinsethBigness(wortGravity) * tinsethTimeFactor(boilTimeMin);
  const oz = gToOz(amountG);
  return (utilization * (alphaAcidPct / 100) * oz * 74.89 * utilizationMultiplier) / gallons;
}

// ---------------------------------------------------------------------------
// Rager
// ---------------------------------------------------------------------------

function ragerUtilization(timeMin: number): number {
  return 18.11 + 13.86 * Math.tanh((timeMin - 31.32) / 18.27);
}

function ragerGravityAdjustment(wortGravity: number): number {
  const excess = wortGravity > 1.05 ? (wortGravity - 1.05) / 0.2 : 0;
  return 1 + excess;
}

export function ragerIBU(
  alphaAcidPct: number,
  amountG: number,
  boilTimeMin: number,
  batchSizeL: number,
  wortGravity: number,
  utilizationMultiplier = 1.0
): number {
  if (boilTimeMin <= 0 || amountG <= 0) return 0;
  const gallons = lToGal(batchSizeL);
  const utilization = ragerUtilization(boilTimeMin) / 100;
  const gravAdj = ragerGravityAdjustment(wortGravity);
  const oz = gToOz(amountG);
  return ((oz * (alphaAcidPct / 100) * utilization * 74.89) / (gallons * gravAdj)) * utilizationMultiplier;
}

// ---------------------------------------------------------------------------
// Daniels
// ---------------------------------------------------------------------------

const DANIELS_UTILIZATION: [number, number][] = [
  [0, 0], [3, 2], [5, 5], [10, 6], [15, 8], [20, 10],
  [25, 11], [30, 13], [35, 14], [40, 16], [45, 17], [50, 18],
  [60, 20], [70, 23], [80, 25], [90, 27], [120, 30],
];

function danielsUtilization(timeMin: number): number {
  for (let i = DANIELS_UTILIZATION.length - 1; i >= 0; i--) {
    if (timeMin >= DANIELS_UTILIZATION[i][0]) {
      return DANIELS_UTILIZATION[i][1] / 100;
    }
  }
  return 0;
}

export function danielsIBU(
  alphaAcidPct: number,
  amountG: number,
  boilTimeMin: number,
  batchSizeL: number,
  utilizationMultiplier = 1.0
): number {
  if (boilTimeMin <= 0 || amountG <= 0) return 0;
  const gallons = lToGal(batchSizeL);
  const utilization = danielsUtilization(boilTimeMin);
  const oz = gToOz(amountG);
  return ((oz * utilization * (alphaAcidPct / 100) * 74.89) / gallons) * utilizationMultiplier;
}

// ---------------------------------------------------------------------------
// Total IBU
// ---------------------------------------------------------------------------

/**
 * IBU contribution for a single hop addition.
 * Dry hops and mash hops contribute negligible IBUs.
 */
export function hopIBU(
  hop: RecipeHop,
  batchSizeL: number,
  og: number,
  method: IBUMethod,
  utilizationMultiplier: number
): number {
  if (hop.use === 'dry_hop' || hop.use === 'mash') return 0;

  // Whirlpool: assume 20% utilization relative to a 0-minute addition
  const effectiveTime = hop.use === 'whirlpool' ? Math.max(hop.time_min, 0) : hop.time_min;

  switch (method) {
    case 'tinseth':
      return tinsethIBU(hop.alpha_acid, hop.amount_g, effectiveTime, batchSizeL, og, utilizationMultiplier);
    case 'rager':
      return ragerIBU(hop.alpha_acid, hop.amount_g, effectiveTime, batchSizeL, og, utilizationMultiplier);
    case 'daniels':
      return danielsIBU(hop.alpha_acid, hop.amount_g, effectiveTime, batchSizeL, utilizationMultiplier);
  }
}

export function calculateTotalIBU(
  hops: RecipeHop[],
  batchSizeL: number,
  og: number,
  method: IBUMethod = 'tinseth',
  utilizationMultiplier = 1.0
): number {
  if (hops.length === 0 || batchSizeL <= 0) return 0;
  return hops.reduce(
    (sum, hop) => sum + hopIBU(hop, batchSizeL, og, method, utilizationMultiplier),
    0
  );
}
