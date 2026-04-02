import { useState } from 'react';
import { useRecipeStore } from '@/store/recipeStore';
import { useCalculations } from '@/hooks/useCalculations';
import { MINERALS, calculateWaterProfile, estimateMashPH, chlorideSulfateRatio } from '@/calculators';
import { produce } from 'immer';
import type { WaterProfileSnapshot, WaterAddition } from '@/types';

const FAMOUS_PROFILES: WaterProfileSnapshot[] = [
  { name: 'Distilled Water', calcium_ppm:0, magnesium_ppm:0, sodium_ppm:0, chloride_ppm:0, sulfate_ppm:0, bicarbonate_ppm:0, ph:7.0, is_global:true },
  { name: 'Pilsen', calcium_ppm:7, magnesium_ppm:3, sodium_ppm:2, chloride_ppm:5, sulfate_ppm:5, bicarbonate_ppm:16, ph:7.0, is_global:true },
  { name: 'Dublin', calcium_ppm:118, magnesium_ppm:4, sodium_ppm:12, chloride_ppm:19, sulfate_ppm:54, bicarbonate_ppm:319, ph:7.3, is_global:true },
  { name: 'London', calcium_ppm:52, magnesium_ppm:32, sodium_ppm:86, chloride_ppm:34, sulfate_ppm:32, bicarbonate_ppm:104, ph:7.4, is_global:true },
  { name: 'Burton-on-Trent', calcium_ppm:268, magnesium_ppm:62, sodium_ppm:30, chloride_ppm:36, sulfate_ppm:638, bicarbonate_ppm:130, ph:7.2, is_global:true },
  { name: 'Vienna', calcium_ppm:200, magnesium_ppm:60, sodium_ppm:8, chloride_ppm:12, sulfate_ppm:125, bicarbonate_ppm:120, ph:7.5, is_global:true },
  { name: 'Munich', calcium_ppm:77, magnesium_ppm:17, sodium_ppm:1, chloride_ppm:8, sulfate_ppm:18, bicarbonate_ppm:295, ph:7.7, is_global:true },
  { name: 'Edinburgh', calcium_ppm:100, magnesium_ppm:20, sodium_ppm:55, chloride_ppm:65, sulfate_ppm:140, bicarbonate_ppm:285, ph:7.2, is_global:true },
];

function IonBar({ label, value, min, max, unit = 'ppm' }: { label: string; value: number; min: number; max: number; unit?: string }) {
  const inRange = value >= min && value <= max;
  const pct = Math.max(0, Math.min(100, ((value - 0) / max) * 100));
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={inRange ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>{value.toFixed(1)} {unit}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-muted-foreground">{min}–{max} {unit} ideal</div>
    </div>
  );
}

export function WaterTab() {
  const { draft, setWaterProfile } = useRecipeStore();
  const stats = useCalculations();
  const [additions, setAdditions] = useState<WaterAddition[]>(
    Object.keys(MINERALS).map(k => ({ mineral: k, amount_g: 0 }))
  );

  const source = draft.water_profile ?? FAMOUS_PROFILES[0];
  const volumeL = stats.mash_water_l > 0 ? stats.mash_water_l : (draft.equipment_profile?.batch_size_l ?? 20);

  const result = calculateWaterProfile(source, additions.filter(a => a.amount_g > 0), volumeL);
  const ph = estimateMashPH(result, draft.fermentables, volumeL);
  const clSoRatio = chlorideSulfateRatio(result.chloride_ppm, result.sulfate_ppm);

  function updateSource(key: keyof WaterProfileSnapshot, val: number) {
    setWaterProfile(produce(source, (s) => { (s as Record<string, unknown>)[key] = val; }));
  }

  function setAdditionAmount(mineral: string, amount_g: number) {
    setAdditions(prev => prev.map(a => a.mineral === mineral ? { ...a, amount_g } : a));
  }

  return (
    <div className="p-4 space-y-6">
      {/* Source water */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h4 className="font-medium text-sm">Source Water</h4>
          <select
            className="text-sm border rounded px-2 py-1 bg-background"
            onChange={e => {
              const profile = FAMOUS_PROFILES.find(p => p.name === e.target.value);
              if (profile) setWaterProfile({ ...profile });
            }}
          >
            <option value="">Load preset...</option>
            {FAMOUS_PROFILES.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {(['calcium_ppm','magnesium_ppm','sodium_ppm','chloride_ppm','sulfate_ppm','bicarbonate_ppm'] as (keyof WaterProfileSnapshot)[]).map(key => (
            <div key={key}>
              <label className="text-xs text-muted-foreground">{key.replace('_ppm','').replace('_',' ')} ppm</label>
              <input type="number" min={0} max={999} step={1} className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background"
                value={Number(source[key] ?? 0)}
                onChange={e => updateSource(key, parseFloat(e.target.value)||0)} />
            </div>
          ))}
        </div>
      </div>

      {/* Mineral additions */}
      <div>
        <h4 className="font-medium text-sm mb-3">Mineral Additions (for {volumeL.toFixed(1)} L)</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {additions.map((a) => (
            <div key={a.mineral} className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">{MINERALS[a.mineral]?.label ?? a.mineral}</label>
                <div className="flex items-center gap-1 mt-1">
                  <input type="number" min={0} step={0.1} className="w-full px-2 py-1.5 text-sm border rounded bg-background"
                    value={a.amount_g}
                    onChange={e => setAdditionAmount(a.mineral, parseFloat(e.target.value)||0)} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resulting profile */}
      <div>
        <h4 className="font-medium text-sm mb-3">Resulting Water Profile</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <IonBar label="Calcium (Ca²⁺)" value={result.calcium_ppm} min={50} max={150} />
          <IonBar label="Magnesium (Mg²⁺)" value={result.magnesium_ppm} min={5} max={30} />
          <IonBar label="Sodium (Na⁺)" value={result.sodium_ppm} min={0} max={150} />
          <IonBar label="Chloride (Cl⁻)" value={result.chloride_ppm} min={0} max={250} />
          <IonBar label="Sulfate (SO₄²⁻)" value={result.sulfate_ppm} min={0} max={350} />
          <IonBar label="Bicarbonate (HCO₃⁻)" value={result.bicarbonate_ppm} min={0} max={250} />
        </div>

        <div className="mt-4 flex gap-6 text-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Estimated Mash pH</span>
            <span className={`text-lg font-bold ${ph >= 5.2 && ph <= 5.6 ? 'text-green-600' : 'text-amber-600'}`}>
              {ph.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">Target: 5.2–5.6</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Cl:SO₄ Ratio</span>
            <span className="text-lg font-bold">{clSoRatio.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">{clSoRatio > 1 ? 'Malt-forward' : clSoRatio < 0.5 ? 'Hop-forward' : 'Balanced'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
