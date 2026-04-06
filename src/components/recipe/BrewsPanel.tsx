import { useState } from 'react';
import { FlaskConical, ChevronDown, ChevronRight, Star, Trash2, GitCompare, Pencil, Check, X } from 'lucide-react';
import { useBrews, useUpdateBrew, useDeleteBrew } from '@/hooks/useBrews';
import { useAuthStore } from '@/store/authStore';
import type { Brew, UpdateBrewPayload } from '@/types';

interface Props {
  recipeId: string;
  recipeOwnerId: string;
  onCompare: (a: Brew, b: Brew) => void;
}

export function BrewsPanel({ recipeId, recipeOwnerId, onCompare }: Props) {
  const { user } = useAuthStore();
  const isOwner = user?.id === recipeOwnerId;
  const { data: brews = [], isLoading } = useBrews(recipeId);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string[]>([]);

  const toggleExpand = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSelect = (id: string) =>
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });

  const handleCompare = () => {
    const [a, b] = selected.map(id => brews.find(v => v.id === id)!);
    if (a && b) onCompare(a, b);
  };

  if (isLoading) return <p className="text-sm text-zinc-400 py-4">Loading brews…</p>;

  if (brews.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-400">
        <FlaskConical className="mx-auto mb-2 opacity-40" size={32} />
        <p className="text-sm">No brews logged yet.</p>
        {isOwner && (
          <p className="text-xs mt-1">Use <strong>Start Brew</strong> in the recipe editor to begin a brew session.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {selected.length === 2 && (
        <button
          onClick={handleCompare}
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium rounded-lg w-full justify-center"
        >
          <GitCompare size={16} />
          Compare Brew #{brews.find(b => b.id === selected[0])?.brew_number} vs Brew #{brews.find(b => b.id === selected[1])?.brew_number}
        </button>
      )}
      {selected.length === 1 && (
        <p className="text-xs text-zinc-400 text-center">Select one more brew to compare</p>
      )}

      {brews.map(brew => (
        <BrewRow
          key={brew.id}
          brew={brew}
          isOwner={isOwner}
          isExpanded={expanded.has(brew.id)}
          isSelected={selected.includes(brew.id)}
          onToggleExpand={() => toggleExpand(brew.id)}
          onToggleSelect={() => toggleSelect(brew.id)}
        />
      ))}
    </div>
  );
}

// ── Single brew row ───────────────────────────────────────────────────────────

interface BrewRowProps {
  brew: Brew;
  isOwner: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
}

function BrewRow({ brew, isOwner, isExpanded, isSelected, onToggleExpand, onToggleSelect }: BrewRowProps) {
  const { mutate: deleteBrew } = useDeleteBrew();

  const efficiency = brew.pre_boil_og && brew.planned_og
    ? Math.round(((brew.actual_og ?? brew.pre_boil_og) - 1) / (brew.planned_og - 1) * 100)
    : null;

  return (
    <div className={`border rounded-lg overflow-hidden transition-colors ${isSelected ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-700 bg-zinc-800/50'}`}>
      {/* Summary row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Compare checkbox */}
        <button
          onClick={onToggleSelect}
          title="Select for comparison"
          className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
            isSelected ? 'bg-amber-500 border-amber-500' : 'border-zinc-500 hover:border-amber-400'
          }`}
        >
          {isSelected && <span className="text-black text-[10px] font-bold">✓</span>}
        </button>

        {/* Brew number badge */}
        <span className="text-xs font-mono bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded flex-shrink-0">
          #{brew.brew_number}
        </span>

        {/* Name + notes */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-100 truncate">{brew.name}</p>
          {brew.notes && <p className="text-xs text-zinc-400 truncate">{brew.notes}</p>}
        </div>

        {/* Key measurements */}
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          {brew.actual_og && (
            <MeasurePill
              label="OG"
              value={brew.actual_og.toFixed(3)}
              planned={brew.planned_og}
              actual={brew.actual_og}
            />
          )}
          {brew.actual_fg && (
            <MeasurePill label="FG" value={brew.actual_fg.toFixed(3)} />
          )}
          {brew.actual_og && brew.actual_fg && (
            <MeasurePill
              label="ABV"
              value={`${((brew.actual_og - brew.actual_fg) * 131.25).toFixed(1)}%`}
            />
          )}
          {efficiency !== null && (
            <span className="text-[11px] bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded">
              {efficiency}% eff.
            </span>
          )}
          {brew.rating && (
            <span className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: brew.rating }, (_, i) => <Star key={i} size={10} fill="currentColor" />)}
            </span>
          )}
        </div>

        {/* Date */}
        {brew.brew_date && (
          <span className="text-xs text-zinc-500 flex-shrink-0 hidden md:block">
            {new Date(brew.brew_date).toLocaleDateString()}
          </span>
        )}

        <button onClick={onToggleExpand} className="text-zinc-400 hover:text-zinc-200 flex-shrink-0">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {isOwner && (
          <button
            onClick={() => deleteBrew({ id: brew.id, recipeId: brew.recipe_id })}
            className="text-zinc-600 hover:text-red-400 flex-shrink-0"
            title="Delete brew"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Expanded: full measurements */}
      {isExpanded && (
        <div className="border-t border-zinc-700 p-3">
          <BrewMeasurements brew={brew} isOwner={isOwner} />
        </div>
      )}
    </div>
  );
}

// ── Measurements display + inline edit ───────────────────────────────────────

function BrewMeasurements({ brew, isOwner }: { brew: Brew; isOwner: boolean }) {
  const { mutate: updateBrew, isPending } = useUpdateBrew();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateBrewPayload>({});

  const startEdit = () => {
    setForm({
      brew_date: brew.brew_date ?? '',
      mash_temp_c: brew.mash_temp_c,
      mash_ph: brew.mash_ph,
      pre_boil_volume_l: brew.pre_boil_volume_l,
      pre_boil_og: brew.pre_boil_og,
      pre_boil_ph: brew.pre_boil_ph,
      post_boil_volume_l: brew.post_boil_volume_l,
      actual_og: brew.actual_og,
      pitch_temp_c: brew.pitch_temp_c,
      actual_fg: brew.actual_fg,
      fermentation_temp_c: brew.fermentation_temp_c,
      rating: brew.rating,
      notes: brew.notes,
    });
    setEditing(true);
  };

  const handleSave = () => {
    updateBrew(
      { id: brew.id, recipeId: brew.recipe_id, ...form },
      { onSuccess: () => setEditing(false) }
    );
  };

  const set = (key: keyof UpdateBrewPayload, val: string) => {
    const num = parseFloat(val);
    setForm(prev => ({ ...prev, [key]: val === '' ? undefined : isNaN(num) ? val : num }));
  };

  if (editing) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
          <Field label="Brew date" type="date" value={form.brew_date as string ?? ''} onChange={v => setForm(p => ({ ...p, brew_date: v || undefined }))} />
          <Field label="Mash temp (°C)" value={form.mash_temp_c?.toString() ?? ''} onChange={v => set('mash_temp_c', v)} placeholder="e.g. 67" />
          <Field label="Mash pH" value={form.mash_ph?.toString() ?? ''} onChange={v => set('mash_ph', v)} placeholder="e.g. 5.3" />
          <Field label="Pre-boil vol (L)" value={form.pre_boil_volume_l?.toString() ?? ''} onChange={v => set('pre_boil_volume_l', v)} placeholder="e.g. 27" />
          <Field label="Pre-boil OG" value={form.pre_boil_og?.toString() ?? ''} onChange={v => set('pre_boil_og', v)} placeholder="e.g. 1.040" />
          <Field label="Pre-boil pH" value={form.pre_boil_ph?.toString() ?? ''} onChange={v => set('pre_boil_ph', v)} placeholder="e.g. 5.4" />
          <Field label="Post-boil vol (L)" value={form.post_boil_volume_l?.toString() ?? ''} onChange={v => set('post_boil_volume_l', v)} placeholder="e.g. 23" />
          <Field label="Actual OG" value={form.actual_og?.toString() ?? ''} onChange={v => set('actual_og', v)} placeholder="e.g. 1.052" />
          <Field label="Pitch temp (°C)" value={form.pitch_temp_c?.toString() ?? ''} onChange={v => set('pitch_temp_c', v)} placeholder="e.g. 18" />
          <Field label="Actual FG" value={form.actual_fg?.toString() ?? ''} onChange={v => set('actual_fg', v)} placeholder="e.g. 1.010" />
          <Field label="Ferm. temp (°C)" value={form.fermentation_temp_c?.toString() ?? ''} onChange={v => set('fermentation_temp_c', v)} placeholder="e.g. 19" />
          <div className="space-y-0.5">
            <span className="text-zinc-400">Rating</span>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setForm(p => ({ ...p, rating: p.rating === n ? undefined : n }))}>
                  <Star size={14} className={n <= (form.rating ?? 0) ? 'text-amber-400' : 'text-zinc-600'} fill={n <= (form.rating ?? 0) ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <label className="block space-y-0.5 text-xs">
          <span className="text-zinc-400">Notes</span>
          <textarea rows={3} value={form.notes as string ?? ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-zinc-100 resize-none text-xs" />
        </label>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-medium rounded disabled:opacity-50">
            <Check size={12} />{isPending ? 'Saving…' : 'Save'}
          </button>
          <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-zinc-200 text-xs">
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs">
        <MeasureRow label="Brew date" value={brew.brew_date ? new Date(brew.brew_date).toLocaleDateString() : undefined} />
        <MeasureRow label="Mash temp" value={brew.mash_temp_c} unit="°C" planned={brew.draft.mash_profile?.steps?.[0]?.temp_c} />
        <MeasureRow label="Mash pH" value={brew.mash_ph} />
        <MeasureRow label="Pre-boil vol" value={brew.pre_boil_volume_l} unit="L" />
        <MeasureRow label="Pre-boil OG" value={brew.pre_boil_og?.toFixed(3)} />
        <MeasureRow label="Pre-boil pH" value={brew.pre_boil_ph} />
        <MeasureRow label="Post-boil vol" value={brew.post_boil_volume_l} unit="L" />
        <MeasureRow label="Actual OG" value={brew.actual_og?.toFixed(3)} planned={brew.planned_og} planFmt={v => v.toFixed(3)} />
        <MeasureRow label="Pitch temp" value={brew.pitch_temp_c} unit="°C" />
        <MeasureRow label="Actual FG" value={brew.actual_fg?.toFixed(3)} planned={brew.planned_fg} planFmt={v => v.toFixed(3)} />
        <MeasureRow label="Ferm. temp" value={brew.fermentation_temp_c} unit="°C" />
        {brew.actual_og && brew.actual_fg && (
          <MeasureRow label="Actual ABV" value={`${((brew.actual_og - brew.actual_fg) * 131.25).toFixed(1)}%`} planned={brew.planned_abv} planFmt={v => `${v.toFixed(1)}%`} />
        )}
      </div>

      {brew.notes && <p className="text-xs text-zinc-300 whitespace-pre-wrap border-t border-zinc-700 pt-2">{brew.notes}</p>}

      {brew.rating && (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={13} className={i < brew.rating! ? 'text-amber-400' : 'text-zinc-600'} fill={i < brew.rating! ? 'currentColor' : 'none'} />
          ))}
        </div>
      )}

      {isOwner && (
        <button onClick={startEdit} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400">
          <Pencil size={11} /> Edit measurements
        </button>
      )}
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <label className="block space-y-0.5">
      <span className="text-zinc-400">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-zinc-800 border border-zinc-600 rounded px-1.5 py-1 text-zinc-100 text-xs placeholder-zinc-600" />
    </label>
  );
}

function MeasureRow({ label, value, unit, planned, planFmt }: {
  label: string;
  value?: string | number;
  unit?: string;
  planned?: number;
  planFmt?: (v: number) => string;
}) {
  if (value === undefined || value === null) return null;
  const display = typeof value === 'number' ? value.toString() : value;
  const hasDiff = planned !== undefined && typeof value === 'number' && Math.abs(value - planned) > 0.001;
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-zinc-500 w-28 flex-shrink-0">{label}</span>
      <span className={`font-medium ${hasDiff ? 'text-amber-300' : 'text-zinc-200'}`}>
        {display}{unit ? ` ${unit}` : ''}
      </span>
      {planned !== undefined && planFmt && (
        <span className="text-zinc-500 text-[10px]">planned {planFmt(planned)}</span>
      )}
    </div>
  );
}

function MeasurePill({ label, value, planned, actual }: {
  label: string; value: string; planned?: number; actual?: number;
}) {
  const off = planned && actual && Math.abs(actual - planned) > 0.002;
  return (
    <span className={`text-[11px] px-1.5 py-0.5 rounded ${off ? 'bg-amber-500/20 text-amber-300' : 'bg-zinc-700 text-zinc-300'}`}>
      {label} {value}
    </span>
  );
}
