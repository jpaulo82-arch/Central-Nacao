'use client';

import { useEffect, useState } from 'react';
import { Trophy, MapPin, Clock, Tv } from 'lucide-react';
import type { Match } from '@/lib/types';
import { formatDateTimeBR } from '@/lib/utils';

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (Number.isNaN(diff)) { setTimeLeft(''); return; }
      if (diff <= 0) { setTimeLeft('Bola rolando!'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}min` : `${h}h ${m}min ${s}s`);
    }
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export function MatchCard({ match, compact = false }: { match: Match; compact?: boolean }) {
  const countdown = useCountdown(match?.data_hora ?? '');
  const isLive = match?.status === 'ao_vivo' || match?.status === 'intervalo';
  const isFinished = match?.status === 'encerrado';
  const transmissao = (match?.transmissao ?? []).filter(Boolean);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border p-4 ${
        isFinished
          ? 'bg-card border-border/40'
          : 'bg-gradient-to-br from-primary/20 via-card to-card border-primary/30'
      }`}
    >
      {isLive && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase text-red-400">Ao Vivo</span>
        </div>
      )}
      {isFinished && (
        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase text-muted-foreground">Encerrado</span>
      )}
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-4 w-4 text-primary" />
        <span className="text-[11px] font-medium text-primary">{match?.competicao ?? ''}</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-right">
          <p className={`${compact ? 'text-sm' : 'text-sm md:text-base'} font-bold text-foreground`}>{match?.mandante ?? ''}</p>
        </div>
        <div className="flex flex-col items-center">
          {(isLive || isFinished) ? (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{match?.placar_mandante ?? 0}</span>
              <span className="text-lg text-muted-foreground">×</span>
              <span className="text-2xl font-bold text-foreground">{match?.placar_visitante ?? 0}</span>
            </div>
          ) : (
            <span className="text-[10px] font-medium text-muted-foreground uppercase">vs</span>
          )}
        </div>
        <div className="flex-1 text-left">
          <p className={`${compact ? 'text-sm' : 'text-sm md:text-base'} font-bold text-foreground`}>{match?.visitante ?? ''}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {match?.data_hora && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {formatDateTimeBR(match.data_hora)}
          </span>
        )}
        {match?.local && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {match.local}
          </span>
        )}
        {transmissao.length > 0 && (
          <span className="flex items-center gap-1">
            <Tv className="h-3 w-3" /> {transmissao.join(' · ')}
          </span>
        )}
      </div>
      {!isFinished && !compact && countdown && (
        <p className="mt-2 text-center text-xs font-semibold text-primary">
          {isLive ? 'Bola rolando!' : `Faltam ${countdown}`}
        </p>
      )}
    </div>
  );
}
