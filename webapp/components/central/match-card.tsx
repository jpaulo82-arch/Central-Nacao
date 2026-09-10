'use client';

import { useEffect, useState } from 'react';
import { Trophy, MapPin, Clock } from 'lucide-react';
import type { Match } from '@/lib/types';

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Agora!'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        d > 0 ? `${d}d ${h}h ${m}min` : `${h}h ${m}min ${s}s`
      );
    }
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export function MatchCard({ match }: { match: Match }) {
  const countdown = useCountdown(match?.data_hora ?? '');
  const isLive = match?.status === 'ao_vivo' || match?.status === 'intervalo';
  const isFinished = match?.status === 'encerrado';

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 via-card to-card border border-primary/30 p-4">
      {isLive && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase text-red-400">Ao Vivo</span>
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-4 w-4 text-primary" />
        <span className="text-[11px] font-medium text-primary">{match?.competicao ?? ''}</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-right">
          <p className="text-sm font-bold text-foreground">{match?.mandante ?? ''}</p>
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
          <p className="text-sm font-bold text-foreground">{match?.visitante ?? ''}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {match?.local ?? ''}
        </span>
        {!isFinished && (
          <span className="flex items-center gap-1 text-primary font-medium">
            <Clock className="h-3 w-3" /> {countdown}
          </span>
        )}
      </div>
    </div>
  );
}
