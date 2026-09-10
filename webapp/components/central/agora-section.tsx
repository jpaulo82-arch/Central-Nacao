'use client';

import { Zap } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { NewsCardItem } from './news-card';
import { MatchCard } from './match-card';
import { DemoIndicator } from './demo-indicator';
import type { NewsCard, Match } from '@/lib/types';

interface AgoraSectionProps {
  news: NewsCard[];
  matches: Match[];
  isDemo: boolean;
}

export function AgoraSection({ news, matches, isDemo }: AgoraSectionProps) {
  const destaques = (news ?? []).filter((n: NewsCard) => n?.destaque);
  const restantes = (news ?? []).filter((n: NewsCard) => !n?.destaque);
  const proximoJogo = (matches ?? []).find(
    (m: Match) => m?.status === 'agendado' || m?.status === 'ao_vivo' || m?.status === 'intervalo'
  );

  return (
    <SectionWrapper
      id="agora"
      title="Agora"
      subtitle="Notícias quentes e o próximo jogo"
      icon={Zap}
      rightSlot={<DemoIndicator show={isDemo} />}
    >
      <div className="space-y-6">
        {/* Match Center */}
        {proximoJogo && (
          <div className="mb-4">
            <MatchCard match={proximoJogo} />
          </div>
        )}

        {/* Destaques */}
        {(destaques?.length ?? 0) > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {destaques.map((card: NewsCard, idx: number) => (
              <NewsCardItem key={card?.id ?? `dest-${idx}`} card={card} />
            ))}
          </div>
        )}

        {/* Restantes */}
        <div className="grid gap-3">
          {(restantes ?? []).map((card: NewsCard, idx: number) => (
            <NewsCardItem key={card?.id ?? `rest-${idx}`} card={card} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
