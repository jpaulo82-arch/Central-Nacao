'use client';

import { Users } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { MatchCard } from './match-card';
import type { Match } from '@/lib/types';

interface NacaoSectionProps {
  matches: Match[];
  classificacaoLabel: string | null;
}

export function NacaoSection({ matches, classificacaoLabel }: NacaoSectionProps) {
  return (
    <SectionWrapper
      id="nacao"
      title="Nação"
      subtitle="Calendário e momento do time"
      icon={Users}
      rightSlot={
        classificacaoLabel ? (
          <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold text-primary">
            {classificacaoLabel}
          </span>
        ) : null
      }
    >
      {(matches ?? []).length > 0 ? (
        <div className="grid gap-4">
          {(matches ?? []).map((match: Match, idx: number) => (
            <MatchCard key={match?.id ?? `nacao-match-${idx}`} match={match} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-border/60 bg-card/60 p-4 text-sm text-muted-foreground">
          Ainda não há jogos publicados na seção Nação.
        </p>
      )}
    </SectionWrapper>
  );
}
