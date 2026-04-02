import { useRecipeStore } from '@/store/recipeStore';

export function NotesTab() {
  const { draft, updateField } = useRecipeStore();

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="text-sm font-medium">Recipe Notes</label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">
          Process notes, ingredient rationale, tips for brewing this recipe.
        </p>
        <textarea
          className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          rows={8}
          value={draft.recipe_notes ?? ''}
          onChange={(e) => updateField('recipe_notes', e.target.value)}
          placeholder="Add notes about your recipe design, ingredient choices, process tips..."
        />
      </div>

      <div>
        <label className="text-sm font-medium">Batch Notes</label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">
          Observations from brew day and fermentation.
        </p>
        <textarea
          className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          rows={6}
          value={draft.batch_notes ?? ''}
          onChange={(e) => updateField('batch_notes', e.target.value)}
          placeholder="Brew day measurements, observations, tasting notes..."
        />
      </div>
    </div>
  );
}
