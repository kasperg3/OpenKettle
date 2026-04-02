import { useParams, Link } from 'react-router-dom';
import { FlaskConical, ArrowLeft } from 'lucide-react';
import { useUserByUsername } from '@/hooks/useRecipes';
import { RecipeCard } from '@/components/shared/RecipeCard';

export function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { data, isLoading, error } = useUserByUsername(username);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">User not found.</p>
        <Link to="/recipes" className="mt-4 inline-flex items-center gap-1.5 text-sm text-amber-600 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Browse recipes
        </Link>
      </div>
    );
  }

  const { profile, recipes } = data;
  const displayName = profile.display_name ?? profile.username ?? 'Anonymous Brewer';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <Link to="/recipes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All recipes
      </Link>

      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center flex-shrink-0">
          <FlaskConical className="h-8 w-8 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{displayName}</h1>
          {profile.username && profile.display_name && (
            <div className="text-sm text-muted-foreground">@{profile.username}</div>
          )}
          {profile.bio && (
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Recipes */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Public Recipes{recipes.length > 0 ? ` (${recipes.length})` : ''}
        </h2>
        {recipes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No public recipes yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
