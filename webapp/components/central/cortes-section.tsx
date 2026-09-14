'use client';

import { Scissors } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { CorteCard } from './corte-card';
import type { Corte } from '@/lib/types';

interface CortesSectionProps {
  cortes: Corte[];
}

export function CortesSection({ cortes }: CortesSectionProps) {
  return (
    <SectionWrapper
      id="cortes"
      title="Cortes"
      subtitle="Lances, memes e o melhor da torcida"
      icon={Scissors}
    >
      {(cortes ?? []).length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {(cortes ?? []).map((corte: Corte, idx: number) => (
            <CorteCard key={corte?.id ?? `corte-${idx}`} corte={corte} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-border/60 bg-card/60 p-4 text-sm text-muted-foreground">
          Ainda não há cortes publicados no momento.
        </p>
      )}
    </SectionWrapper>
  );
}
