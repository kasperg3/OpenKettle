import * as Tabs from '@radix-ui/react-tabs';
import { Link } from 'react-router-dom';
import { Save, CheckCircle, Loader2, AlertCircle, FlaskConical, X } from 'lucide-react';
import { useState } from 'react';
import { RecipeHeader } from './RecipeHeader';
import { StatsPanel } from './StatsPanel';
import { FermentablesTab } from './FermentablesTab';
import { HopsTab } from './HopsTab';
import { YeastTab } from './YeastTab';
import { MiscTab } from './MiscTab';
import { MashTab } from './MashTab';
import { FermentationTab } from './FermentationTab';
import { WaterTab } from './WaterTab';
import { EquipmentTab } from './EquipmentTab';
import { NotesTab } from './NotesTab';
import { useRecipeStore } from '@/store/recipeStore';
import { useAuthStore } from '@/store/authStore';
import { useSaveRecipe } from '@/hooks/useRecipes';
import { useStartBrew } from '@/hooks/useBrews';
import { useCalculations } from '@/hooks/useCalculations';
import { cn } from '@/lib/utils';
import type { RecipeDraft } from '@/types';

const TABS = [
  { id: 'fermentables', label: 'Fermentables' },
  { id: 'hops',         label: 'Hops' },
  { id: 'yeast',        label: 'Yeast' },
  { id: 'misc',         label: 'Misc' },
  { id: 'mash',         label: 'Mash' },
  { id: 'fermentation', label: 'Fermentation' },
  { id: 'water',        label: 'Water' },
  { id: 'equipment',    label: 'Equipment' },
  { id: 'notes',        label: 'Notes' },
];

