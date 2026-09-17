'use client';

import { Scissors } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { CorteCard } from './corte-card';
import { DemoIndicator } from './demo-indicator';
import type { Corte } from '@/lib/types';

interface CortesSectionProps {
  cortes: Corte[];
  isDemo: boolean;
  erro?: string;
}

export function CortesSection({ cortes, isDemo, erro }: CortesSectionProps) {
  return (
    <SectionWrapper
      id="cortes"
      title="Cortes"
      subtitle="Lances, memes e o melhor da torcida"
      icon={Scissors}
      rightSlot={<DemoIndicator show={isDemo} erro={erro} />}
    >
      {(cortes?.length ?? 0) > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {cortes.map((corte: Corte, idx: number) => (
            <CorteCard key={corte?.id ?? `corte-${idx}`} corte={corte} />
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhum corte selecionado hoje ainda.
        </p>
      )}
    </SectionWrapper>
  );
}
