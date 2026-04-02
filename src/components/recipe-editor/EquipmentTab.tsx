import { useRecipeStore } from '@/store/recipeStore';
import { produce } from 'immer';
import type { EquipmentProfileSnapshot } from '@/types';

const DEFAULT_EQ: EquipmentProfileSnapshot = {
  name: 'Default', batch_size_l: 20, boil_size_l: 26, boil_time_min: 60,
  evaporation_rate_pct: 10, mash_tun_deadspace_l: 1, fermenter_loss_l: 1,
  trub_loss_l: 1, grain_absorption_l_kg: 1.04, hop_absorption_l_per_100g: 0.5,
  efficiency_pct: 72, is_default: false,
};

export function EquipmentTab() {
  const { draft, setEquipmentProfile } = useRecipeStore();
  const eq = draft.equipment_profile ?? { ...DEFAULT_EQ };

  function update(key: keyof EquipmentProfileSnapshot, val: number | string | boolean) {
    setEquipmentProfile(produce(eq, (e) => { (e as Record<string, unknown>)[key] = val; }));
  }

  function field(label: string, key: keyof EquipmentProfileSnapshot, unit: string, step = 1, min = 0, max = 9999) {
    const val = eq[key];
    return (
      <div>
        <label className="text-xs text-muted-foreground">{label}</label>
        <div className="flex items-center gap-1 mt-1">
          <input
            type="number" min={min} max={max} step={step}
            className="flex-1 px-2 py-1.5 text-sm border rounded bg-background"
            value={Number(val ?? 0)}
            onChange={e => update(key, parseFloat(e.target.value) || 0)}
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">{unit}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <label className="text-xs text-muted-foreground">Profile Name</label>
        <input
          className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background"
          value={eq.name}
          onChange={e => update('name', e.target.value)}
        />
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Volumes</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {field('Batch Size', 'batch_size_l', 'L', 0.5, 1, 1000)}
          {field('Boil Size', 'boil_size_l', 'L', 0.5, 1, 1000)}
          {field('Boil Time', 'boil_time_min', 'min', 5, 15, 360)}
          {field('Evaporation Rate', 'evaporation_rate_pct', '%/hr', 0.5, 0, 50)}
          {field('Fermenter Loss', 'fermenter_loss_l', 'L', 0.1, 0, 20)}
          {field('Trub Loss', 'trub_loss_l', 'L', 0.1, 0, 20)}
          {field('Mash Tun Deadspace', 'mash_tun_deadspace_l', 'L', 0.1, 0, 20)}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Absorption & Efficiency</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {field('Brewhouse Efficiency', 'efficiency_pct', '%', 1, 10, 100)}
          {field('Grain Absorption', 'grain_absorption_l_kg', 'L/kg', 0.01, 0, 5)}
          {field('Hop Absorption', 'hop_absorption_l_per_100g', 'L/100g', 0.05, 0, 5)}
        </div>
      </div>

      <div className="p-3 bg-muted/30 rounded-lg text-sm">
        <p className="text-muted-foreground text-xs">
          <strong>Brewhouse efficiency</strong> (72% default) accounts for mash conversion, lauter efficiency, and losses.
          Adjust after a few brews once you know your system.
          <strong> Grain absorption</strong> is typically 0.96–1.1 L/kg for crushed malt.
        </p>
      </div>
    </div>
  );
}
