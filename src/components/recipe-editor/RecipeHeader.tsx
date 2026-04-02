import { useRecipeStore } from '@/store/recipeStore';
import { StyleSelector } from '@/components/shared/StyleSelector';

export function RecipeHeader() {
  const { draft, updateField } = useRecipeStore();

  return (
    <div className="px-4 py-4 border-b bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        <div className="md:col-span-2">
          <input
            className="w-full text-2xl font-bold bg-transparent border-0 border-b-2 border-transparent focus:border-amber-500 focus:outline-none pb-1"
            value={draft.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Recipe Name"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Style</label>
          <StyleSelector
            value={draft.style_id}
            onChange={(id, name) => {
              updateField('style_id', id);
              updateField('style_name', name);
            }}
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Tags (comma-separated)</label>
          <input
            className="w-full mt-1 px-3 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            value={(draft.tags ?? []).join(', ')}
            onChange={(e) =>
              updateField('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))
            }
            placeholder="ipa, hoppy, west-coast..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Description</label>
          <textarea
            className="w-full mt-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={2}
            value={draft.description ?? ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe your recipe..."
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Public Recipe</label>
          <button
            onClick={() => updateField('is_public', !draft.is_public)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              draft.is_public ? 'bg-amber-500' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                draft.is_public ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-xs text-muted-foreground">
            {draft.is_public ? 'Visible to everyone' : 'Only visible to you'}
          </span>
        </div>
      </div>
    </div>
  );
}
