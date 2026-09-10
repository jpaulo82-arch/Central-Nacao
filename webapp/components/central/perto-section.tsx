'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { VenueCard } from './venue-card';
import { DemoIndicator } from './demo-indicator';
import type { Venue } from '@/lib/types';

const CIDADES = ['Rio de Janeiro', 'São Paulo', 'Belo Horizonte', 'Recife', 'Salvador'];

interface PertoSectionProps {
  venues: Venue[];
  isDemo: boolean;
}

export function PertoSection({ venues, isDemo }: PertoSectionProps) {
  const [cidade, setCidade] = useState('Rio de Janeiro');
  const filtered = (venues ?? []).filter((v: Venue) => v?.cidade === cidade);

  return (
    <SectionWrapper
      id="perto"
      title="Perto de Você"
      subtitle="Bares, lojas e embaixadas da Nação"
      icon={MapPin}
      rightSlot={<DemoIndicator show={isDemo} />}
    >
      <div className="space-y-4">
        {/* City selector */}
        <div className="flex flex-wrap gap-2">
          {CIDADES.map((c: string) => (
            <button
              key={c}
              onClick={() => setCidade(c)}
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

        {/* Venues */}
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
