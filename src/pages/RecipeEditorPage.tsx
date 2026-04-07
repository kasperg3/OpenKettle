import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { RecipeEditor } from '@/components/recipe-editor/RecipeEditor';
import { useRecipeStore, EMPTY_DRAFT } from '@/store/recipeStore';
import { useRecipe } from '@/hooks/useRecipes';
import { SpinnerPage } from '@/components/shared/Spinner';

function EditorWithLoad({ id }: { id: string }) {
  const { data: recipe, isLoading } = useRecipe(id);
  const setDraft = useRecipeStore(s => s.setDraft);
  const navigate = useNavigate();

  useEffect(() => {
    if (recipe) {
      const { created_at: _ca, updated_at: _ua, ...rest } = recipe;
      setDraft(rest);
    }
  }, [recipe, setDraft]);

  if (isLoading) return <SpinnerPage />;

  return <RecipeEditor onSaved={(savedId) => navigate(`/recipes/${savedId}/edit`, { replace: true })} />;
}

export function RecipeEditorPage() {
  const { id } = useParams<{ id: string }>();
  const resetDraft = useRecipeStore(s => s.resetDraft);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) resetDraft();
  }, [id, resetDraft]);

  return (
    <AuthGuard>
      <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
        {id ? (
          <EditorWithLoad id={id} />
        ) : (
          <RecipeEditor onSaved={(savedId) => navigate(`/recipes/${savedId}/edit`, { replace: true })} />
        )}
      </div>
    </AuthGuard>
  );
}
