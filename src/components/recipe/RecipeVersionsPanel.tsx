import { useState } from 'react';
import { ChevronDown, ChevronRight, GitCommitHorizontal, FlaskConical, Star, Trash2, Plus, GitCompare } from 'lucide-react';
import {
  useRecipeVersions,
  useBrewLogs,
  useDeleteVersion,
  useSaveBrewLog,
  useDeleteBrewLog,
} from '@/hooks/useRecipeVersions';
import { useAuthStore } from '@/store/authStore';
import type { RecipeVersion, BrewLog } from '@/types';

interface Props {
  recipeId: string;
  recipeOwnerId: string;
  onCompare: (a: RecipeVersion, b: RecipeVersion) => void;
}

export function RecipeVersionsPanel({ recipeId, recipeOwnerId, onCompare }: Props) {
  const { user } = useAuthStore();
  const isOwner = user?.id === recipeOwnerId;
  const { data: versions = [], isLoading } = useRecipeVersions(recipeId);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string[]>([]);

  const toggleExpand = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    const [a, b] = selected.map(id => versions.find(v => v.id === id)!);
    if (a && b) onCompare(a, b);
  };

  if (isLoading) return <p className="text-sm text-zinc-400 py-4">Loading versions…</p>;

  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-400">
        <GitCommitHorizontal className="mx-auto mb-2 opacity-40" size={32} />
        <p className="text-sm">No versions saved yet.</p>
        {isOwner && (
          <p className="text-xs mt-1">Use <strong>Save Version</strong> in the recipe editor to snapshot this recipe.</p>
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
          Compare v{versions.find(v => v.id === selected[0])?.version_number} vs v{versions.find(v => v.id === selected[1])?.version_number}
        </button>
      )}
      {selected.length === 1 && (
        <p className="text-xs text-zinc-400 text-center">Select one more version to compare</p>
      )}

      {versions.map(version => (
        <VersionRow
          key={version.id}
          version={version}
          isOwner={isOwner}
          isExpanded={expanded.has(version.id)}
          isSelected={selected.includes(version.id)}
          onToggleExpand={() => toggleExpand(version.id)}
          onToggleSelect={() => toggleSelect(version.id)}
        />
      ))}
    </div>
  );
}

// ── Single version row ────────────────────────────────────────────────────────

interface VersionRowProps {
  version: RecipeVersion;
  isOwner: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
}

