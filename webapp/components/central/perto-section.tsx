'use client';

import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { VenueCard } from './venue-card';
import { DemoIndicator } from './demo-indicator';
import type { Venue } from '@/lib/types';

const CIDADE_PADRAO = 'Rio de Janeiro';

interface PertoSectionProps {
  venues: Venue[];
  isDemo: boolean;
  erro?: string;
}

export function PertoSection({ venues, isDemo, erro }: PertoSectionProps) {
  // Cidades derivadas dos locais realmente cadastrados (Rio primeiro, depois ordem alfabética)
  const cidades = useMemo(() => {
    const set = new Set<string>();
    (venues ?? []).forEach((v: Venue) => { if (v?.cidade) set.add(v.cidade); });
    const list = Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    if (list.includes(CIDADE_PADRAO)) {
      return [CIDADE_PADRAO, ...list.filter((c) => c !== CIDADE_PADRAO)];
    }
    return list;
  }, [venues]);

  const [cidadeSel, setCidadeSel] = useState<string | null>(null);
  const cidade = cidadeSel && cidades.includes(cidadeSel) ? cidadeSel : (cidades[0] ?? CIDADE_PADRAO);
  const filtered = (venues ?? []).filter((v: Venue) => v?.cidade === cidade);

  return (
    <SectionWrapper
      id="perto"
      title="Perto de Você"
      subtitle="Bares, lojas e embaixadas da Nação"
      icon={MapPin}
      rightSlot={<DemoIndicator show={isDemo} erro={erro} />}
    >
      <div className="space-y-4">
        {/* City selector */}
        {cidades.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cidades.map((c: string) => (
              <button
                key={c}
                onClick={() => setCidadeSel(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  cidade === c
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Venues */}
        <div className="grid gap-3">
          {filtered.length > 0 ? (
            filtered.map((v: Venue, idx: number) => <VenueCard key={v?.id ?? `venue-${idx}`} venue={v} />)
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum local cadastrado ainda. Em breve novas cidades da Nação.
            </p>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
