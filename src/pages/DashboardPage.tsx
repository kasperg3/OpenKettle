import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Globe, Lock, FlaskConical } from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { BeerXmlImport } from '@/components/shared/BeerXmlImport';
import { useMyRecipes, useDeleteRecipe } from '@/hooks/useRecipes';
import { formatGravity, formatABV, formatIBU } from '@/lib/utils';
import { srmToHex } from '@/calculators';

export function DashboardPage() {
  const { data: recipes = [], isLoading } = useMyRecipes();
  const { mutateAsync: deleteRecipe } = useDeleteRecipe();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleDelete(id: string) {
    await deleteRecipe(id);
    setConfirmDelete(null);
  }

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Recipes</h1>
            {!isLoading && recipes.length > 0 && (
              <p className="text-sm text-muted-foreground mt-0.5">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <BeerXmlImport />
            <Link
              to="/recipes/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium text-sm transition-colors"
            >
              <Plus className="h-4 w-4" /> New Recipe
            </Link>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && recipes.length === 0 && (
          <div className="text-center py-24 border border-dashed rounded-xl text-muted-foreground">
            <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="mb-4 font-medium">No recipes yet.</p>
            <Link
              to="/recipes/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm transition-colors"
            >
              <Plus className="h-4 w-4" /> Create your first recipe
            </Link>
          </div>
        )}

        {/* Desktop table */}
        {!isLoading && recipes.length > 0 && (
          <>
            <div className="hidden sm:block overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                    <th className="text-left py-3 px-4">Recipe</th>
                    <th className="text-left py-3 px-3">Style</th>
                    <th className="text-right py-3 px-3">OG</th>
                    <th className="text-right py-3 px-3">ABV</th>
                    <th className="text-right py-3 px-3">IBU</th>
                    <th className="text-center py-3 px-3">Vis.</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recipes.map(r => {
                    const color = srmToHex(r.srm ?? 5);
                    return (
                      <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-1 h-7 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color }}
                              aria-hidden="true"
                            />
                            <Link
                              to={`/recipes/${r.id}`}
                              className="font-medium hover:text-amber-600 transition-colors"
                            >
                              {r.name}
                            </Link>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground text-xs">{r.style_name ?? '—'}</td>
                        <td className="py-3 px-3 text-right tabular-nums">{formatGravity(r.og ?? 1)}</td>
                        <td className="py-3 px-3 text-right tabular-nums">{formatABV(r.abv ?? 0)}</td>
                        <td className="py-3 px-3 text-right tabular-nums">{formatIBU(r.ibu ?? 0)}</td>
                        <td className="py-3 px-3 text-center">
                          {r.is_public
                            ? <Globe className="h-3.5 w-3.5 text-green-500 inline" aria-label="Public" />
                            : <Lock className="h-3.5 w-3.5 text-muted-foreground inline" aria-label="Private" />}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => navigate(`/recipes/${r.id}/edit`)}
                              className="p-1.5 hover:bg-muted rounded transition-colors cursor-pointer"
                              aria-label="Edit recipe"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(r.id)}
                              className="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors cursor-pointer"
                              aria-label="Delete recipe"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {recipes.map(r => {
                const color = srmToHex(r.srm ?? 5);
                return (
                  <div key={r.id} className="border border-border rounded-xl overflow-hidden bg-card">
                    <div className="h-1.5 w-full" style={{ backgroundColor: color }} aria-hidden="true" />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/recipes/${r.id}`}
                            className="font-semibold hover:text-amber-600 transition-colors block truncate"
                          >
                            {r.name}
                          </Link>
                          {r.style_name && (
                            <p className="text-xs text-muted-foreground mt-0.5">{r.style_name}</p>
                          )}
                        </div>
                        {r.is_public
                          ? <Globe className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" aria-label="Public" />
                          : <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" aria-label="Private" />}
                      </div>
                      <div className="flex items-center gap-3 mt-2.5 text-xs text-muted-foreground">
                        <span className="tabular-nums">{formatGravity(r.og ?? 1)}</span>
                        <span className="tabular-nums">{formatABV(r.abv ?? 0)}</span>
                        <span className="tabular-nums">{formatIBU(r.ibu ?? 0)} IBU</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                        <button
                          onClick={() => navigate(`/recipes/${r.id}/edit`)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 text-xs border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => setConfirmDelete(r.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 text-xs border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Confirm delete dialog */}
        {confirmDelete && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-xl">
              <h3 id="delete-dialog-title" className="font-semibold mb-2">Delete Recipe?</h3>
              <p className="text-sm text-muted-foreground mb-5">This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
