'use client';

import { Scissors } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { CorteCard } from './corte-card';
import { DemoIndicator } from './demo-indicator';
import type { Corte } from '@/lib/types';

interface CortesSectionProps {
  cortes: Corte[];
  isDemo: boolean;
}

export function CortesSection({ cortes, isDemo }: CortesSectionProps) {
  return (
    <SectionWrapper
      id="cortes"
      title="Cortes"
      subtitle="Lances, memes e o melhor da torcida"
      icon={Scissors}
      rightSlot={<DemoIndicator show={isDemo} />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {(cortes ?? []).map((corte: Corte, idx: number) => (
          <CorteCard key={corte?.id ?? `corte-${idx}`} corte={corte} />
        ))}
      </div>
    </SectionWrapper>
  );
}
