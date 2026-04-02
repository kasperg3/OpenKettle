import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useRecipeStore } from '@/store/recipeStore';
import { IngredientSearch } from '@/components/shared/IngredientSearch';
import type { RecipeMisc, MiscType, MiscUse } from '@/types';

const MISC_TYPES: MiscType[] = ['spice','fining','water_agent','herb','flavor','other'];
const MISC_USES: MiscUse[] = ['boil','mash','primary','secondary','bottling','kegging','sparge'];
const AMOUNT_UNITS = ['g','kg','ml','l','tsp','tbsp','oz','each'];

const DEFAULTS: RecipeMisc = { name: '', type: 'other', use: 'boil', amount: 1, amount_unit: 'g' };

export function MiscTab() {
  const { draft, addMisc, removeMisc } = useRecipeStore();
  const [form, setForm] = useState<RecipeMisc>({ ...DEFAULTS });
  const [showForm, setShowForm] = useState(false);

  function handleSelect(item: Record<string, unknown>) {
    setForm(f => ({ ...f, misc_id: String(item.id ?? ''), name: String(item.name ?? ''), type: (item.type as MiscType) ?? 'other' }));
  }

  function handleAdd() {
    if (!form.name) return;
    addMisc({ ...form });
    setForm({ ...DEFAULTS });
    setShowForm(false);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Miscellaneous Additions</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-sm px-3 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
          <IngredientSearch type="miscs" onSelect={handleSelect} placeholder="Search finings, spices, water agents..." />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs text-muted-foreground">Name</label>
              <input className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div><label className="text-xs text-muted-foreground">Type</label>
              <select className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value as MiscType}))}>
                {MISC_TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Use</label>
              <select className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.use} onChange={e => setForm(f => ({...f, use: e.target.value as MiscUse}))}>
                {MISC_USES.map(t => <option key={t} value={t}>{t}</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Amount</label>
              <div className="flex gap-1 mt-1">
                <input type="number" min={0} step={0.1} className="flex-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.amount} onChange={e => setForm(f => ({...f, amount: parseFloat(e.target.value)||0}))} />
                <select className="px-2 py-1.5 text-sm border rounded bg-background" value={form.amount_unit} onChange={e => setForm(f => ({...f, amount_unit: e.target.value as RecipeMisc['amount_unit']}))}>
                  {AMOUNT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div></div>
            <div><label className="text-xs text-muted-foreground">Time (min, optional)</label>
              <input type="number" min={0} className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.time_min ?? ''} onChange={e => setForm(f => ({...f, time_min: e.target.value ? parseFloat(e.target.value) : undefined}))} /></div>
            <div><label className="text-xs text-muted-foreground">Notes</label>
              <input className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.notes ?? ''} onChange={e => setForm(f => ({...f, notes: e.target.value}))} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-1.5 text-sm bg-amber-500 text-white rounded hover:bg-amber-600">Add Misc</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 text-sm border rounded hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      {draft.miscs.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="text-left py-2 pr-3">Name</th>
              <th className="text-left py-2 pr-3">Type</th>
              <th className="text-left py-2 pr-3">Use</th>
              <th className="text-right py-2 pr-3">Amount</th>
              <th className="text-right py-2 pr-3">Time</th>
              <th className="text-left py-2 pr-3">Notes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {draft.miscs.map((m, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="py-2 pr-3 font-medium">{m.name}</td>
                <td className="py-2 pr-3"><span className="text-xs px-1.5 py-0.5 rounded bg-muted">{m.type}</span></td>
                <td className="py-2 pr-3 text-muted-foreground">{m.use}</td>
                <td className="py-2 pr-3 text-right">{m.amount} {m.amount_unit}</td>
                <td className="py-2 pr-3 text-right text-muted-foreground">{m.time_min ? `${m.time_min} min` : '—'}</td>
                <td className="py-2 pr-3 text-muted-foreground text-xs">{m.notes}</td>
                <td className="py-2 text-right">
                  <button onClick={() => removeMisc(i)} className="p-1 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-3 w-3" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
          No misc additions. Add water agents, finings, spices, etc.
        </div>
      )}
    </div>
  );
}
