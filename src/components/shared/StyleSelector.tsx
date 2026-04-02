import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BJCP_STYLES } from '@/data/bjcp2021';
import type { BJCPStyle } from '@/types';

interface StyleSelectorProps {
  value?: string;
  onChange: (styleId: string, styleName: string) => void;
  placeholder?: string;
}

export function StyleSelector({ value, onChange, placeholder = 'Select BJCP style...' }: StyleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = value ? BJCP_STYLES.find((s) => s.id === value) : undefined;

  const filtered = search.trim()
    ? BJCP_STYLES.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.id.toLowerCase().includes(search.toLowerCase()) ||
          s.category.toLowerCase().includes(search.toLowerCase())
      )
    : BJCP_STYLES;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  function handleSelect(style: BJCPStyle) {
    onChange(style.id, style.name);
    setOpen(false);
    setSearch('');
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('', '');
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2',
          'text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'hover:border-amber-400 transition-colors'
        )}
      >
        <span className={cn(selected ? 'text-foreground' : 'text-muted-foreground')}>
          {selected ? `${selected.id} – ${selected.name}` : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {selected && (
            <span
              role="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
          <div className="flex items-center border-b border-border px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search styles..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">No styles found</div>
            ) : (
              filtered.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => handleSelect(style)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors',
                    value === style.id && 'bg-accent text-accent-foreground font-medium'
                  )}
                >
                  <span className="font-mono text-xs text-muted-foreground mr-2">{style.id}</span>
                  {style.name}
                  <span className="ml-1 text-xs text-muted-foreground">({style.category})</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
