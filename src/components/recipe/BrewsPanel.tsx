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

  if (isLoading) return (
    <div className="space-y-2">
      {[...Array(2)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
    </div>
  );

  if (brews.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-xl text-muted-foreground">
        <FlaskConical className="mx-auto mb-2 opacity-30" size={32} />
        <p className="text-sm">No brews logged yet.</p>
        {isOwner && (
          <p className="text-xs mt-1">
            Use <strong className="text-foreground">Start Brew</strong> in the recipe editor to begin a brew session.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {selected.length === 2 && (
        <button
          onClick={handleCompare}
          className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg w-full justify-center transition-colors cursor-pointer"
        >
          <GitCompare size={16} />
          Compare Brew #{brews.find(b => b.id === selected[0])?.brew_number} vs #{brews.find(b => b.id === selected[1])?.brew_number}
        </button>
      )}
      {selected.length === 1 && (
        <p className="text-xs text-muted-foreground text-center py-1">Select one more brew to compare</p>
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
    <div className={`border rounded-lg overflow-hidden transition-colors ${
      isSelected ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20' : 'border-border bg-card'
    }`}>
      {/* Summary row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Compare checkbox */}
        <button
          onClick={onToggleSelect}
          aria-label={isSelected ? 'Deselect for comparison' : 'Select for comparison'}
          className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
            isSelected
              ? 'bg-amber-500 border-amber-500 text-white'
              : 'border-border hover:border-amber-400'
          }`}
        >
          {isSelected && <Check size={10} strokeWidth={3} />}
        </button>

        {/* Brew number badge */}
        <span className="text-xs font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded flex-shrink-0">
          #{brew.brew_number}
        </span>

        {/* Name + notes */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{brew.name || `Brew #${brew.brew_number}`}</p>
          {brew.notes && <p className="text-xs text-muted-foreground truncate">{brew.notes}</p>}
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
            <span className="text-[11px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
              {efficiency}% eff.
            </span>
          )}
          {brew.rating && (
            <span className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: brew.rating }, (_, i) => (
                <Star key={i} size={10} fill="currentColor" />
              ))}
            </span>
          )}
        </div>

        {/* Date */}
        {brew.brew_date && (
          <span className="text-xs text-muted-foreground flex-shrink-0 hidden md:block">
            {new Date(brew.brew_date).toLocaleDateString()}
          </span>
        )}

        <button
          onClick={onToggleExpand}
          aria-label={isExpanded ? 'Collapse brew details' : 'Expand brew details'}
          className="text-muted-foreground hover:text-foreground flex-shrink-0 cursor-pointer"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {isOwner && (
          <button
            onClick={() => deleteBrew({ id: brew.id, recipeId: brew.recipe_id })}
            className="text-muted-foreground/40 hover:text-destructive flex-shrink-0 cursor-pointer transition-colors"
            aria-label="Delete brew"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Expanded: full measurements */}
      {isExpanded && (
        <div className="border-t border-border p-3 bg-muted/20">
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
            <span className="text-muted-foreground">Rating</span>
            <div className="flex items-center gap-1 pt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                  onClick={() => setForm(p => ({ ...p, rating: p.rating === n ? undefined : n }))}
                  className="cursor-pointer"
                >
                  <Star
                    size={14}
                    className={n <= (form.rating ?? 0) ? 'text-amber-400' : 'text-muted-foreground/30'}
                    fill={n <= (form.rating ?? 0) ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
        <label className="block space-y-0.5 text-xs">
          <span className="text-muted-foreground">Notes</span>
          <textarea
            rows={3}
            value={form.notes as string ?? ''}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            className="w-full bg-background border border-input rounded px-2 py-1 text-foreground resize-none text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Check size={12} />{isPending ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground hover:text-foreground text-xs transition-colors cursor-pointer"
          >
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
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
          <MeasureRow
            label="Actual ABV"
            value={`${((brew.actual_og - brew.actual_fg) * 131.25).toFixed(1)}%`}
            planned={brew.planned_abv}
            planFmt={v => `${v.toFixed(1)}%`}
          />
        )}
      </div>

      {brew.notes && (
        <p className="text-xs text-muted-foreground whitespace-pre-wrap border-t border-border pt-2">
          {brew.notes}
        </p>
      )}

      {brew.rating && (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={13}
              className={i < brew.rating! ? 'text-amber-400' : 'text-muted-foreground/20'}
              fill={i < brew.rating! ? 'currentColor' : 'none'}
            />
          ))}
        </div>
      )}

      {isOwner && (
        <button
          onClick={startEdit}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer"
        >
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
      <span className="text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-background border border-input rounded px-1.5 py-1 text-foreground text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
      />
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
      <span className="text-muted-foreground w-24 flex-shrink-0">{label}</span>
      <span className={`font-medium ${hasDiff ? 'text-amber-500' : 'text-foreground'}`}>
        {display}{unit ? ` ${unit}` : ''}
      </span>
      {planned !== undefined && planFmt && (
        <span className="text-muted-foreground/60 text-[10px]">plan: {planFmt(planned)}</span>
      )}
    </div>
  );
}

function MeasurePill({ label, value, planned, actual }: {
  label: string; value: string; planned?: number; actual?: number;
}) {
  const off = planned && actual && Math.abs(actual - planned) > 0.002;
  return (
    <span className={`text-[11px] px-1.5 py-0.5 rounded ${
      off ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-muted text-muted-foreground'
    }`}>
      {label} {value}
    </span>
  );
}
