import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useRecipeStore } from '@/store/recipeStore';
import { useCalculations } from '@/hooks/useCalculations';
import { IngredientSearch } from '@/components/shared/IngredientSearch';
import { hopIBU } from '@/calculators';
import type { RecipeHop, HopForm, HopUse } from '@/types';

const HOP_FORMS: HopForm[] = ['pellet','leaf','cryo','extract'];
const HOP_USES: HopUse[] = ['boil','first_wort','whirlpool','dry_hop','mash'];

const DEFAULTS: RecipeHop = {
  name: '', alpha_acid: 5, amount_g: 28, form: 'pellet', use: 'boil', time_min: 60,
};

export function HopsTab() {
  const { draft, addHop, updateHop, removeHop } = useRecipeStore();
  const stats = useCalculations();
  const [form, setForm] = useState<RecipeHop>({ ...DEFAULTS });
  const [showForm, setShowForm] = useState(false);

  const batchSizeL = draft.equipment_profile?.batch_size_l ?? 20;

  function handleSelect(item: Record<string, unknown>) {
    setForm(f => ({
      ...f,
      hop_id: String(item.id ?? ''),
      name: String(item.name ?? ''),
      alpha_acid: Number(item.alpha_acid ?? 5),
    }));
  }

  function handleAdd() {
    if (!form.name) return;
    addHop({ ...form });
    setForm({ ...DEFAULTS });
    setShowForm(false);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Hops</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-sm px-3 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
          <IngredientSearch type="hops" onSelect={handleSelect} placeholder="Search hops..." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground">Name</label>
              <input className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Alpha Acid %</label>
              <input type="number" min={0} step={0.1} className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.alpha_acid} onChange={e => setForm(f => ({...f, alpha_acid: parseFloat(e.target.value)||0}))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Amount (g)</label>
              <input type="number" min={0} step={1} className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.amount_g} onChange={e => setForm(f => ({...f, amount_g: parseFloat(e.target.value)||0}))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Form</label>
              <select className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.form} onChange={e => setForm(f => ({...f, form: e.target.value as HopForm}))}>
                {HOP_FORMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Use</label>
              <select className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.use} onChange={e => setForm(f => ({...f, use: e.target.value as HopUse}))}>
                {HOP_USES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                {form.use === 'dry_hop' ? 'Days' : 'Time (min)'}
              </label>
              <input type="number" min={0} className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.use === 'dry_hop' ? (form.days_in_dry_hop ?? 3) : form.time_min}
                onChange={e => {
                  const v = parseFloat(e.target.value)||0;
                  setForm(f => form.use === 'dry_hop' ? {...f, days_in_dry_hop: v, time_min: 0} : {...f, time_min: v});
                }} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-1.5 text-sm bg-amber-500 text-white rounded hover:bg-amber-600">Add Hop</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 text-sm border rounded hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      {draft.hops.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="text-left py-2 pr-3">Name</th>
                <th className="text-left py-2 pr-3">Form</th>
                <th className="text-left py-2 pr-3">Use</th>
                <th className="text-right py-2 pr-3">Amount (g)</th>
                <th className="text-right py-2 pr-3">AA%</th>
                <th className="text-right py-2 pr-3">Time</th>
                <th className="text-right py-2 pr-3">IBU</th>
                <th className="text-right py-2"></th>
              </tr>
            </thead>
            <tbody>
              {draft.hops.map((h, i) => {
                const ibu = hopIBU(h, batchSizeL, stats.og, 'tinseth', 1.0);
                return (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="py-2 pr-3">
                      <input className="bg-transparent border-0 focus:outline-none focus:border-b w-full" value={h.name} onChange={e => updateHop(i, {name: e.target.value})} />
                    </td>
                    <td className="py-2 pr-3"><span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-800">{h.form}</span></td>
                    <td className="py-2 pr-3"><span className="text-xs px-1.5 py-0.5 rounded bg-muted">{h.use.replace('_',' ')}</span></td>
                    <td className="py-2 pr-3 text-right">
                      <input type="number" min={0} className="bg-transparent border-0 focus:outline-none focus:border-b w-16 text-right" value={h.amount_g} onChange={e => updateHop(i, {amount_g: parseFloat(e.target.value)||0})} />
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <input type="number" min={0} step={0.1} className="bg-transparent border-0 focus:outline-none focus:border-b w-16 text-right" value={h.alpha_acid} onChange={e => updateHop(i, {alpha_acid: parseFloat(e.target.value)||0})} />
                    </td>
                    <td className="py-2 pr-3 text-right text-muted-foreground">
                      {h.use === 'dry_hop' ? `${h.days_in_dry_hop ?? 3}d` : `${h.time_min}min`}
                    </td>
                    <td className="py-2 pr-3 text-right font-medium">{ibu.toFixed(1)}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => removeHop(i)} className="p-1 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-3 w-3" /></button>
                    </td>
                  </tr>
                );
              })}
              <tr className="text-sm font-medium">
                <td className="pt-2" colSpan={6}>Total IBU</td>
                <td className="pt-2 text-right">{stats.ibu.toFixed(1)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
          No hops yet. Add boil, whirlpool, or dry hop additions.
        </div>
      )}
    </div>
  );
}