export function RecipeEditor({ onSaved }: { onSaved?: (id: string) => void }) {
  const { draft, isDirty, isSaving, lastSaved, setDraft, setIsSaving, markSaved } = useRecipeStore();
  const user = useAuthStore((s) => s.user);
  const { mutateAsync: saveRecipe } = useSaveRecipe();
  const { mutateAsync: startBrew, isPending: isStartingBrew } = useStartBrew();
  const stats = useCalculations();
  const [showBrewModal, setShowBrewModal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    if (!user || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const saved = await saveRecipe({
        draft,
        stats: { og: stats.og, fg: stats.fg, abv: stats.abv, ibu: stats.ibu, srm: stats.srm, ebc: stats.ebc },
      });
      setDraft({ ...draft, id: saved.id });
      markSaved();
      onSaved?.(saved.id);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveError(err instanceof Error ? err.message : 'Save failed. Check your Supabase connection.');
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <RecipeHeader />
      <StatsPanel />

      {/* Save bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b text-sm gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          {isSaving && <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</>}
          {!isSaving && saveError && <><AlertCircle className="h-3.5 w-3.5 text-destructive" /> <span className="text-destructive text-xs truncate max-w-xs">{saveError}</span></>}
          {!isSaving && !saveError && isDirty && <><AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Unsaved changes</>}
          {!isSaving && !saveError && !isDirty && lastSaved && <><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Saved {lastSaved.toLocaleTimeString()}</>}
        </div>
        {user ? (
          <div className="flex items-center gap-2">
            {/* Start Brew — only once recipe has been saved */}
            {draft.id && (
              <button
                onClick={() => setShowBrewModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded font-medium border border-zinc-600 text-zinc-300 hover:border-amber-500 hover:text-amber-400 transition-colors"
                title="Snapshot this recipe and start logging a brew session"
              >
                <FlaskConical className="h-3.5 w-3.5" />
                Start Brew
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className={cn(
                'flex items-center gap-1.5 px-4 py-1.5 text-sm rounded font-medium transition-colors',
                isDirty && !isSaving
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving ? 'Saving...' : 'Save Recipe'}
            </button>
          </div>
        ) : (
          <Link to="/login" className="text-xs text-amber-600 hover:underline">Sign in to save</Link>
        )}
      </div>

      {/* Start Brew modal */}
      {showBrewModal && draft.id && (
        <StartBrewModal
          draft={draft}
          stats={{ og: stats.og, fg: stats.fg, abv: stats.abv, ibu: stats.ibu, srm: stats.srm, ebc: stats.ebc }}
          isSaving={isStartingBrew}
          onStart={async (name, notes, brewDate) => {
            await startBrew({
              recipe_id: draft.id!,
              name,
              notes,
              draft,
              brew_date: brewDate || undefined,
              planned_og: stats.og,
              planned_fg: stats.fg,
              planned_abv: stats.abv,
              planned_ibu: stats.ibu,
              planned_srm: stats.srm,
              planned_ebc: stats.ebc,
            });
            setShowBrewModal(false);
          }}
          onClose={() => setShowBrewModal(false)}
        />
      )}

      <Tabs.Root defaultValue="fermentables" className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Tabs.List className="flex border-b overflow-x-auto bg-card px-4 gap-0.5 flex-shrink-0">
          {TABS.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              className="px-3 py-2.5 text-sm whitespace-nowrap text-muted-foreground border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:text-foreground hover:text-foreground transition-colors"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="flex-1 overflow-y-auto">
          <Tabs.Content value="fermentables"><FermentablesTab /></Tabs.Content>
          <Tabs.Content value="hops"><HopsTab /></Tabs.Content>
          <Tabs.Content value="yeast"><YeastTab /></Tabs.Content>
          <Tabs.Content value="misc"><MiscTab /></Tabs.Content>
          <Tabs.Content value="mash"><MashTab /></Tabs.Content>
          <Tabs.Content value="fermentation"><FermentationTab /></Tabs.Content>
          <Tabs.Content value="water"><WaterTab /></Tabs.Content>
          <Tabs.Content value="equipment"><EquipmentTab /></Tabs.Content>
          <Tabs.Content value="notes"><NotesTab /></Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}

// ── Start Brew modal ──────────────────────────────────────────────────────────

interface StartBrewModalProps {
  draft: RecipeDraft;
  stats: { og?: number; fg?: number; abv?: number; ibu?: number; srm?: number; ebc?: number };
  isSaving: boolean;
  onStart: (name: string, notes: string, brewDate: string) => Promise<void>;
  onClose: () => void;
}

function StartBrewModal({ stats, isSaving, onStart, onClose }: StartBrewModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [brewDate, setBrewDate] = useState(today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(name, notes, brewDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <FlaskConical size={18} className="text-amber-400" />
            <h2 className="font-semibold text-zinc-100">Start Brew</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-zinc-400">
            Snapshots the current recipe. You can fill in brew-day measurements (OG, pH, volumes, etc.) as you go.
          </p>

          {/* Planned stats summary */}
          <div className="flex flex-wrap gap-2">
            {stats.og && <StatChip label="OG" value={stats.og.toFixed(3)} />}
            {stats.fg && <StatChip label="FG" value={stats.fg.toFixed(3)} />}
            {stats.abv && <StatChip label="ABV" value={`${stats.abv.toFixed(1)}%`} />}
            {stats.ibu && <StatChip label="IBU" value={Math.round(stats.ibu).toString()} />}
          </div>

          <label className="block space-y-1">
            <span className="text-sm text-zinc-300">Brew date</span>
            <input type="date" value={brewDate} onChange={e => setBrewDate(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500" />
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-zinc-300">Name <span className="text-zinc-500">(optional — defaults to Brew #N)</span></span>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. March batch · Lower mash temp trial"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500" />
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-zinc-300">What did you change? <span className="text-zinc-500">(optional)</span></span>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Dropped mash temp from 67°C to 65°C, swapped out Crystal 60 for Crystal 40"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none focus:border-amber-500" />
          </label>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
            <button type="submit" disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium rounded-lg disabled:opacity-50">
              <FlaskConical size={15} />
              {isSaving ? 'Starting…' : 'Start Brew'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded">
      {label} <strong className="text-zinc-100">{value}</strong>
    </span>
  );
}
