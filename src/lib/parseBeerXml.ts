import type {
  RecipeDraft,
  RecipeFermentable, FermentableType,
  RecipeHop, HopForm, HopUse,
  RecipeYeast, YeastType, YeastForm,
  RecipeMisc, MiscType, MiscUse,
} from '@/types';

// ── helpers ──────────────────────────────────────────────────────────────────

function text(el: Element, tag: string): string {
  return el.querySelector(tag)?.textContent?.trim() ?? '';
}

function num(el: Element, tag: string, fallback = 0): number {
  const v = parseFloat(text(el, tag));
  return isNaN(v) ? fallback : v;
}

// BeerXML stores color in SRM; we use EBC internally (1 SRM ≈ 1.97 EBC)
function srmToEbc(srm: number) { return Math.round(srm * 1.97 * 10) / 10; }

// BeerXML YIELD is % extract yield → PPG (points per pound per gallon)
// PPG = yield_pct / 100 * 46.214
function yieldToPpg(yieldPct: number) { return Math.round(yieldPct * 0.46214 * 10) / 10; }

// ── section parsers ───────────────────────────────────────────────────────────

function parseFermentables(recipeEl: Element): RecipeFermentable[] {
  const typeMap: Record<string, FermentableType> = {
    grain: 'grain', sugar: 'sugar', extract: 'extract',
    'dry extract': 'dry_extract', 'liquid extract': 'extract',
    adjunct: 'adjunct', other: 'other',
  };
  return Array.from(recipeEl.querySelectorAll('FERMENTABLES > FERMENTABLE')).map(el => ({
    name: text(el, 'NAME'),
    type: typeMap[text(el, 'TYPE').toLowerCase()] ?? 'other',
    color_ebc: srmToEbc(num(el, 'COLOR')),
    ppg: yieldToPpg(num(el, 'YIELD', 75)),
    fermentability: 75,
    amount_kg: num(el, 'AMOUNT'),
    notes: text(el, 'NOTES') || undefined,
  }));
}

function parseHops(recipeEl: Element): RecipeHop[] {
  const useMap: Record<string, HopUse> = {
    boil: 'boil', 'dry hop': 'dry_hop', mash: 'mash',
    'first wort': 'first_wort', aroma: 'whirlpool',
  };
  const formMap: Record<string, HopForm> = {
    pellet: 'pellet', leaf: 'leaf', plug: 'leaf',
  };
  return Array.from(recipeEl.querySelectorAll('HOPS > HOP')).map(el => {
    const use: HopUse = useMap[text(el, 'USE').toLowerCase()] ?? 'boil';
    const timeMin = num(el, 'TIME');
    return {
      name: text(el, 'NAME'),
      alpha_acid: num(el, 'ALPHA', 5),
      // BeerXML amount is in kg; we store grams
      amount_g: Math.round(num(el, 'AMOUNT') * 1000 * 10) / 10,
      form: formMap[text(el, 'FORM').toLowerCase()] ?? 'pellet',
      use,
      time_min: use === 'dry_hop' ? 0 : timeMin,
      // BeerXML dry hop TIME is in minutes; convert to days
      days_in_dry_hop: use === 'dry_hop' ? (Math.round(timeMin / 1440) || 7) : undefined,
      notes: text(el, 'NOTES') || undefined,
    };
  });
}

function parseYeasts(recipeEl: Element): RecipeYeast[] {
  const typeMap: Record<string, YeastType> = {
    ale: 'ale', lager: 'lager', wheat: 'ale',
    wine: 'wine', champagne: 'champagne',
  };
  const formMap: Record<string, YeastForm> = {
    liquid: 'liquid', dry: 'dry', slant: 'slant', culture: 'culture',
  };
  return Array.from(recipeEl.querySelectorAll('YEASTS > YEAST')).map(el => ({
    name: text(el, 'NAME'),
    lab: text(el, 'LABORATORY') || 'Unknown',
    code: text(el, 'PRODUCT_ID') || undefined,
    type: typeMap[text(el, 'TYPE').toLowerCase()] ?? 'ale',
    form: formMap[text(el, 'FORM').toLowerCase()] ?? 'dry',
    avg_attenuation: num(el, 'ATTENUATION', 75),
    min_temp_c: num(el, 'MIN_TEMPERATURE', 18),
    max_temp_c: num(el, 'MAX_TEMPERATURE', 24),
    amount: 1,
    amount_unit: 'pkg' as const,
    notes: text(el, 'NOTES') || undefined,
  }));
}

