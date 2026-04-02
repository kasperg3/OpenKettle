import { useState } from 'react';
import { Search } from 'lucide-react';
import { RecipeCard } from '@/components/shared/RecipeCard';
import { StyleSelector } from '@/components/shared/StyleSelector';
import { usePublicRecipes } from '@/hooks/useRecipes';

export function RecipesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [styleId, setStyleId] = useState<string | undefined>();
  const [offset, setOffset] = useState(0);
  const LIMIT = 24;

  const { data: recipes = [], isLoading } = usePublicRecipes({
    search: debouncedSearch || undefined,
    styleId,
    limit: LIMIT,
    offset,
  });

  function handleSearchChange(val: string) {
    setSearch(val);
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(() => {
      setDebouncedSearch(val);
      setOffset(0);
    }, 400) as unknown as number;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Recipes</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search recipes..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="min-w-[200px]">
          <StyleSelector
            value={styleId}
            onChange={(id) => { setStyleId(id || undefined); setOffset(0); }}
          />
        </div>
        {(styleId || debouncedSearch) && (
          <button
            onClick={() => { setStyleId(undefined); setSearch(''); setDebouncedSearch(''); setOffset(0); }}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-muted"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(12)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : recipes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
          </div>
          <div className="flex justify-center gap-3 mt-8">
            {offset > 0 && (
              <button onClick={() => setOffset(Math.max(0, offset - LIMIT))} className="px-4 py-2 border rounded-lg text-sm hover:bg-muted">
                ← Previous
              </button>
            )}
            {recipes.length === LIMIT && (
              <button onClick={() => setOffset(offset + LIMIT)} className="px-4 py-2 border rounded-lg text-sm hover:bg-muted">
                Next →
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          No recipes found. Try a different search or style.
        </div>
      )}
    </div>
  );
}

declare global { interface Window { _searchTimer: number; } }
