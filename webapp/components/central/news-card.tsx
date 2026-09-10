'use client';

import Image from 'next/image';
import { ExternalLink, Clock } from 'lucide-react';
import type { NewsCard as NewsCardType } from '@/lib/types';
import { getSeloLabel, getSeloClass, formatRelativeTime } from '@/lib/utils';

export function NewsCardItem({ card }: { card: NewsCardType }) {
  const selo = card?.tipo ?? 'ugc';
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg bg-card border border-border/40 transition-all hover:border-primary/30 hover:shadow-lg">
      {card?.imagem_url && (
        <div className="relative aspect-video bg-muted">
          <Image
            src={card.imagem_url}
            alt={card?.titulo ?? 'Notícia'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span className={`${getSeloClass(selo)} inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider`}>
            {getSeloLabel(selo)}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(card?.timestamp ?? '')}
          </span>
        </div>
        <h3 className="font-display text-sm font-semibold leading-snug tracking-tight text-foreground line-clamp-2">
          {card?.titulo ?? ''}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{card?.resumo ?? ''}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-[11px] text-muted-foreground">{card?.fonte ?? ''}</span>
          <a
            href={card?.url_origem ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            Ler na origem <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
