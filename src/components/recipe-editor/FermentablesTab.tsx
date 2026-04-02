import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useRecipeStore } from '@/store/recipeStore';
import { IngredientSearch } from '@/components/shared/IngredientSearch';
import { srmToHex } from '@/calculators';
import { ebcToSRM } from '@/lib/utils';
import type { RecipeFermentable, FermentableType } from '@/types';

const FERMENTABLE_TYPES: FermentableType[] = ['grain','adjunct','sugar','extract','dry_extract','fruit','other'];

const DEFAULTS: RecipeFermentable = {
  name: '', type: 'grain', color_ebc: 4, ppg: 37, fermentability: 75, amount_kg: 1,
};

export function FermentablesTab() {
  const { draft, addFermentable, updateFermentable, removeFermentable, moveFermentable } = useRecipeStore();
  const [form, setForm] = useState<RecipeFermentable>({ ...DEFAULTS });
  const [showForm, setShowForm] = useState(false);

  const totalKg = draft.fermentables.reduce((s, f) => s + f.amount_kg, 0);

  function handleSelect(item: Record<string, unknown>) {
    setForm({
      fermentable_id: String(item.id ?? ''),
      name: String(item.name ?? ''),
      type: (item.type as FermentableType) ?? 'grain',
      color_ebc: Number(item.color_ebc ?? 4),
      ppg: Number(item.ppg ?? 37),
      fermentability: Number(item.fermentability ?? 75),
      amount_kg: 1,
    });
    setShowForm(true);
  }

  function handleAdd() {
    if (!form.name) return;
    addFermentable({ ...form });
    setForm({ ...DEFAULTS });
    setShowForm(false);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Fermentables</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-sm px-3 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Search ingredient database</label>
            <IngredientSearch type="fermentables" onSelect={handleSelect} placeholder="Search malts, adjuncts..." />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs text-muted-foreground">Name</label>
              <input className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <select className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value as FermentableType}))}>
                {FERMENTABLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Amount (kg)</label>
              <input type="number" min={0} step={0.1} className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.amount_kg} onChange={e => setForm(f => ({...f, amount_kg: parseFloat(e.target.value)||0}))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Color (EBC)</label>
              <input type="number" min={0} className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.color_ebc} onChange={e => setForm(f => ({...f, color_ebc: parseFloat(e.target.value)||0}))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">PPG</label>
              <input type="number" min={0} className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.ppg} onChange={e => setForm(f => ({...f, ppg: parseFloat(e.target.value)||0}))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Fermentability %</label>
              <input type="number" min={0} max={100} className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.fermentability} onChange={e => setForm(f => ({...f, fermentability: parseFloat(e.target.value)||0}))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-1.5 text-sm bg-amber-500 text-white rounded hover:bg-amber-600">Add Fermentable</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 text-sm border rounded hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      {draft.fermentables.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="text-left py-2 pr-3">Name</th>
                <th className="text-left py-2 pr-3">Type</th>
                <th className="text-right py-2 pr-3">Amount (kg)</th>
                <th className="text-right py-2 pr-3">Color (EBC)</th>
                <th className="text-right py-2 pr-3">PPG</th>
                <th className="text-right py-2 pr-3">Ferm%</th>
                <th className="text-right py-2 pr-3">% Bill</th>
                <th className="text-right py-2"></th>
              </tr>
            </thead>
            <tbody>
              {draft.fermentables.map((f, i) => {
                const pct = totalKg > 0 ? ((f.amount_kg / totalKg) * 100).toFixed(1) : '0';
                const color = srmToHex(ebcToSRM(f.color_ebc) * 0.6 + 2);
                return (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0 border" style={{ backgroundColor: color }} />
                        <input
                          className="bg-transparent border-0 focus:outline-none focus:border-b w-full"
                          value={f.name}
                          onChange={e => updateFermentable(i, { name: e.target.value })}
                        />
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted">{f.type}</span>
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <input
                        type="number" min={0} step={0.1}
                        className="bg-transparent border-0 focus:outline-none focus:border-b w-20 text-right"
                        value={f.amount_kg}
                        onChange={e => updateFermentable(i, { amount_kg: parseFloat(e.target.value)||0 })}
                      />
                    </td>
                    <td className="py-2 pr-3 text-right">{f.color_ebc}</td>
                    <td className="py-2 pr-3 text-right">{f.ppg}</td>
                    <td className="py-2 pr-3 text-right">{f.fermentability}%</td>
                    <td className="py-2 pr-3 text-right font-medium">{pct}%</td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => i > 0 && moveFermentable(i, i-1)} className="p-1 hover:bg-muted rounded" disabled={i === 0}><ChevronUp className="h-3 w-3" /></button>
                        <button onClick={() => i < draft.fermentables.length-1 && moveFermentable(i, i+1)} className="p-1 hover:bg-muted rounded" disabled={i === draft.fermentables.length-1}><ChevronDown className="h-3 w-3" /></button>
                        <button onClick={() => removeFermentable(i)} className="p-1 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="text-sm font-medium">
                <td className="pt-2" colSpan={2}>Total</td>
                <td className="pt-2 text-right">{totalKg.toFixed(2)} kg</td>
                <td colSpan={5} />
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
          No fermentables yet. Add malts, adjuncts, or extracts.
        </div>
      )}
    </div>
  );
}
