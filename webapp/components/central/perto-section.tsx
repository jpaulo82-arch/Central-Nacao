'use client';

import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { VenueCard } from './venue-card';
import type { Venue } from '@/lib/types';

const CIDADES_PILOTO = ['Rio de Janeiro', 'Brasília'];

interface PertoSectionProps {
  venues: Venue[];
}

export function PertoSection({ venues }: PertoSectionProps) {
  const cidadesDisponiveis = useMemo(() => {
    const presentes = new Set((venues ?? []).map((v) => v?.cidade).filter(Boolean));
    return CIDADES_PILOTO.filter((cidade) => presentes.has(cidade));
  }, [venues]);

  const [cidade, setCidade] = useState(cidadesDisponiveis[0] ?? CIDADES_PILOTO[0]);

  const filtered = (venues ?? []).filter((v: Venue) => v?.cidade === cidade);

  return (
    <SectionWrapper
      id="perto"
      title="Perto de Você"
      subtitle="Bares, lojas e embaixadas da Nação"
      icon={MapPin}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {CIDADES_PILOTO.map((c: string) => {
            const hasItems = (venues ?? []).some((v) => v?.cidade === c);
            return (
              <button
                key={c}
                onClick={() => setCidade(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  cidade === c
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                } ${!hasItems ? 'opacity-60' : ''}`}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3">
          {filtered.length > 0 ? (
            filtered.map((v: Venue, idx: number) => <VenueCard key={v?.id ?? `venue-${idx}`} venue={v} />)
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum local cadastrado nesta cidade ainda.
            </p>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
