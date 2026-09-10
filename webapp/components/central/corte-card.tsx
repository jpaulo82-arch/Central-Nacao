'use client';

import Image from 'next/image';
import { Play, Heart } from 'lucide-react';
import type { Corte } from '@/lib/types';
import { getSeloLabel, getSeloClass, formatRelativeTime, formatNumber } from '@/lib/utils';

export function CorteCard({ corte }: { corte: Corte }) {
  const selo = corte?.tipo ?? 'ugc';
  return (
    <article className="group overflow-hidden rounded-lg bg-card border border-border/40 transition-all hover:border-primary/30 hover:shadow-lg">
      <div className="relative aspect-video bg-muted">
        <Image
          src={corte?.midia_url ?? ''}
          alt={corte?.titulo ?? 'Corte'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
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
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">{corte?.titulo ?? ''}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{corte?.descricao ?? ''}</p>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{corte?.autor ?? ''} · {formatRelativeTime(corte?.timestamp ?? '')}</span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" /> {formatNumber(corte?.curtidas ?? 0)}
          </span>
        </div>
      </div>
    </article>
  );
}
