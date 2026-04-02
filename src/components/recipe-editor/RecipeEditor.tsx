import * as Tabs from '@radix-ui/react-tabs';
import { Save, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
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

  async function handleSave() {
    if (!user || isSaving) return;
    setIsSaving(true);
    try {
      const saved = await saveRecipe(draft);
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
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {isSaving && <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</>}
          {!isSaving && isDirty && <><AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Unsaved changes</>}
          {!isSaving && !isDirty && lastSaved && <><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Saved {lastSaved.toLocaleTimeString()}</>}
        </div>
        {user ? (
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
        ) : (
          <a href="/#/login" className="text-xs text-amber-600 hover:underline">Sign in to save</a>
        )}
      </div>

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
