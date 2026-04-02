import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useRecipeStore } from '@/store/recipeStore';
import { IngredientSearch } from '@/components/shared/IngredientSearch';
import type { RecipeYeast, YeastType, YeastForm, Flocculation } from '@/types';

const DEFAULTS: RecipeYeast = {
  name: '', lab: '', type: 'ale', form: 'dry', avg_attenuation: 75, amount: 1, amount_unit: 'pkg',
};

export function YeastTab() {
  const { draft, addYeast, updateYeast, removeYeast } = useRecipeStore();
  const [form, setForm] = useState<RecipeYeast>({ ...DEFAULTS });
  const [showForm, setShowForm] = useState(false);

  function handleSelect(item: Record<string, unknown>) {
    setForm({
      yeast_id: String(item.id ?? ''),
      name: String(item.name ?? ''),
      lab: String(item.lab ?? ''),
      code: String(item.code ?? ''),
      type: (item.type as YeastType) ?? 'ale',
      form: (item.form as YeastForm) ?? 'dry',
      avg_attenuation: Number(item.avg_attenuation ?? 75),
      min_temp_c: item.min_temp_c ? Number(item.min_temp_c) : undefined,
      max_temp_c: item.max_temp_c ? Number(item.max_temp_c) : undefined,
      flocculation: item.flocculation as Flocculation | undefined,
      amount: 1,
      amount_unit: 'pkg',
    });
  }

  function handleAdd() {
    if (!form.name) return;
    addYeast({ ...form });
    setForm({ ...DEFAULTS });
    setShowForm(false);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Yeast</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-sm px-3 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
          <IngredientSearch type="yeasts" onSelect={handleSelect} placeholder="Search yeast strains..." />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs text-muted-foreground">Name</label>
              <input className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div><label className="text-xs text-muted-foreground">Lab</label>
              <input className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.lab} onChange={e => setForm(f => ({...f, lab: e.target.value}))} /></div>
            <div><label className="text-xs text-muted-foreground">Code</label>
              <input className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.code ?? ''} onChange={e => setForm(f => ({...f, code: e.target.value}))} /></div>
            <div><label className="text-xs text-muted-foreground">Type</label>
              <select className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value as YeastType}))}>
                {(['ale','lager','wine','champagne','other'] as YeastType[]).map(t => <option key={t} value={t}>{t}</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Form</label>
              <select className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.form} onChange={e => setForm(f => ({...f, form: e.target.value as YeastForm}))}>
                {(['liquid','dry','slant','culture'] as YeastForm[]).map(t => <option key={t} value={t}>{t}</option>)}
              </select></div>
            <div><label className="text-xs text-muted-foreground">Attenuation %</label>
              <input type="number" min={0} max={100} className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.avg_attenuation} onChange={e => setForm(f => ({...f, avg_attenuation: parseFloat(e.target.value)||0}))} /></div>
            <div><label className="text-xs text-muted-foreground">Min Temp (°C)</label>
              <input type="number" className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.min_temp_c ?? ''} onChange={e => setForm(f => ({...f, min_temp_c: e.target.value ? parseFloat(e.target.value) : undefined}))} /></div>
            <div><label className="text-xs text-muted-foreground">Max Temp (°C)</label>
              <input type="number" className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.max_temp_c ?? ''} onChange={e => setForm(f => ({...f, max_temp_c: e.target.value ? parseFloat(e.target.value) : undefined}))} /></div>
            <div><label className="text-xs text-muted-foreground">Amount</label>
              <div className="flex gap-1 mt-1">
                <input type="number" min={0} step={0.1} className="flex-1 px-2 py-1.5 text-sm border rounded bg-background" value={form.amount} onChange={e => setForm(f => ({...f, amount: parseFloat(e.target.value)||1}))} />
                <select className="px-2 py-1.5 text-sm border rounded bg-background" value={form.amount_unit} onChange={e => setForm(f => ({...f, amount_unit: e.target.value as 'pkg'|'g'|'ml'}))}>
                  <option value="pkg">pkg</option><option value="g">g</option><option value="ml">ml</option>
                </select>
              </div></div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-1.5 text-sm bg-amber-500 text-white rounded hover:bg-amber-600">Add Yeast</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 text-sm border rounded hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      {draft.yeasts.length > 0 ? (
        <div className="space-y-2">
          {draft.yeasts.map((y, i) => (
            <div key={i} className="border rounded-lg p-3 flex items-start justify-between gap-3 hover:bg-muted/20">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <div className="font-medium">{y.name}</div>
                  <div className="text-xs text-muted-foreground">{y.lab}{y.code ? ` · ${y.code}` : ''}</div>
                </div>
                <div>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-muted mr-1">{y.type}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-muted">{y.form}</span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Attenuation</div>
                  <div className="font-medium">{y.avg_attenuation}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Temp range</div>
                  <div>{y.min_temp_c ?? '?'}–{y.max_temp_c ?? '?'}°C</div>
                </div>
              </div>
              <button onClick={() => removeYeast(i)} className="p-1 hover:bg-destructive/10 text-destructive rounded flex-shrink-0"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
          No yeast selected. Search and add a yeast strain.
        </div>
      )}
    </div>
  );
}
