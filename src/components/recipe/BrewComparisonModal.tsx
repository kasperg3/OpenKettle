import { X, TrendingUp, TrendingDown } from 'lucide-react';
import type { Brew } from '@/types';
import type { RecipeFermentable, RecipeHop, RecipeYeast } from '@/types';

interface Props {
  a: Brew;
  b: Brew;
  onClose: () => void;
}

export function BrewComparisonModal({ a, b, onClose }: Props) {
  // Always show older brew on left
  const [left, right] = a.brew_number < b.brew_number ? [a, b] : [b, a];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto p-4">
      <div className="w-full max-w-5xl bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-700">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Brew Comparison</h2>
            <p className="text-sm text-zinc-400">
              #{left.brew_number} "{left.name}" → #{right.brew_number} "{right.name}"
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-6">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_1fr] gap-4">
            <BrewHeader brew={left} />
            <BrewHeader brew={right} />
          </div>

          {/* Measurements comparison */}
          <Section title="Measurements — Planned vs Actual">
            <MeasurementsComparison left={left} right={right} />
          </Section>

          {/* Recipe diff sections */}
          <Section title="Fermentables">
            <FermentablesDiff left={left.draft.fermentables} right={right.draft.fermentables} />
          </Section>

          <Section title="Hops">
            <HopsDiff left={left.draft.hops} right={right.draft.hops} />
          </Section>

          <Section title="Yeast">
            <YeastDiff left={left.draft.yeasts} right={right.draft.yeasts} />
          </Section>

          {(left.draft.mash_profile || right.draft.mash_profile) && (
            <Section title="Mash Profile">
              <MashDiff left={left} right={right} />
            </Section>
          )}

          {(left.draft.recipe_notes || right.draft.recipe_notes) && (
            <Section title="Recipe Notes">
              <NotesDiff left={left.draft.recipe_notes} right={right.draft.recipe_notes} />
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Brew header ───────────────────────────────────────────────────────────────

function BrewHeader({ brew }: { brew: Brew }) {
  return (
    <div className="bg-zinc-800 rounded-lg p-3 space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded">#{brew.brew_number}</span>
        <span className="font-medium text-zinc-100 text-sm">{brew.name}</span>
      </div>
      {brew.brew_date && <p className="text-xs text-zinc-400">{new Date(brew.brew_date).toLocaleDateString()}</p>}
      {brew.notes && <p className="text-xs text-zinc-300 italic">"{brew.notes}"</p>}
    </div>
  );
}

// ── Measurements comparison ───────────────────────────────────────────────────

type MeasureKey = {
  label: string;
  planned: (b: Brew) => number | undefined;
  actual: (b: Brew) => number | undefined;
  fmt: (v: number) => string;
};

const MEASURE_ROWS: MeasureKey[] = [
  { label: 'OG',          planned: b => b.planned_og,  actual: b => b.actual_og,  fmt: v => v.toFixed(3) },
  { label: 'FG',          planned: b => b.planned_fg,  actual: b => b.actual_fg,  fmt: v => v.toFixed(3) },
  { label: 'ABV',         planned: b => b.planned_abv, actual: b => b.actual_og && b.actual_fg ? (b.actual_og - b.actual_fg) * 131.25 : undefined, fmt: v => `${v.toFixed(1)}%` },
  { label: 'Mash temp',   planned: b => b.draft.mash_profile?.steps?.[0]?.temp_c, actual: b => b.mash_temp_c, fmt: v => `${v}°C` },
  { label: 'Mash pH',     planned: () => undefined,    actual: b => b.mash_ph,    fmt: v => v.toFixed(2) },
  { label: 'Pre-boil OG', planned: () => undefined,    actual: b => b.pre_boil_og, fmt: v => v.toFixed(3) },
  { label: 'Pre-boil pH', planned: () => undefined,    actual: b => b.pre_boil_ph, fmt: v => v.toFixed(2) },
  { label: 'Post-boil vol', planned: b => b.draft.equipment_profile?.batch_size_l, actual: b => b.post_boil_volume_l, fmt: v => `${v} L` },
  { label: 'Pitch temp',  planned: () => undefined,    actual: b => b.pitch_temp_c, fmt: v => `${v}°C` },
  { label: 'Ferm. temp',  planned: () => undefined,    actual: b => b.fermentation_temp_c, fmt: v => `${v}°C` },
];

function MeasurementsComparison({ left, right }: { left: Brew; right: Brew }) {
  const rows = MEASURE_ROWS.filter(r => r.actual(left) !== undefined || r.actual(right) !== undefined);
  if (rows.length === 0) return <p className="text-xs text-zinc-500 p-3 italic">No measurements recorded yet.</p>;

  return (
    <div className="divide-y divide-zinc-700 text-sm">
      {/* Sub-header */}
      <div className="grid grid-cols-[auto_1fr_1fr] text-[11px] text-zinc-500 uppercase tracking-wide">
        <span className="px-3 py-1.5 w-28" />
        <span className="px-3 py-1.5 border-l border-zinc-700">#{left.brew_number}</span>
        <span className="px-3 py-1.5 border-l border-zinc-700">#{right.brew_number}</span>
      </div>
      {rows.map(row => {
        const lp = row.planned(left);
        const la = row.actual(left);
        const rp = row.planned(right);
        const ra = row.actual(right);
        const crossDiff = la !== undefined && ra !== undefined && Math.abs(la - ra) > 0.001;
        return (
          <div key={row.label} className={`grid grid-cols-[auto_1fr_1fr] ${crossDiff ? 'bg-amber-500/5' : ''}`}>
            <span className="text-zinc-400 px-3 py-2 font-medium text-xs w-28">{row.label}</span>
            <div className="px-3 py-2 border-l border-zinc-700">
              <ActualWithPlanned actual={la} planned={lp} fmt={row.fmt} />
            </div>
            <div className="px-3 py-2 border-l border-zinc-700 flex items-center gap-2">
              <ActualWithPlanned actual={ra} planned={rp} fmt={row.fmt} />
              {crossDiff && la !== undefined && ra !== undefined && (
                <CrossDelta lv={la} rv={ra} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActualWithPlanned({ actual, planned, fmt }: { actual?: number; planned?: number; fmt: (v: number) => string }) {
  if (actual === undefined) return <span className="text-zinc-600">—</span>;
  const off = planned !== undefined && Math.abs(actual - planned) > 0.001;
  return (
    <span className="flex flex-col">
      <span className={off ? 'text-amber-300' : 'text-zinc-200'}>{fmt(actual)}</span>
      {planned !== undefined && (
        <span className="text-[10px] text-zinc-500">plan: {fmt(planned)}</span>
      )}
    </span>
  );
}

function CrossDelta({ lv, rv }: { lv: number; rv: number }) {
  const diff = rv - lv;
  if (Math.abs(diff) < 0.001) return null;
  const Icon = diff > 0 ? TrendingUp : TrendingDown;
  const sign = diff > 0 ? '+' : '';
  return (
    <span className={`text-[10px] flex items-center gap-0.5 ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
      <Icon size={10} />{sign}{Math.abs(diff) > 1 ? Math.round(diff) : diff.toFixed(3)}
    </span>
  );
}

// ── Recipe diffs ──────────────────────────────────────────────────────────────

function FermentablesDiff({ left, right }: { left: RecipeFermentable[]; right: RecipeFermentable[] }) {
  const allNames = unique([...left, ...right], f => f.name);
  return (
    <TwoColTable leftHeader="Left brew" rightHeader="Right brew">
      {allNames.map(name => {
        const l = left.find(f => f.name === name);
        const r = right.find(f => f.name === name);
        const status = !l ? 'added' : !r ? 'removed' : l.amount_kg !== r.amount_kg ? 'changed' : 'same';
        return (
          <Row key={name} status={status}>
            <Cell>{l ? <>{l.name} <Dim>{l.amount_kg.toFixed(2)} kg</Dim></> : null}</Cell>
            <Cell>{r ? <>{r.name} <Dim>{r.amount_kg.toFixed(2)} kg</Dim></> : null}</Cell>
          </Row>
        );
      })}
    </TwoColTable>
  );
}

function HopsDiff({ left, right }: { left: RecipeHop[]; right: RecipeHop[] }) {
  const key = (h: RecipeHop) => `${h.name}__${h.use}`;
  const allKeys = unique([...left, ...right], key);
  return (
    <TwoColTable leftHeader="Left brew" rightHeader="Right brew">
      {allKeys.map(k => {
        const l = left.find(h => key(h) === k);
        const r = right.find(h => key(h) === k);
        const status = !l ? 'added' : !r ? 'removed'
          : (l.amount_g !== r.amount_g || l.alpha_acid !== r.alpha_acid || l.time_min !== r.time_min) ? 'changed' : 'same';
        return (
          <Row key={k} status={status}>
            <Cell>{l ? <>{l.name} <Dim>{l.amount_g}g · {l.alpha_acid}% AA · {l.time_min}min · {l.use}</Dim></> : null}</Cell>
            <Cell>{r ? <>{r.name} <Dim>{r.amount_g}g · {r.alpha_acid}% AA · {r.time_min}min · {r.use}</Dim></> : null}</Cell>
          </Row>
        );
      })}
    </TwoColTable>
  );
}

function YeastDiff({ left, right }: { left: RecipeYeast[]; right: RecipeYeast[] }) {
  const allNames = unique([...left, ...right], y => y.name);
  return (
    <TwoColTable leftHeader="Left brew" rightHeader="Right brew">
      {allKeys(allNames).map(name => {
        const l = left.find(y => y.name === name);
        const r = right.find(y => y.name === name);
        return (
          <Row key={name} status={!l ? 'added' : !r ? 'removed' : 'same'}>
            <Cell>{l ? <>{l.name} <Dim>{l.avg_attenuation}% att.</Dim></> : null}</Cell>
            <Cell>{r ? <>{r.name} <Dim>{r.avg_attenuation}% att.</Dim></> : null}</Cell>
          </Row>
        );
      })}
    </TwoColTable>
  );
}

function MashDiff({ left, right }: { left: Brew; right: Brew }) {
  const ls = left.draft.mash_profile?.steps ?? [];
  const rs = right.draft.mash_profile?.steps ?? [];
  const maxLen = Math.max(ls.length, rs.length);
  if (maxLen === 0) return <p className="text-xs text-zinc-500 p-3">No mash steps.</p>;
  return (
    <TwoColTable leftHeader={`#${left.brew_number} planned`} rightHeader={`#${right.brew_number} planned`}>
      {Array.from({ length: maxLen }, (_, i) => {
        const l = ls[i];
        const r = rs[i];
        const changed = l && r && (l.temp_c !== r.temp_c || l.time_min !== r.time_min);
        return (
          <Row key={i} status={changed ? 'changed' : 'same'}>
            <Cell>{l ? <>{l.name ?? `Step ${i + 1}`} <Dim>{l.temp_c}°C · {l.time_min}min</Dim></> : null}</Cell>
            <Cell changed={changed}>
              {r ? <>{r.name ?? `Step ${i + 1}`} <Dim changed={changed}>{r.temp_c}°C · {r.time_min}min</Dim></> : null}
            </Cell>
          </Row>
        );
      })}
    </TwoColTable>
  );
}

function NotesDiff({ left, right }: { left?: string; right?: string }) {
  const changed = (left ?? '') !== (right ?? '');
  return (
    <div className={`grid grid-cols-[1fr_1fr] text-sm divide-x divide-zinc-700 ${changed ? 'bg-amber-500/5' : ''}`}>
      <p className="px-3 py-2 text-zinc-300 whitespace-pre-wrap text-xs">{left || <span className="text-zinc-600 italic">None</span>}</p>
      <p className={`px-3 py-2 whitespace-pre-wrap text-xs ${changed ? 'text-amber-300' : 'text-zinc-300'}`}>{right || <span className="text-zinc-600 italic">None</span>}</p>
    </div>
  );
}

// ── Layout primitives ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{title}</h3>
      <div className="border border-zinc-700 rounded-lg overflow-hidden">{children}</div>
    </div>
  );
}

function TwoColTable({ leftHeader, rightHeader, children }: { leftHeader: string; rightHeader: string; children: React.ReactNode }) {
  return (
    <div className="divide-y divide-zinc-700">
      <div className="grid grid-cols-[1fr_1fr] text-[11px] text-zinc-500 uppercase tracking-wide">
        <span className="px-3 py-1.5 border-r border-zinc-700">{leftHeader}</span>
        <span className="px-3 py-1.5">{rightHeader}</span>
      </div>
      {children}
    </div>
  );
}

type DiffStatus = 'added' | 'removed' | 'changed' | 'same';

function Row({ status, children }: { status: DiffStatus; children: React.ReactNode }) {
  const bg = status === 'added' ? 'bg-green-500/10' : status === 'removed' ? 'bg-red-500/10' : status === 'changed' ? 'bg-amber-500/5' : '';
  return <div className={`grid grid-cols-[1fr_1fr] text-sm ${bg}`}>{children}</div>;
}

function Cell({ children, changed }: { children?: React.ReactNode; changed?: boolean }) {
  return (
    <div className={`px-3 py-2 border-r last:border-r-0 border-zinc-700 ${changed ? 'text-amber-300' : 'text-zinc-200'}`}>
      {children ?? <span className="text-zinc-600 italic">—</span>}
    </div>
  );
}

function Dim({ children, changed }: { children: React.ReactNode; changed?: boolean }) {
  return <span className={`text-xs ml-1 ${changed ? 'text-amber-400/70' : 'text-zinc-400'}`}>{children}</span>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function unique<T>(arr: T[], keyFn: (item: T) => string): string[] {
  const seen = new Set<string>();
  return arr.reduce<string[]>((acc, item) => {
    const k = keyFn(item);
    if (!seen.has(k)) { seen.add(k); acc.push(k); }
    return acc;
  }, []);
}

// identity helper so yeast diff compiles without extra variable
function allKeys(arr: string[]) { return arr; }
