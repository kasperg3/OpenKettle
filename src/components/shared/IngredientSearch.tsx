import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useIngredients } from '@/hooks/useIngredients';
import { cn } from '@/lib/utils';

interface Props {
  type: 'fermentables' | 'hops' | 'yeasts' | 'miscs';
  onSelect: (item: Record<string, unknown>) => void;
  placeholder?: string;
}

export function IngredientSearch({ type, onSelect, placeholder }: Props) {
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const { results, isLoading } = useIngredients(type, term);

  function handleSelect(item: Record<string, unknown>) {
    onSelect(item);
    setTerm('');
    setOpen(false);
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-4 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder={placeholder ?? `Search ${type}...`}
          value={term}
          onChange={(e) => { setTerm(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && (results.length > 0 || (term.length >= 2 && !isLoading)) && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-60 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">No results found</div>
          ) : (
            results.map((item, i) => (
              <button
                key={i}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                  'flex items-center justify-between gap-2'
                )}
                onMouseDown={() => handleSelect(item)}
              >
                <span className="font-medium">{String(item.name ?? '')}</span>
                <span className="text-xs text-muted-foreground">
                  {type === 'fermentables' && `${item.color_ebc} EBC · ${item.ppg} PPG`}
                  {type === 'hops' && `${item.alpha_acid}% AA`}
                  {type === 'yeasts' && `${item.lab} · ${item.avg_attenuation}% att.`}
                  {type === 'miscs' && String(item.type ?? '')}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
