import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { RecipeVersion, RecipeStats } from '@/types';
import type { RecipeFermentable, RecipeHop, RecipeYeast } from '@/types';
import type { MashProfileSnapshot, EquipmentProfileSnapshot } from '@/types';

interface Props {
  a: RecipeVersion;
  b: RecipeVersion;
  onClose: () => void;
}

export function VersionComparisonModal({ a, b: bVersion, onClose }: Props) {
  // Always show older version on the left
  const [left, right] = a.version_number < bVersion.version_number
    ? [a, bVersion]
    : [bVersion, a];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto p-4">
      <div className="w-full max-w-5xl bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-700">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Version Comparison</h2>
            <p className="text-sm text-zinc-400">
              v{left.version_number} "{left.name}" → v{right.version_number} "{right.name}"
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_1fr] gap-4">
            <VersionHeader version={left} />
            <VersionHeader version={right} />
          </div>

          {/* Stats diff */}
          <Section title="Calculated Stats">
            <StatsDiff left={left.stats} right={right.stats} />
          </Section>

          {/* Fermentables diff */}
          <Section title="Fermentables">
            <FermentablesDiff
              left={left.draft.fermentables}
              right={right.draft.fermentables}
            />
          </Section>

          {/* Hops diff */}
          <Section title="Hops">
            <HopsDiff left={left.draft.hops} right={right.draft.hops} />
          </Section>

          {/* Yeast diff */}
          <Section title="Yeast">
            <YeastDiff left={left.draft.yeasts} right={right.draft.yeasts} />
          </Section>

          {/* Mash diff */}
          {(left.draft.mash_profile || right.draft.mash_profile) && (
            <Section title="Mash Profile">
              <MashDiff
                left={left.draft.mash_profile}
                right={right.draft.mash_profile}
              />
            </Section>
          )}

          {/* Equipment diff */}
          {(left.draft.equipment_profile || right.draft.equipment_profile) && (
            <Section title="Equipment / Batch">
              <EquipmentDiff
                left={left.draft.equipment_profile}
                right={right.draft.equipment_profile}
              />
            </Section>
          )}

          {/* Notes diff */}
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

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{title}</h3>
      <div className="border border-zinc-700 rounded-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function VersionHeader({ version }: { version: RecipeVersion }) {
  return (
    <div className="bg-zinc-800 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-mono bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded">
          v{version.version_number}
        </span>
        <span className="font-medium text-zinc-100 text-sm">{version.name}</span>
      </div>
      <p className="text-xs text-zinc-400">{new Date(version.created_at).toLocaleDateString()}</p>
      {version.changes_summary && (
        <p className="text-xs text-zinc-300 mt-1 italic">"{version.changes_summary}"</p>
      )}
    </div>
  );
}

// ── Stats diff ────────────────────────────────────────────────────────────────

