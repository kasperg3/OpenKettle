// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { parseBeerXml } from '@/lib/parseBeerXml';

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>Cascade Pale Ale</NAME>
    <NOTES>A classic American pale ale.</NOTES>
    <BATCH_SIZE>20.0</BATCH_SIZE>
    <BOIL_SIZE>26.0</BOIL_SIZE>
    <BOIL_TIME>60</BOIL_TIME>
    <EFFICIENCY>72</EFFICIENCY>
    <STYLE>
      <NAME>American Pale Ale</NAME>
    </STYLE>
    <FERMENTABLES>
      <FERMENTABLE>
        <NAME>Pale 2-Row</NAME>
        <TYPE>Grain</TYPE>
        <AMOUNT>4.5</AMOUNT>
        <COLOR>3.5</COLOR>
        <YIELD>78</YIELD>
        <NOTES>Base malt</NOTES>
      </FERMENTABLE>
      <FERMENTABLE>
        <NAME>Crystal 40</NAME>
        <TYPE>Grain</TYPE>
        <AMOUNT>0.3</AMOUNT>
        <COLOR>80</COLOR>
        <YIELD>72</YIELD>
      </FERMENTABLE>
    </FERMENTABLES>
    <HOPS>
      <HOP>
        <NAME>Cascade</NAME>
        <ALPHA>5.5</ALPHA>
        <AMOUNT>0.028</AMOUNT>
        <TIME>60</TIME>
        <USE>Boil</USE>
        <FORM>Pellet</FORM>
      </HOP>
      <HOP>
        <NAME>Cascade</NAME>
        <ALPHA>5.5</ALPHA>
        <AMOUNT>0.056</AMOUNT>
        <TIME>10080</TIME>
        <USE>Dry Hop</USE>
        <FORM>Pellet</FORM>
      </HOP>
    </HOPS>
    <YEASTS>
      <YEAST>
        <NAME>American Ale</NAME>
        <LABORATORY>Wyeast</LABORATORY>
        <PRODUCT_ID>1056</PRODUCT_ID>
        <TYPE>Ale</TYPE>
        <FORM>Liquid</FORM>
        <ATTENUATION>75</ATTENUATION>
        <MIN_TEMPERATURE>16</MIN_TEMPERATURE>
        <MAX_TEMPERATURE>22</MAX_TEMPERATURE>
      </YEAST>
    </YEASTS>
    <MISCS>
      <MISC>
        <NAME>Irish Moss</NAME>
        <TYPE>Fining</TYPE>
        <USE>Boil</USE>
        <TIME>15</TIME>
        <AMOUNT>0.005</AMOUNT>
        <AMOUNT_IS_WEIGHT>TRUE</AMOUNT_IS_WEIGHT>
      </MISC>
    </MISCS>
    <MASH>
      <NAME>Single Infusion</NAME>
      <SPARGE_TEMP>76</SPARGE_TEMP>
      <MASH_STEPS>
        <MASH_STEP>
          <NAME>Saccharification</NAME>
          <STEP_TEMP>66</STEP_TEMP>
          <STEP_TIME>60</STEP_TIME>
          <TYPE>Infusion</TYPE>
        </MASH_STEP>
      </MASH_STEPS>
    </MASH>
  </RECIPE>
</RECIPES>`;

describe('parseBeerXml', () => {
  it('throws on invalid XML', () => {
    expect(() => parseBeerXml('<not valid xml')).toThrow();
  });

  it('throws when no RECIPE element found', () => {
    expect(() => parseBeerXml('<RECIPES></RECIPES>')).toThrow('No <RECIPE>');
  });

  it('parses recipe name and notes', () => {
    const draft = parseBeerXml(SAMPLE_XML);
    expect(draft.name).toBe('Cascade Pale Ale');
    expect(draft.description).toBe('A classic American pale ale.');
  });

  it('parses style name', () => {
    const draft = parseBeerXml(SAMPLE_XML);
    expect(draft.style_name).toBe('American Pale Ale');
  });

  it('parses fermentables', () => {
    const { fermentables } = parseBeerXml(SAMPLE_XML);
    expect(fermentables).toHaveLength(2);

    const base = fermentables[0];
    expect(base.name).toBe('Pale 2-Row');
    expect(base.type).toBe('grain');
    expect(base.amount_kg).toBeCloseTo(4.5, 3);
    // COLOR 3.5 SRM → 3.5 × 1.97 ≈ 6.9 EBC
    expect(base.color_ebc).toBeCloseTo(6.9, 0);
    // YIELD 78% → PPG = 78 × 0.46214 ≈ 36.0
    expect(base.ppg).toBeCloseTo(36.0, 0);
  });

  it('parses hops and converts kg → g', () => {
    const { hops } = parseBeerXml(SAMPLE_XML);
    expect(hops).toHaveLength(2);

    const boilHop = hops[0];
    expect(boilHop.name).toBe('Cascade');
    expect(boilHop.use).toBe('boil');
    expect(boilHop.amount_g).toBeCloseTo(28, 0); // 0.028 kg = 28 g
    expect(boilHop.time_min).toBe(60);
    expect(boilHop.alpha_acid).toBeCloseTo(5.5, 1);
  });

  it('parses dry hop and converts minutes → days', () => {
    const { hops } = parseBeerXml(SAMPLE_XML);
    const dryHop = hops[1];
    expect(dryHop.use).toBe('dry_hop');
    expect(dryHop.time_min).toBe(0);
    // 10080 min = 7 days
    expect(dryHop.days_in_dry_hop).toBe(7);
    expect(dryHop.amount_g).toBeCloseTo(56, 0);
  });

  it('parses yeast', () => {
    const { yeasts } = parseBeerXml(SAMPLE_XML);
    expect(yeasts).toHaveLength(1);
    const y = yeasts[0];
    expect(y.name).toBe('American Ale');
    expect(y.lab).toBe('Wyeast');
    expect(y.code).toBe('1056');
    expect(y.type).toBe('ale');
    expect(y.form).toBe('liquid');
    expect(y.avg_attenuation).toBe(75);
    expect(y.min_temp_c).toBe(16);
    expect(y.max_temp_c).toBe(22);
  });

  it('parses misc additions', () => {
    const { miscs } = parseBeerXml(SAMPLE_XML);
    expect(miscs).toHaveLength(1);
    const m = miscs[0];
    expect(m.name).toBe('Irish Moss');
    expect(m.type).toBe('fining');
    expect(m.use).toBe('boil');
    expect(m.amount_unit).toBe('g');
    // 0.005 kg × 1000 = 5 g
    expect(m.amount).toBeCloseTo(5, 1);
  });

  it('parses mash profile', () => {
    const { mash_profile } = parseBeerXml(SAMPLE_XML);
    expect(mash_profile?.name).toBe('Single Infusion');
    expect(mash_profile?.sparge_temp_c).toBe(76);
    expect(mash_profile?.steps).toHaveLength(1);
    expect(mash_profile?.steps[0].temp_c).toBe(66);
    expect(mash_profile?.steps[0].time_min).toBe(60);
  });

  it('parses equipment profile from recipe fields', () => {
    const { equipment_profile } = parseBeerXml(SAMPLE_XML);
    expect(equipment_profile?.batch_size_l).toBeCloseTo(20, 1);
    expect(equipment_profile?.boil_size_l).toBeCloseTo(26, 1);
    expect(equipment_profile?.boil_time_min).toBe(60);
    expect(equipment_profile?.efficiency_pct).toBe(72);
  });
});
