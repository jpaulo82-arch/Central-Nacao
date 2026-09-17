'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Database, Wifi } from 'lucide-react';
import { useMounted } from '@/components/client-only';
import { formatRelativeTime } from '@/lib/utils';

interface StatusBarProps {
  supabaseConfigured: boolean;
  renderedAt: string;
  payloadGeneratedAt: string | null;
  ultimaNoticia: string | null;
  onRefresh: () => void;
}

/**
 * Faixa fina abaixo do hero mostrando de onde vêm os dados e quando
 * foram atualizados. Ajuda a diagnosticar "não está atualizando".
 */
export function StatusBar({ supabaseConfigured, renderedAt, payloadGeneratedAt, ultimaNoticia, onRefresh }: StatusBarProps) {
  const mounted = useMounted();
  const [tick, setTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // quando novos dados chegam (renderedAt muda), encerra o estado "atualizando"
  useEffect(() => {
    setRefreshing(false);
  }, [renderedAt]);

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 4000);
  };

  return (
    <div className="border-b border-border/40 bg-card/40">
      <div className="mx-auto max-w-[1200px] px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {supabaseConfigured ? (
            <>
              <Wifi className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Ao vivo</span> · dados da redação
            </>
          ) : (
            <>
              <Database className="h-3 w-3 text-yellow-400" />
              <span className="text-yellow-400 font-medium">Demonstração</span> · banco não configurado
            </>
          )}
        </span>
        <span suppressHydrationWarning>
          Página atualizada {mounted ? `há ${formatRelativeTime(renderedAt, tick)}` : 'agora'}
        </span>
        {ultimaNoticia && (
          <span suppressHydrationWarning>
            Última notícia {mounted ? `há ${formatRelativeTime(ultimaNoticia, tick)}` : '—'}
          </span>
        )}
        {payloadGeneratedAt && (
          <span suppressHydrationWarning className="hidden sm:inline">
            Curadoria do dia {mounted ? `há ${formatRelativeTime(payloadGeneratedAt, tick)}` : '—'}
          </span>
        )}
        <button
          onClick={handleRefresh}
          className="ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-primary hover:bg-primary/10 transition-colors"
          aria-label="Atualizar agora"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Atualizando…' : 'Atualizar'}
        </button>
      </div>
    </div>
  );
}