function parseMiscs(recipeEl: Element): RecipeMisc[] {
  const typeMap: Record<string, MiscType> = {
    spice: 'spice', fining: 'fining', 'water agent': 'water_agent',
    herb: 'herb', flavor: 'flavor', other: 'other',
  };
  const useMap: Record<string, MiscUse> = {
    boil: 'boil', mash: 'mash', primary: 'primary',
    secondary: 'secondary', bottling: 'bottling', sparge: 'sparge',
  };
  return Array.from(recipeEl.querySelectorAll('MISCS > MISC')).map(el => {
    const isWeight = text(el, 'AMOUNT_IS_WEIGHT').toUpperCase() === 'TRUE';
    const rawAmount = num(el, 'AMOUNT');
    // BeerXML: kg if weight, liters if liquid → convert to g or ml
    const amount = Math.round(rawAmount * 1000 * 10) / 10;
    return {
      name: text(el, 'NAME'),
      type: typeMap[text(el, 'TYPE').toLowerCase()] ?? 'other',
      use: useMap[text(el, 'USE').toLowerCase()] ?? 'boil',
      time_min: num(el, 'TIME') || undefined,
      amount,
      amount_unit: (isWeight ? 'g' : 'ml') as RecipeMisc['amount_unit'],
      notes: text(el, 'NOTES') || undefined,
    };
  });
}

// ── main export ───────────────────────────────────────────────────────────────

export function parseBeerXml(xmlText: string): RecipeDraft {
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml');

  if (doc.querySelector('parseerror')) {
    throw new Error('Invalid XML — could not parse file');
  }

  const recipeEl = doc.querySelector('RECIPE');
  if (!recipeEl) throw new Error('No <RECIPE> element found in file');

  const batchSizeL = num(recipeEl, 'BATCH_SIZE', 20);
  const boilSizeL = num(recipeEl, 'BOIL_SIZE', batchSizeL * 1.3);

  // Style
  const styleEl = recipeEl.querySelector('STYLE');
  const styleName = styleEl ? text(styleEl, 'NAME') : '';

  // Equipment overrides
  const equipEl = recipeEl.querySelector('EQUIPMENT');
  const evapRate = equipEl ? num(equipEl, 'EVAP_RATE', 10) : 10;
  const equipName = equipEl ? (text(equipEl, 'NAME') || 'Imported Equipment') : 'Imported Equipment';

  // Mash profile
  const mashEl = recipeEl.querySelector('MASH');
  const mashSteps = mashEl
    ? Array.from(mashEl.querySelectorAll('MASH_STEPS > MASH_STEP')).map(s => ({
        name: text(s, 'NAME') || 'Mash',
        type: 'infusion' as const,
        temp_c: num(s, 'STEP_TEMP', 66),
        time_min: num(s, 'STEP_TIME', 60),
      }))
    : [{ name: 'Mash', type: 'infusion' as const, temp_c: 66, time_min: 60 }];

  return {
    name: text(recipeEl, 'NAME') || 'Imported Recipe',
    description: text(recipeEl, 'NOTES') || undefined,
    style_name: styleName || undefined,
    is_public: true,
    tags: [],
    version: 1,
    fermentables: parseFermentables(recipeEl),
    hops: parseHops(recipeEl),
    yeasts: parseYeasts(recipeEl),
    miscs: parseMiscs(recipeEl),
    recipe_notes: undefined,
    batch_notes: undefined,
    equipment_profile: {
      name: equipName,
      batch_size_l: batchSizeL,
      boil_size_l: boilSizeL,
      boil_time_min: num(recipeEl, 'BOIL_TIME', 60),
      evaporation_rate_pct: evapRate,
      mash_tun_deadspace_l: 1,
      fermenter_loss_l: 1,
      trub_loss_l: 1,
      grain_absorption_l_kg: 1.04,
      hop_absorption_l_per_100g: 0.5,
      efficiency_pct: num(recipeEl, 'EFFICIENCY', 72),
      is_default: false,
    },
    mash_profile: {
      name: mashEl ? (text(mashEl, 'NAME') || 'Imported Mash') : 'Single Infusion',
      steps: mashSteps,
      sparge_temp_c: mashEl ? num(mashEl, 'SPARGE_TEMP', 76) : 76,
      water_grain_ratio: 3.0,
      is_default: false,
    },
    fermentation_profile: {
      name: 'Standard Ale',
      stages: [{ name: 'Primary', temp_c: 20, days: 7 }],
      is_default: false,
    },
  };
}
