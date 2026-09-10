'use client';

import { useState } from 'react';
import { Flame, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'agora', label: 'Agora' },
  { id: 'nacao', label: 'Nação' },
  { id: 'cortes', label: 'Cortes' },
  { id: 'perto', label: 'Perto de Você' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
        {/* Logo / Brand */}
        <button onClick={() => window?.scrollTo?.({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 group">
          <Flame className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            Central da <span className="text-primary">Nação</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md px-4 pb-4 pt-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="block w-full text-left px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary"
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
