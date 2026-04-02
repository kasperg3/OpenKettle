/**
 * CO2 dissolved in beer at a given temperature (volumes).
 * Used to calculate residual carbonation before priming.
 */
export function residualCO2(beerTempC: number): number {
  // Approximation of dissolved CO2 at conditioning temperature
  return 3.0378 - 0.050062 * beerTempC + 0.00026555 * beerTempC * beerTempC;
}

/** Sugar type CO2 yield factors (g CO2 per g sugar) */
const SUGAR_CO2_FACTOR: Record<string, number> = {
  corn_sugar:  0.4656,
  table_sugar: 0.5143,
  honey:       0.4306,
  dme:         0.4483,
};

/**
 * Priming sugar amount needed to achieve target volumes CO2.
 * @param targetVolumes  - desired CO2 volumes (e.g. 2.4)
 * @param beerVolumeL   - volume of beer being primed
 * @param beerTempC     - temperature at which fermentation ended (for residual CO2)
 * @param sugarType     - type of priming sugar
 * @returns grams of sugar needed
 */
export function primingSugarAmount(
  targetVolumes: number,
  beerVolumeL: number,
  beerTempC: number,
  sugarType: keyof typeof SUGAR_CO2_FACTOR = 'corn_sugar'
): number {
  const residual = residualCO2(beerTempC);
  const neededCO2 = Math.max(0, targetVolumes - residual);
  const co2PerLiter = neededCO2 * 1.96; // grams CO2 per liter per volume
  const totalCO2g = co2PerLiter * beerVolumeL;
  const factor = SUGAR_CO2_FACTOR[sugarType] ?? SUGAR_CO2_FACTOR.corn_sugar;
  return totalCO2g / factor;
}

/**
 * Volumes CO2 produced by a given amount of priming sugar.
 */
export function volumesCO2FromSugar(
  sugarG: number,
  beerVolumeL: number,
  beerTempC: number,
  sugarType: keyof typeof SUGAR_CO2_FACTOR = 'corn_sugar'
): number {
  const factor = SUGAR_CO2_FACTOR[sugarType] ?? SUGAR_CO2_FACTOR.corn_sugar;
  const totalCO2g = sugarG * factor;
  const co2PerLiter = totalCO2g / beerVolumeL;
  const producedVolumes = co2PerLiter / 1.96;
  return residualCO2(beerTempC) + producedVolumes;
}
