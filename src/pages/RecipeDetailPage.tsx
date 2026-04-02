import { useParams, Link, useNavigate } from 'react-router-dom';
import { Edit, Copy, ArrowLeft } from 'lucide-react';
import { useRecipe, useUserProfile } from '@/hooks/useRecipes';
import { useAuthStore } from '@/store/authStore';
import { useRecipeStore } from '@/store/recipeStore';
import { srmToHex } from '@/calculators';
import { formatGravity, formatABV, formatIBU } from '@/lib/utils';

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-bold text-lg">{value}</div>
    </div>
  );
}

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: recipe, isLoading, error } = useRecipe(id);
  const { data: authorProfile } = useUserProfile(recipe?.user_id);
  const user = useAuthStore(s => s.user);
  const setDraft = useRecipeStore(s => s.setDraft);
  const navigate = useNavigate();

  if (isLoading) return <div className="flex items-center justify-center py-24"><div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (error || !recipe) return <div className="text-center py-24 text-muted-foreground">Recipe not found.</div>;

  const colorHex = srmToHex(recipe.srm ?? 5);

  function handleClone() {
    const r = recipe!;
    const { id: _id, user_id: _uid, created_at: _ca, updated_at: _ua, ...rest } = r;
    setDraft({ ...rest, name: `${r.name} (Clone)`, is_public: false });
    navigate('/recipes/new');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Link to="/recipes" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /></Link>
        <div className="flex-1" />
        {user?.id === recipe.user_id && (
          <Link to={`/recipes/${recipe.id}/edit`} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md hover:bg-muted"><Edit className="h-4 w-4" /> Edit</Link>
        )}
        <button onClick={handleClone} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md hover:bg-muted"><Copy className="h-4 w-4" /> Clone</button>
      </div>

      {/* Header */}
      <div className="flex gap-4 items-start">
        <div className="w-16 h-16 rounded-lg border-4 flex-shrink-0" style={{ backgroundColor: colorHex, borderColor: colorHex }} />
        <div>
          <h1 className="text-3xl font-bold">{recipe.name}</h1>
          {recipe.style_name && <div className="text-muted-foreground mt-0.5">{recipe.style_name}</div>}
          {authorProfile && (
            <div className="text-xs text-muted-foreground mt-1">
              by{' '}
              <Link
                to={`/users/${authorProfile.username ?? recipe.user_id}`}
                className="hover:text-foreground transition-colors"
              >
                {authorProfile.display_name ?? authorProfile.username ?? 'Anonymous'}
              </Link>
            </div>
          )}
          {recipe.description && <p className="text-sm mt-2 text-muted-foreground">{recipe.description}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-8 p-4 bg-muted/30 rounded-xl">
        <StatBadge label="OG" value={formatGravity(recipe.og ?? 1)} />
        <StatBadge label="FG" value={formatGravity(recipe.fg ?? 1)} />
        <StatBadge label="ABV" value={formatABV(recipe.abv ?? 0)} />
        <StatBadge label="IBU" value={formatIBU(recipe.ibu ?? 0)} />
        <StatBadge label="SRM" value={(recipe.srm ?? 0).toFixed(1)} />
        <StatBadge label="EBC" value={(recipe.ebc ?? 0).toFixed(1)} />
        <StatBadge label="Batch" value={`${recipe.batch_size_l ?? '?'} L`} />
      </div>

      {/* Fermentables */}
      {recipe.fermentables.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Fermentables</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left py-1.5 pr-3">Name</th><th className="text-left py-1.5 pr-3">Type</th><th className="text-right py-1.5 pr-3">Amount</th><th className="text-right py-1.5 pr-3">Color</th><th className="text-right py-1.5">PPG</th></tr></thead>
            <tbody>
              {recipe.fermentables.map((f, i) => (
                <tr key={i} className="border-b"><td className="py-2 pr-3 font-medium">{f.name}</td><td className="py-2 pr-3"><span className="text-xs px-1.5 py-0.5 bg-muted rounded">{f.type}</span></td><td className="py-2 pr-3 text-right">{f.amount_kg} kg</td><td className="py-2 pr-3 text-right">{f.color_ebc} EBC</td><td className="py-2 text-right">{f.ppg}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Hops */}
      {recipe.hops.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Hops</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left py-1.5 pr-3">Name</th><th className="text-left py-1.5 pr-3">Use</th><th className="text-right py-1.5 pr-3">Amount</th><th className="text-right py-1.5 pr-3">AA%</th><th className="text-right py-1.5">Time</th></tr></thead>
            <tbody>
              {recipe.hops.map((h, i) => (
                <tr key={i} className="border-b"><td className="py-2 pr-3 font-medium">{h.name}</td><td className="py-2 pr-3"><span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded">{h.use}</span></td><td className="py-2 pr-3 text-right">{h.amount_g} g</td><td className="py-2 pr-3 text-right">{h.alpha_acid}%</td><td className="py-2 text-right">{h.use === 'dry_hop' ? `${h.days_in_dry_hop}d` : `${h.time_min}min`}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Yeast */}
      {recipe.yeasts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Yeast</h2>
          <div className="space-y-2">
            {recipe.yeasts.map((y, i) => (
              <div key={i} className="border rounded-lg p-3 flex justify-between items-center text-sm">
                <div><div className="font-medium">{y.name}</div><div className="text-muted-foreground text-xs">{y.lab}{y.code ? ` · ${y.code}` : ''} · {y.type} · {y.form}</div></div>
                <div className="text-right"><div className="font-medium">{y.avg_attenuation}% att.</div><div className="text-xs text-muted-foreground">{y.min_temp_c}–{y.max_temp_c}°C</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Misc */}
      {recipe.miscs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Misc Additions</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left py-1.5 pr-3">Name</th><th className="text-left py-1.5 pr-3">Use</th><th className="text-right py-1.5">Amount</th></tr></thead>
            <tbody>
              {recipe.miscs.map((m, i) => (
                <tr key={i} className="border-b"><td className="py-2 pr-3 font-medium">{m.name}</td><td className="py-2 pr-3 text-muted-foreground">{m.use}</td><td className="py-2 text-right">{m.amount} {m.amount_unit}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes */}
      {recipe.recipe_notes && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Notes</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{recipe.recipe_notes}</p>
        </div>
      )}
    </div>
  );
}