function VersionRow({ version, isOwner, isExpanded, isSelected, onToggleExpand, onToggleSelect }: VersionRowProps) {
  const { data: logs = [] } = useBrewLogs(isExpanded ? version.id : undefined);
  const { mutate: deleteVersion } = useDeleteVersion();
  const [showLogForm, setShowLogForm] = useState(false);

  const stats = version.stats;

  return (
    <div className={`border rounded-lg overflow-hidden transition-colors ${isSelected ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-700 bg-zinc-800/50'}`}>
      {/* Header row */}
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

        {/* Version badge */}
        <span className="text-xs font-mono bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded flex-shrink-0">
          v{version.version_number}
        </span>

        {/* Name + summary */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-100 truncate">{version.name || `Version ${version.version_number}`}</p>
          {version.changes_summary && (
            <p className="text-xs text-zinc-400 truncate">{version.changes_summary}</p>
          )}
        </div>

        {/* Stats pills */}
        {stats && (
          <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
            {stats.og && <StatPill label="OG" value={stats.og.toFixed(3)} />}
            {stats.ibu && <StatPill label="IBU" value={Math.round(stats.ibu).toString()} />}
            {stats.abv && <StatPill label="ABV" value={`${stats.abv.toFixed(1)}%`} />}
          </div>
        )}

        {/* Date */}
        <span className="text-xs text-zinc-500 flex-shrink-0 hidden md:block">
          {new Date(version.created_at).toLocaleDateString()}
        </span>

        {/* Expand toggle */}
        <button onClick={onToggleExpand} className="text-zinc-400 hover:text-zinc-200 flex-shrink-0">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Delete (owner only) */}
        {isOwner && (
          <button
            onClick={() => deleteVersion({ id: version.id, recipeId: version.recipe_id })}
            className="text-zinc-600 hover:text-red-400 flex-shrink-0"
            title="Delete version"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Expanded: brew logs */}
      {isExpanded && (
        <div className="border-t border-zinc-700 px-3 py-2 space-y-2">
          {logs.length === 0 && !showLogForm && (
            <p className="text-xs text-zinc-500 italic">No brew logs for this version yet.</p>
          )}
          {logs.map(log => (
            <BrewLogRow key={log.id} log={log} isOwner={isOwner} />
          ))}
          {isOwner && !showLogForm && (
            <button
              onClick={() => setShowLogForm(true)}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
            >
              <Plus size={12} /> Log a brew
            </button>
          )}
          {isOwner && showLogForm && (
            <BrewLogForm
              versionId={version.id}
              onDone={() => setShowLogForm(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Brew log row ──────────────────────────────────────────────────────────────

function BrewLogRow({ log, isOwner }: { log: BrewLog; isOwner: boolean }) {
  const { mutate: deleteLog } = useDeleteBrewLog();

  return (
    <div className="bg-zinc-900/60 rounded p-2 text-xs space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-zinc-300">
            <FlaskConical size={11} />
            {log.brew_date ? new Date(log.brew_date).toLocaleDateString() : 'Undated brew'}
          </span>
          {log.actual_og && <span className="text-zinc-400">OG: <strong className="text-zinc-200">{log.actual_og.toFixed(3)}</strong></span>}
          {log.actual_fg && <span className="text-zinc-400">FG: <strong className="text-zinc-200">{log.actual_fg.toFixed(3)}</strong></span>}
          {log.actual_og && log.actual_fg && (
            <span className="text-zinc-400">
              ABV: <strong className="text-zinc-200">
                {(((log.actual_og - log.actual_fg) * 131.25)).toFixed(1)}%
              </strong>
            </span>
          )}
          {log.rating && (
            <span className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={10} fill={i < log.rating! ? 'currentColor' : 'none'} />
              ))}
            </span>
          )}
        </div>
        {isOwner && (
          <button
            onClick={() => deleteLog({ id: log.id, versionId: log.recipe_version_id })}
            className="text-zinc-600 hover:text-red-400 flex-shrink-0"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
      {log.notes && <p className="text-zinc-300 whitespace-pre-wrap">{log.notes}</p>}
    </div>
  );
}

// ── Brew log form ─────────────────────────────────────────────────────────────

function BrewLogForm({ versionId, onDone }: { versionId: string; onDone: () => void }) {
  const { mutate: saveLog, isPending } = useSaveBrewLog();
  const [brewDate, setBrewDate] = useState('');
  const [actualOg, setActualOg] = useState('');
  const [actualFg, setActualFg] = useState('');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveLog({
      recipe_version_id: versionId,
      brew_date: brewDate || undefined,
      actual_og: actualOg ? parseFloat(actualOg) : undefined,
      actual_fg: actualFg ? parseFloat(actualFg) : undefined,
      rating: rating || undefined,
      notes,
    }, { onSuccess: onDone });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900/60 rounded p-2 space-y-2 text-xs">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="space-y-0.5">
          <span className="text-zinc-400">Brew date</span>
          <input type="date" value={brewDate} onChange={e => setBrewDate(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-1.5 py-1 text-zinc-100" />
        </label>
        <label className="space-y-0.5">
          <span className="text-zinc-400">Actual OG</span>
          <input type="number" step="0.001" min="1" max="1.2" placeholder="1.050"
            value={actualOg} onChange={e => setActualOg(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-1.5 py-1 text-zinc-100" />
        </label>
        <label className="space-y-0.5">
          <span className="text-zinc-400">Actual FG</span>
          <input type="number" step="0.001" min="1" max="1.2" placeholder="1.010"
            value={actualFg} onChange={e => setActualFg(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-600 rounded px-1.5 py-1 text-zinc-100" />
        </label>
        <label className="space-y-0.5">
          <span className="text-zinc-400">Rating</span>
          <div className="flex items-center gap-1 pt-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => setRating(rating === n ? 0 : n)}>
                <Star size={14} className={n <= rating ? 'text-amber-400' : 'text-zinc-600'}
                  fill={n <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </label>
      </div>
      <label className="block space-y-0.5">
        <span className="text-zinc-400">Notes</span>
        <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="What went well? What would you change next time?"
          className="w-full bg-zinc-800 border border-zinc-600 rounded px-1.5 py-1 text-zinc-100 resize-none" />
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={isPending}
          className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded disabled:opacity-50">
          {isPending ? 'Saving…' : 'Save log'}
        </button>
        <button type="button" onClick={onDone} className="px-2 py-1 text-zinc-400 hover:text-zinc-200">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-[11px] bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded">
      {label} {value}
    </span>
  );
}
