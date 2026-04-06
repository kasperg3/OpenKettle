import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { srmToHex } from '@/calculators/color';
import type { RecipeSummary } from '@/types';

interface RecipeCardProps {
  recipe: RecipeSummary;
}

function StatBadge({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined || value === null) return null;
  return (
    <span className="inline-flex flex-col items-center rounded-md bg-muted px-2 py-1 text-center">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </span>
  );
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const srmColor = srmToHex(recipe.srm ?? 5);

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className={cn(
        'group relative flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden cursor-pointer',
        'hover:border-amber-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200'
      )}
    >
      {/* Beer color header band */}
      <div
        className="h-2 w-full flex-shrink-0"
        style={{ backgroundColor: srmColor }}
        aria-hidden="true"
      />

      <div className="px-4 pt-3 pb-3 flex flex-col gap-2 flex-1">
        {/* Header */}
        <div>
          <h3 className="font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-amber-600 transition-colors">
            {recipe.name}
          </h3>
          {recipe.style_name && (
            <p className="text-xs text-muted-foreground mt-0.5">{recipe.style_name}</p>
          )}
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{recipe.description}</p>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {recipe.og !== undefined && (
            <StatBadge label="OG" value={recipe.og.toFixed(3)} />
          )}
          {recipe.fg !== undefined && (
            <StatBadge label="FG" value={recipe.fg.toFixed(3)} />
          )}
          {recipe.abv !== undefined && (
            <StatBadge label="ABV" value={`${recipe.abv.toFixed(1)}%`} />
          )}
          {recipe.ibu !== undefined && (
            <StatBadge label="IBU" value={Math.round(recipe.ibu)} />
          )}
          {recipe.srm !== undefined && (
            <span className="inline-flex flex-col items-center rounded-md bg-muted px-2 py-1 text-center">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">SRM</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0 border border-black/10"
                  style={{ backgroundColor: srmColor }}
                />
                {recipe.srm.toFixed(1)}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          {recipe.batch_size_l ? (
            <span className="text-xs text-muted-foreground">{recipe.batch_size_l}L batch</span>
          ) : null}
          {(recipe.author_username || recipe.author_display_name) && (
            <span
              onClick={e => e.preventDefault()}
              className="text-xs text-muted-foreground"
            >
              <Link
                to={`/users/${recipe.author_username ?? recipe.user_id}`}
                className="hover:text-foreground transition-colors"
                onClick={e => e.stopPropagation()}
              >
                {recipe.author_display_name ?? recipe.author_username}
              </Link>
            </span>
          )}
        </div>
        <span className="text-xs font-medium text-amber-600 group-hover:text-amber-500 transition-colors">
          View →
        </span>
      </div>
    </Link>
  );
}