function StatsDiff({ left, right }: { left?: RecipeStats; right?: RecipeStats }) {
  const rows: Array<{ label: string; key: keyof RecipeStats; fmt: (v: number) => string }> = [
    { label: 'OG',  key: 'og',  fmt: v => v.toFixed(3) },
    { label: 'FG',  key: 'fg',  fmt: v => v.toFixed(3) },
    { label: 'ABV', key: 'abv', fmt: v => `${v.toFixed(1)}%` },
    { label: 'IBU', key: 'ibu', fmt: v => Math.round(v).toString() },
    { label: 'SRM', key: 'srm', fmt: v => v.toFixed(1) },
    { label: 'EBC', key: 'ebc', fmt: v => v.toFixed(1) },
  ];

  return (
    <div className="grid grid-cols-[auto_1fr_1fr] text-sm divide-y divide-zinc-700">
      {rows.map(({ label, key, fmt }) => {
        const lv = left?.[key];
        const rv = right?.[key];
        const changed = lv !== undefined && rv !== undefined && Math.abs((lv as number) - (rv as number)) > 0.001;
        return (
          <div key={key} className="contents">
            <span className="text-zinc-400 px-3 py-2 font-medium text-xs">{label}</span>
            <span className="px-3 py-2 text-zinc-300 border-l border-zinc-700">
              {lv !== undefined ? fmt(lv as number) : <span className="text-zinc-600">—</span>}
            </span>
            <span className={`px-3 py-2 border-l border-zinc-700 flex items-center gap-1 ${changed ? 'text-amber-400' : 'text-zinc-300'}`}>
              {rv !== undefined ? fmt(rv as number) : <span className="text-zinc-600">—</span>}
              {changed && lv !== undefined && rv !== undefined && (
                <Delta lv={lv as number} rv={rv as number} />
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Delta({ lv, rv }: { lv: number; rv: number }) {
  const diff = rv - lv;
  if (Math.abs(diff) < 0.001) return null;
  const sign = diff > 0 ? '+' : '';
  const Icon = diff > 0 ? TrendingUp : TrendingDown;
  return (
    <span className={`text-[10px] flex items-center gap-0.5 ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
      <Icon size={10} />{sign}{diff > 1 ? Math.round(diff) : diff.toFixed(3)}
    </span>
  );
}

// ── Fermentables diff ─────────────────────────────────────────────────────────

function FermentablesDiff({ left, right }: { left: RecipeFermentable[]; right: RecipeFermentable[] }) {
  const allNames = uniqueBy([...left, ...right], f => f.name);

  return (
    <div className="divide-y divide-zinc-700">
      <div className="grid grid-cols-[1fr_1fr] text-[11px] text-zinc-500 uppercase tracking-wide">
        <span className="px-3 py-1.5 border-r border-zinc-700">v (left)</span>
        <span className="px-3 py-1.5">v (right)</span>
      </div>
      {allNames.map(name => {
        const l = left.find(f => f.name === name);
        const r = right.find(f => f.name === name);
        const status = !l ? 'added' : !r ? 'removed' : l.amount_kg !== r.amount_kg ? 'changed' : 'same';
        return (
          <div key={name} className={`grid grid-cols-[1fr_1fr] text-sm ${rowColor(status)}`}>
            <div className="px-3 py-2 border-r border-zinc-700">
              {l ? (
                <span>{l.name} <span className="text-zinc-400 text-xs">{l.amount_kg.toFixed(2)} kg</span></span>
              ) : <span className="text-zinc-600 italic">—</span>}
            </div>
            <div className="px-3 py-2">
              {r ? (
                <span>{r.name} <span className="text-zinc-400 text-xs">{r.amount_kg.toFixed(2)} kg</span></span>
              ) : <span className="text-zinc-600 italic">—</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Hops diff ─────────────────────────────────────────────────────────────────

function HopsDiff({ left, right }: { left: RecipeHop[]; right: RecipeHop[] }) {
  const key = (h: RecipeHop) => `${h.name}__${h.use}`;
  const allKeys = uniqueBy([...left, ...right], key);

  return (
    <div className="divide-y divide-zinc-700">
      <div className="grid grid-cols-[1fr_1fr] text-[11px] text-zinc-500 uppercase tracking-wide">
        <span className="px-3 py-1.5 border-r border-zinc-700">v (left)</span>
        <span className="px-3 py-1.5">v (right)</span>
      </div>
      {allKeys.map(k => {
        const l = left.find(h => key(h) === k);
        const r = right.find(h => key(h) === k);
        const status = !l ? 'added' : !r ? 'removed'
          : (l.amount_g !== r.amount_g || l.alpha_acid !== r.alpha_acid || l.time_min !== r.time_min) ? 'changed' : 'same';
        return (
          <div key={k} className={`grid grid-cols-[1fr_1fr] text-sm ${rowColor(status)}`}>
            <div className="px-3 py-2 border-r border-zinc-700">
              {l ? <HopCell hop={l} /> : <span className="text-zinc-600 italic">—</span>}
            </div>
            <div className="px-3 py-2">
              {r ? <HopCell hop={r} /> : <span className="text-zinc-600 italic">—</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HopCell({ hop }: { hop: RecipeHop }) {
  return (
    <span>
      {hop.name}{' '}
      <span className="text-zinc-400 text-xs">
        {hop.amount_g}g · {hop.alpha_acid}% AA · {hop.time_min}min · {hop.use}
      </span>
    </span>
  );
}

// ── Yeast diff ────────────────────────────────────────────────────────────────

function YeastDiff({ left, right }: { left: RecipeYeast[]; right: RecipeYeast[] }) {
  const allNames = uniqueBy([...left, ...right], y => y.name);

  return (
    <div className="divide-y divide-zinc-700">
      <div className="grid grid-cols-[1fr_1fr] text-[11px] text-zinc-500 uppercase tracking-wide">
        <span className="px-3 py-1.5 border-r border-zinc-700">v (left)</span>
        <span className="px-3 py-1.5">v (right)</span>
      </div>
      {allNames.map(name => {
        const l = left.find(y => y.name === name);
        const r = right.find(y => y.name === name);
        const status = !l ? 'added' : !r ? 'removed' : 'same';
        return (
          <div key={name} className={`grid grid-cols-[1fr_1fr] text-sm ${rowColor(status)}`}>
            <div className="px-3 py-2 border-r border-zinc-700">
              {l ? <span>{l.name} <span className="text-zinc-400 text-xs">{l.avg_attenuation}% att.</span></span>
                 : <span className="text-zinc-600 italic">—</span>}
            </div>
            <div className="px-3 py-2">
              {r ? <span>{r.name} <span className="text-zinc-400 text-xs">{r.avg_attenuation}% att.</span></span>
                 : <span className="text-zinc-600 italic">—</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Mash diff ─────────────────────────────────────────────────────────────────

function MashDiff({ left, right }: { left?: MashProfileSnapshot; right?: MashProfileSnapshot }) {
  const leftSteps = left?.steps ?? [];
  const rightSteps = right?.steps ?? [];
  const maxLen = Math.max(leftSteps.length, rightSteps.length);

  if (maxLen === 0) return <p className="text-xs text-zinc-500 p-3">No mash steps defined.</p>;

  return (
    <div className="divide-y divide-zinc-700">
      <div className="grid grid-cols-[1fr_1fr] text-[11px] text-zinc-500 uppercase tracking-wide">
        <span className="px-3 py-1.5 border-r border-zinc-700">v (left)</span>
        <span className="px-3 py-1.5">v (right)</span>
      </div>
      {Array.from({ length: maxLen }, (_, i) => {
        const l = leftSteps[i];
        const r = rightSteps[i];
        const changed = l && r && (l.temp_c !== r.temp_c || l.time_min !== r.time_min);
        return (
          <div key={i} className={`grid grid-cols-[1fr_1fr] text-sm ${changed ? 'bg-amber-500/5' : ''}`}>
            <div className="px-3 py-2 border-r border-zinc-700">
              {l ? <span>{l.name ?? `Step ${i + 1}`} <span className="text-zinc-400 text-xs">{l.temp_c}°C · {l.time_min}min</span></span>
                 : <span className="text-zinc-600 italic">—</span>}
            </div>
            <div className="px-3 py-2">
              {r ? <span>{r.name ?? `Step ${i + 1}`} <span className={`text-xs ${changed ? 'text-amber-400' : 'text-zinc-400'}`}>{r.temp_c}°C · {r.time_min}min</span></span>
                 : <span className="text-zinc-600 italic">—</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Equipment diff ────────────────────────────────────────────────────────────

function EquipmentDiff({ left, right }: { left?: EquipmentProfileSnapshot; right?: EquipmentProfileSnapshot }) {
  type Row = { label: string; lv: string; rv: string; changed: boolean };
  const rows: Row[] = [
    {
      label: 'Batch size',
      lv: left?.batch_size_l != null ? `${left.batch_size_l} L` : '—',
      rv: right?.batch_size_l != null ? `${right.batch_size_l} L` : '—',
      changed: left?.batch_size_l !== right?.batch_size_l,
    },
    {
      label: 'Boil time',
      lv: left?.boil_time_min != null ? `${left.boil_time_min} min` : '—',
      rv: right?.boil_time_min != null ? `${right.boil_time_min} min` : '—',
      changed: left?.boil_time_min !== right?.boil_time_min,
    },
  ];

  return (
    <div className="divide-y divide-zinc-700">
      {rows.map(row => (
        <div key={row.label} className={`grid grid-cols-[auto_1fr_1fr] text-sm ${row.changed ? 'bg-amber-500/5' : ''}`}>
          <span className="text-zinc-400 px-3 py-2 font-medium text-xs">{row.label}</span>
          <span className="px-3 py-2 text-zinc-300 border-l border-zinc-700">{row.lv}</span>
          <span className={`px-3 py-2 border-l border-zinc-700 ${row.changed ? 'text-amber-400' : 'text-zinc-300'}`}>{row.rv}</span>
        </div>
      ))}
    </div>
  );
}

// ── Notes diff ────────────────────────────────────────────────────────────────

function NotesDiff({ left, right }: { left?: string; right?: string }) {
  const changed = (left ?? '') !== (right ?? '');
  return (
    <div className={`grid grid-cols-[1fr_1fr] text-sm divide-x divide-zinc-700 ${changed ? 'bg-amber-500/5' : ''}`}>
      <p className="px-3 py-2 text-zinc-300 whitespace-pre-wrap text-xs">{left || <span className="text-zinc-600 italic">None</span>}</p>
      <p className={`px-3 py-2 whitespace-pre-wrap text-xs ${changed ? 'text-amber-300' : 'text-zinc-300'}`}>{right || <span className="text-zinc-600 italic">None</span>}</p>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function uniqueBy<T>(arr: T[], key: (item: T) => string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of arr) {
    const k = key(item);
    if (!seen.has(k)) { seen.add(k); result.push(k); }
  }
  return result;
}

type DiffStatus = 'added' | 'removed' | 'changed' | 'same';

function rowColor(status: DiffStatus): string {
  switch (status) {
    case 'added':   return 'bg-green-500/10 text-green-300';
    case 'removed': return 'bg-red-500/10 text-red-300';
    case 'changed': return 'bg-amber-500/5';
    default:        return '';
  }
}
