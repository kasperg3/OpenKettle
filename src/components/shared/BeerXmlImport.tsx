import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { parseBeerXml } from '@/lib/parseBeerXml';
import { useRecipeStore } from '@/store/recipeStore';

export function BeerXmlImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const setDraft = useRecipeStore(s => s.setDraft);
  const navigate = useNavigate();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const draft = parseBeerXml(evt.target?.result as string);
        setDraft(draft);
        navigate('/recipes/new');
      } catch (err) {
        setError((err as Error).message);
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    e.target.value = '';
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".xml,.beerxml"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted font-medium text-sm transition-colors"
      >
        <Upload className="h-4 w-4" />
        Import BeerXML
      </button>
      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
