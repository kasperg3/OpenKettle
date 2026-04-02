import { useMemo } from 'react';
import { useRecipeStore } from '@/store/recipeStore';
import {
  calculateOG, calculatePreBoilOG,
  calculateFG,
  calculateABV,
  calculateSRM, calculateEBC, calculateMCU,
  calculateTotalIBU,
  calculateMashWater,
  apparentAttenuation,
} from '@/calculators';
import type { CalculatedStats } from '@/types';

export function useCalculations(): CalculatedStats {
  const draft = useRecipeStore((s) => s.draft);

  return useMemo(() => {
    const eq = draft.equipment_profile;
    const mash = draft.mash_profile;

    const batchSizeL = eq?.batch_size_l ?? 20;
    const boilSizeL = eq?.boil_size_l ?? 26;
    const efficiencyPct = eq?.efficiency_pct ?? 72;
    const mashTempC = mash?.steps?.[0]?.temp_c ?? 66;
    const waterGrainRatio = mash?.water_grain_ratio ?? 3.0;

    const fermentables = draft.fermentables;
    const hops = draft.hops;
    const yeasts = draft.yeasts;

    const totalGrainKg = fermentables.reduce((s, f) => s + f.amount_kg, 0);

    const og = calculateOG(fermentables, batchSizeL, efficiencyPct);
    const preboil_og = calculatePreBoilOG(fermentables, boilSizeL, efficiencyPct);
    const fg = calculateFG(og, yeasts, fermentables, 'normal', mashTempC);
    const abv = calculateABV(og, fg, 'standard');
    const srm = calculateSRM(fermentables, batchSizeL);
    const ebc = calculateEBC(fermentables, batchSizeL);
    const mcu = calculateMCU(fermentables, batchSizeL);
    const ibu = calculateTotalIBU(hops, batchSizeL, og, 'tinseth', 1.0);
    const bu_gu = og > 1 ? ibu / ((og - 1) * 1000) : 0;
    const attenuation = apparentAttenuation(og, fg);

    // Weighted average fermentability
    const totalPPG = fermentables.reduce((s, f) => s + f.ppg * f.amount_kg, 0);
    const fermentability = totalPPG > 0
      ? fermentables.reduce((s, f) => s + f.fermentability * (f.ppg * f.amount_kg) / totalPPG, 0)
      : 75;

    // Mash water
    const mashCalc = totalGrainKg > 0
      ? calculateMashWater(
          totalGrainKg,
          waterGrainRatio,
          boilSizeL,
          20, // assumed grain temp °C
          mashTempC,
          eq?.grain_absorption_l_kg ?? 1.04,
          eq?.mash_tun_deadspace_l ?? 1,
        )
      : { mash_water_l: 0, sparge_water_l: 0, total_water_l: 0, grain_absorption_l: 0, strike_temp_c: 0 };

    return {
      og,
      fg,
      abv,
      ibu,
      srm,
      ebc,
      bu_gu,
      attenuation,
      fermentability,
      mcu,
      total_grain_kg: totalGrainKg,
      mash_water_l: mashCalc.mash_water_l,
      sparge_water_l: mashCalc.sparge_water_l,
      total_water_l: mashCalc.total_water_l,
      strike_temp_c: mashCalc.strike_temp_c,
      preboil_og,
    };
  }, [draft]);
}
