'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Heart, Eye, ExternalLink } from 'lucide-react';
import type { Corte } from '@/lib/types';
import { getSeloLabel, getSeloClass, formatRelativeTime, formatNumber } from '@/lib/utils';

function isValidUrl(u?: string | null): u is string {
  return !!u && /^https?:\/\//i.test(u);
}

/** Variações de capa gráfica rubro-negra (determinísticas por título) para cortes sem thumbnail. */
const CAPAS = [
  'from-primary/70 via-[#3a0a0d] to-black',
  'from-black via-[#4a0f14] to-primary/60',
  'from-[#2a0507] via-primary/50 to-black',
  'from-primary/40 via-black to-[#5a1218]',
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function CapaGrafica({ titulo, autor }: { titulo: string; autor: string }) {
  const capa = CAPAS[hashStr(titulo) % CAPAS.length];
  const inicial = (autor || titulo || 'N').trim().charAt(0).toUpperCase();
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${capa}`}>
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.35) 0 2px, transparent 2px 18px)' }}
      />
      <div className="absolute left-3 top-9 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 font-display text-base font-bold text-white backdrop-blur-sm">
        {inicial}
      </div>
      <p className="absolute inset-x-3 bottom-3 line-clamp-2 font-display text-sm font-bold leading-snug text-white drop-shadow">
        {titulo}
      </p>
    </div>
  );
}

export function CorteCard({ corte }: { corte: Corte }) {
  const selo = corte?.tipo ?? 'ugc';
  const [imgError, setImgError] = useState(false);
  const src = !imgError && isValidUrl(corte?.midia_url) ? corte.midia_url : null;
  const link = isValidUrl(corte?.url_origem) ? corte.url_origem : undefined;

  const Media = (
    <div className="relative aspect-video bg-muted">
      {src ? (
        <Image
          src={src}
          alt={corte?.titulo ?? 'Corte'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          onError={() => setImgError(true)}
        />
      ) : (
        <CapaGrafica titulo={corte?.titulo ?? ''} autor={corte?.autor ?? ''} />
      )}
      {corte?.midia_tipo === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-white">
            <Play className="h-5 w-5 ml-0.5" />
          </div>
        </div>
      )}
      <span className={`${getSeloClass(selo)} absolute top-2 left-2 rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider`}>
        {getSeloLabel(selo)}
      </span>
    </div>
  );

  return (
    <article className="group overflow-hidden rounded-lg bg-card border border-border/40 transition-all hover:border-primary/30 hover:shadow-lg">
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${corte?.titulo ?? 'corte'} na origem`}>
          {Media}
        </a>
      ) : (
        Media
      )}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">{corte?.titulo ?? ''}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{corte?.descricao ?? ''}</p>
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="truncate" suppressHydrationWarning>
            {corte?.autor ?? ''}
            {corte?.timestamp ? ` · ${formatRelativeTime(corte.timestamp)}` : ''}
          </span>
          <span className="flex shrink-0 items-center gap-3">
            {corte?.visualizacoes ? (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {corte.visualizacoes}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" /> {formatNumber(corte?.curtidas ?? 0)}
              </span>
            )}
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-medium text-primary hover:underline"
              >
                Ver na origem <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </span>
        </div>
      </div>
    </article>
  );
}
