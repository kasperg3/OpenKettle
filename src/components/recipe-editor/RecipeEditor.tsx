import * as Tabs from '@radix-ui/react-tabs';
import { Save, CheckCircle, Loader2, AlertCircle, GitCommitHorizontal, X } from 'lucide-react';
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
import { useSaveVersion } from '@/hooks/useRecipeVersions';
import { useCalculations } from '@/hooks/useCalculations';
import { cn } from '@/lib/utils';

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
  const { mutateAsync: saveVersion, isPending: isSavingVersion } = useSaveVersion();
  const stats = useCalculations();
  const [showVersionModal, setShowVersionModal] = useState(false);

  async function handleSave() {
    if (!user || isSaving) return;
    setIsSaving(true);
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
          {!isSaving && isDirty && <><AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Unsaved changes</>}
          {!isSaving && !isDirty && lastSaved && <><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Saved {lastSaved.toLocaleTimeString()}</>}
        </div>
        {user ? (
          <div className="flex items-center gap-2">
            {/* Save Version — only available once the recipe has been saved (has an id) */}
            {draft.id && (
              <button
                onClick={() => setShowVersionModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded font-medium border border-zinc-600 text-zinc-300 hover:border-amber-500 hover:text-amber-400 transition-colors"
                title="Snapshot this recipe as a named version for comparison"
              >
                <GitCommitHorizontal className="h-3.5 w-3.5" />
                Save Version
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
          <a href="/#/login" className="text-xs text-amber-600 hover:underline">Sign in to save</a>
        )}
      </div>

      {/* Save Version modal */}
      {showVersionModal && draft.id && (
        <SaveVersionModal
          recipeId={draft.id}
          draft={draft}
          stats={{ og: stats.og, fg: stats.fg, abv: stats.abv, ibu: stats.ibu, srm: stats.srm, ebc: stats.ebc }}
          isSaving={isSavingVersion}
          onSave={async (name, summary) => {
            await saveVersion({ recipe_id: draft.id!, name, changes_summary: summary, draft, stats: { og: stats.og, fg: stats.fg, abv: stats.abv, ibu: stats.ibu, srm: stats.srm, ebc: stats.ebc } });
            setShowVersionModal(false);
          }}
          onClose={() => setShowVersionModal(false)}
        />
      )}

      <Tabs.Root defaultValue="fermentables" className="flex-1 flex flex-col overflow-hidden">
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

// ── Save Version modal ────────────────────────────────────────────────────────

import type { RecipeDraft, RecipeStats } from '@/types';

interface SaveVersionModalProps {
  recipeId: string;
  draft: RecipeDraft;
  stats: RecipeStats;
  isSaving: boolean;
  onSave: (name: string, summary: string) => Promise<void>;
  onClose: () => void;
}

function SaveVersionModal({ isSaving, onSave, onClose }: SaveVersionModalProps) {
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, summary);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <GitCommitHorizontal size={18} className="text-amber-400" />
            <h2 className="font-semibold text-zinc-100">Save Version</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-zinc-400">
            Snapshots the current recipe state so you can compare it against future versions.
          </p>
          <label className="block space-y-1">
            <span className="text-sm text-zinc-300">Version name</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. v3 – More late hops"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-zinc-300">What changed? <span className="text-zinc-500">(optional)</span></span>
            <textarea
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="e.g. Replaced Crystal 60 with Crystal 40, added dry hop addition"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none focus:border-amber-500"
            />
          </label>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium rounded-lg disabled:opacity-50"
            >
              <GitCommitHorizontal size={15} />
              {isSaving ? 'Saving…' : 'Save snapshot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
