import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useIngredients(
  type: 'fermentables' | 'hops' | 'yeasts' | 'miscs',
  searchTerm: string
) {
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from(type)
          .select('*')
          .ilike('name', `%${searchTerm}%`)
          .eq('is_global', true)
          .limit(20);
        setResults(data ?? []);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [type, searchTerm]);

  return { results, isLoading };
}
