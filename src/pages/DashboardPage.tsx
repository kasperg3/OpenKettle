import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Globe, Lock } from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { BeerXmlImport } from '@/components/shared/BeerXmlImport';
import { useMyRecipes, useDeleteRecipe } from '@/hooks/useRecipes';
import { formatGravity, formatABV, formatIBU } from '@/lib/utils';
import { srmToHex } from '@/calculators';

function colorForSRM(srm?: number) { return srmToHex(srm ?? 5); }

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <div className="flex items-center gap-2">
            <BeerXmlImport />
            <Link to="/recipes/new" className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium text-sm">
              <Plus className="h-4 w-4" /> New Recipe
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="mb-4">No recipes yet.</p>
            <Link to="/recipes/new" className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm">
              Create your first recipe
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left py-2 pr-3">Recipe</th>
                  <th className="text-left py-2 pr-3">Style</th>
                  <th className="text-right py-2 pr-3">OG</th>
                  <th className="text-right py-2 pr-3">ABV</th>
                  <th className="text-right py-2 pr-3">IBU</th>
                  <th className="text-center py-2 pr-3">Visibility</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map(r => (
                  <tr key={r.id} className="border-b hover:bg-muted/30 group">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-8 rounded flex-shrink-0 border" style={{ backgroundColor: colorForSRM(r.srm) }} />
                        <Link to={`/recipes/${r.id}`} className="font-medium hover:text-amber-600">{r.name}</Link>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">{r.style_name ?? '—'}</td>
                    <td className="py-3 pr-3 text-right tabular-nums">{formatGravity(r.og ?? 1)}</td>
                    <td className="py-3 pr-3 text-right tabular-nums">{formatABV(r.abv ?? 0)}</td>
                    <td className="py-3 pr-3 text-right tabular-nums">{formatIBU(r.ibu ?? 0)}</td>
                    <td className="py-3 pr-3 text-center">
                      {r.is_public
                        ? <Globe className="h-3.5 w-3.5 text-green-500 inline" aria-label="Public" />
                        : <Lock className="h-3.5 w-3.5 text-muted-foreground inline" aria-label="Private" />}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => navigate(`/recipes/${r.id}/edit`)} className="p-1.5 hover:bg-muted rounded"><Edit className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setConfirmDelete(r.id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Confirm delete dialog */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border rounded-xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="font-semibold mb-2">Delete Recipe?</h3>
              <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border rounded-md hover:bg-muted">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
