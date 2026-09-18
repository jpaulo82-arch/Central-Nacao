'use client';

import Image from 'next/image';
import { ExternalLink, Clock } from 'lucide-react';
import type { NewsCard as NewsCardType } from '@/lib/types';
import { getSeloLabel, getSeloClass, formatRelativeTime } from '@/lib/utils';

function isValidUrl(u?: string | null): u is string {
  return !!u && /^https?:\/\//i.test(u);
}

/**
 * Card de notícia — estilo "portal de clube grande" (foto manda, título sobreposto,
 * grade uniforme). Duas variantes:
 *  - featured: card grande de destaque, imagem larga, título sobreposto na imagem.
 *  - grid: card compacto e uniforme para a grade de notícias secundárias.
 */
export function NewsCardItem({
  card,
  variant = 'grid',
}: {
  card: NewsCardType;
  variant?: 'featured' | 'grid';
}) {
  const selo = card?.tipo ?? 'ugc';
  const hasLink = isValidUrl(card?.url_origem);

  if (variant === 'featured') {
    return (
      <article className="group relative flex flex-col overflow-hidden rounded-xl bg-card">
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-muted overflow-hidden">
          {card?.imagem_url ? (
            <Image
              src={card.imagem_url}
              alt={card?.titulo ?? 'Notícia'}
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-background" />
          )}
          {/* Gradiente para o texto sobreposto ficar legível */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 md:p-7">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`${getSeloClass(selo)} inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider`}>
                {getSeloLabel(selo)}
              </span>
              {card?.categoria && (
                <span className="inline-block rounded-sm bg-white/15 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                  {card.categoria}
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px] text-white/70" suppressHydrationWarning>
                <Clock className="h-3 w-3" />
                {formatRelativeTime(card?.timestamp ?? '')}
              </span>
            </div>
            <h3 className="font-display text-xl md:text-3xl font-bold leading-[1.15] tracking-tight text-white max-w-3xl">
              {hasLink ? (
                <a href={card.url_origem} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-2 underline-offset-2">
                  {card?.titulo ?? ''}
                </a>
              ) : (
                card?.titulo ?? ''
              )}
            </h3>
            <p className="hidden md:block text-sm text-white/80 max-w-2xl line-clamp-2">{card?.resumo ?? ''}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-white/60 truncate">{card?.fonte ?? ''}</span>
              {hasLink && (
                <a
                  href={card.url_origem}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-white hover:underline"
                >
                  Ler na origem <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-card border border-border/30 transition-all hover:border-primary/40 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5">
      <div className="relative aspect-[16/9] w-full bg-muted overflow-hidden">
        {card?.imagem_url ? (
          <Image
            src={card.imagem_url}
            alt={card?.titulo ?? 'Notícia'}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background" />
        )}
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
          <span className={`${getSeloClass(selo)} inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider`}>
            {getSeloLabel(selo)}
        </span>
      </div>
    </div>
    <div className="flex flex-1 flex-col gap-1.5 p-3.5">
      <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground uppercase tracking-wide">
        {card?.categoria && <span className="font-semibold text-primary">{card.categoria}</span>}
        <span className="flex items-center gap-1" suppressHydrationWarning>
          <Clock className="h-3 w-3" />
          {formatRelativeTime(card?.timestamp ?? '')}
        </span>
      </div>
      <h3 className="font-display text-sm font-bold leading-snug tracking-tight text-foreground line-clamp-2">
        {hasLink ? (
          <a href={card.url_origem} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            {card?.titulo ?? ''}
          </a>
        ) : (
          card?.titulo ?? ''
        )}
      </h3>
      <div className="mt-auto flex items-center justify-between pt-1.5">
        <span className="text-[11px] text-muted-foreground truncate">{card?.fonte ?? ''}</span>
        {hasLink && (
          <a
            href={card.url_origem}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            Ler <ExternalLink className="h-3 w-3" />
          </a>
      )}
    </div>
  </div>
</article>
  );
}
