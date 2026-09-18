'use client';

import { Zap, Trophy, CalendarDays } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { NewsCardItem } from './news-card';
import { MatchCard } from './match-card';
import { DemoIndicator } from './demo-indicator';
import type { NewsCard, Match, Classificacao } from '@/lib/types';

interface AgoraSectionProps {
  news: NewsCard[];
  matches: Match[];
  classificacao?: Classificacao | null;
  isDemo: boolean;
  erro?: string;
}

function pickProximoJogo(matches: Match[]): Match | undefined {
  const list = matches ?? [];
  const live = list.find((m) => m?.status === 'ao_vivo' || m?.status === 'intervalo');
  if (live) return live;
  const now = Date.now();
  const futuros = list
    .filter((m) => m?.status === 'agendado' && !Number.isNaN(new Date(m?.data_hora ?? '').getTime()))
    .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());
  return futuros.find((m) => new Date(m.data_hora).getTime() >= now - 3 * 3600000) ?? futuros[0];
}

function pickUltimoResultado(matches: Match[], proximo?: Match): Match | undefined {
  return (matches ?? [])
    .filter((m) => m?.status === 'encerrado' && m?.id !== proximo?.id)
    .sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime())[0];
}

export function AgoraSection({ news, matches, classificacao, isDemo, erro }: AgoraSectionProps) {
  const destaques = (news ?? []).filter((n: NewsCard) => n?.destaque);
  const restantes = (news ?? []).filter((n: NewsCard) => !n?.destaque);
  // A manchete é a primeira notícia de destaque (ou, na falta dela, a mais recente);
  // o resto entra na grade uniforme abaixo.
  const manchete = destaques[0] ?? restantes[0];
  const grade = (destaques.length > 0 ? [...destaques.slice(1), ...restantes] : restantes.slice(1)).filter(
    (n) => n?.id !== manchete?.id,
  );
  const proximoJogo = pickProximoJogo(matches);
  const ultimoResultado = pickUltimoResultado(matches, proximoJogo);

  return (
    <SectionWrapper
      id="agora"
      title="Agora"
      subtitle="Notícias quentes e o próximo jogo"
      icon={Zap}
      rightSlot={<DemoIndicator show={isDemo} erro={erro} />}
    >
      <div className="space-y-6">
        {/* Match Center */}
        {(proximoJogo || ultimoResultado || classificacao) && (
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              {proximoJogo && (
                <div>
                  <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <CalendarDays className="h-3 w-3" /> Próximo jogo
                  </p>
                  <MatchCard match={proximoJogo} />
                </div>
              )}
              {ultimoResultado && (
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Último resultado
                  </p>
                  <MatchCard match={ultimoResultado} compact />
                </div>
              )}
            </div>

            {classificacao && (
              <div className="rounded-lg border border-border/40 bg-card p-4 md:w-[220px]">
                <p className="mb-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Trophy className="h-3 w-3 text-primary" /> Brasileirão
                </p>
                <div className="flex items-end gap-2">
                  <span className="font-display text-4xl font-bold text-primary leading-none">{classificacao.posicao}º</span>
                  <span className="text-sm text-foreground font-semibold pb-0.5">{classificacao.pontos} pts</span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[11px]">
                  <Stat label="J" value={classificacao.jogos} />
                  <Stat label="V" value={classificacao.vitorias} />
                  <Stat label="E" value={classificacao.empates} />
                  <Stat label="D" value={classificacao.derrotas} />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Saldo de gols: <span className="text-foreground font-medium">{classificacao.saldo_gols > 0 ? `+${classificacao.saldo_gols}` : classificacao.saldo_gols}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Manchete: a notícia de destaque em foto grande, no estilo dos grandes portais de clube */}
        {manchete && <NewsCardItem card={manchete} variant="featured" />}

        {/* Grade de notícias: 3 colunas uniformes, foto sempre 16:9 */}
        {(grade?.length ?? 0) > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {grade.map((card: NewsCard, idx: number) => (
              <NewsCardItem key={card?.id ?? `grade-${idx}`} card={card} />
            ))}
          </div>
        ) : (
          !manchete && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma notícia publicada ainda. A redação atualiza ao longo do dia.
            </p>
          )
        )}
      </div>
    </SectionWrapper>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-secondary/60 py-1.5">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  );
}
