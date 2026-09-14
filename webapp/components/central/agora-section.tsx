'use client';

import { Zap } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { NewsCardItem } from './news-card';
import { MatchCard } from './match-card';
import type { NewsCard, Match } from '@/lib/types';

interface AgoraSectionProps {
  news: NewsCard[];
  matches: Match[];
}

export function AgoraSection({ news, matches }: AgoraSectionProps) {
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
    >
      <div className="space-y-6">
        {proximoJogo && (
          <div className="mb-4">
            <MatchCard match={proximoJogo} />
          </div>
        )}

        {(destaques?.length ?? 0) > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {destaques.map((card: NewsCard, idx: number) => (
              <NewsCardItem key={card?.id ?? `dest-${idx}`} card={card} />
            ))}
          </div>
        )}

        {(restantes?.length ?? 0) > 0 && (
          <div className="grid gap-3">
            {(restantes ?? []).map((card: NewsCard, idx: number) => (
              <NewsCardItem key={card?.id ?? `rest-${idx}`} card={card} />
            ))}
          </div>
        )}

        {(news ?? []).length === 0 && !proximoJogo && (
          <p className="rounded-lg border border-border/60 bg-card/60 p-4 text-sm text-muted-foreground">
            Ainda não há conteúdo publicado na seção Agora.
          </p>
        )}
      </div>
    </SectionWrapper>
  );
}
