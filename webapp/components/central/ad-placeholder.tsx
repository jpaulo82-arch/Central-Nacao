import Image from 'next/image';
import { Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Espaços publicitários. Enquanto não há anunciantes reais, cada espaço mostra
 * um criativo SIMULADO (marca fictícia) para o layout não ficar vazio.
 * O selo "Publicidade · Simulação" deixa claro que não é anúncio real.
 */

type Formato = 'leaderboard' | 'retangulo' | 'sidebar';
type Creative = 'bar' | 'manto' | 'delivery' | 'seguros';

interface AdPlaceholderProps {
  format: Formato;
  creative?: Creative;
  className?: string;
}

const SIZES: Record<Formato, string> = {
  leaderboard: 'w-full h-[100px] md:h-[120px]',
  retangulo: 'w-full h-[200px] md:h-[250px]',
  sidebar: 'w-full h-[600px]',
};

const LABELS: Record<Formato, string> = {
  leaderboard: 'Leaderboard 728×90',
  retangulo: 'Retângulo Médio 300×250',
  sidebar: 'Sidebar 300×600',
};

const CREATIVES: Record<Creative, { src: string; alt: string; marca: string }> = {
  bar: {
    src: 'https://cdn.abacus.ai/images/956a2bd0-7040-4cfa-a819-f8f2cb7d04a1.png',
    alt: 'Anúncio simulado: Bar do Urubu — Jogo do Mengão é aqui, chopp em dobro no gol',
    marca: 'Bar do Urubu',
  },
  manto: {
    src: 'https://cdn.abacus.ai/images/a22cd635-21dc-4450-8b05-1ff0ad924c34.png',
    alt: 'Anúncio simulado: Manto Store — camisa rubro-negra com frete grátis',
    marca: 'Manto Store',
  },
  delivery: {
    src: 'https://cdn.abacus.ai/images/9993c87a-d12a-44f8-a1d5-ee06f99abcc7.png',
    alt: 'Anúncio simulado: Fla Delivery — pediu no gol, chegou no apito',
    marca: 'Fla Delivery',
  },
  seguros: {
    src: 'https://cdn.abacus.ai/images/2d32a895-ff47-4cfd-ac20-ffb8def6ce03.png',
    alt: 'Anúncio simulado: Nação Seguros — proteção que não abandona no segundo tempo',
    marca: 'Nação Seguros',
  },
};

export function AdPlaceholder({ format, creative, className }: AdPlaceholderProps) {
  const c = creative ? CREATIVES[creative] : null;

  if (c) {
    return (
      <div
        className={cn(
          'ad-slot group relative overflow-hidden rounded-lg border border-border/40 bg-muted',
          SIZES[format] ?? SIZES.retangulo,
          className,
        )}
        aria-label={`Espaço publicitário (${LABELS[format]}) — simulação`}
      >
        <Image
          src={c.src}
          alt={c.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 728px"
        />
        <span className="absolute top-1.5 left-1.5 rounded-sm bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm">
          Publicidade · Simulação
        </span>
        <span className="absolute bottom-1.5 right-1.5 rounded-sm bg-black/60 px-1.5 py-0.5 text-[9px] text-white/70">
          {LABELS[format]}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'ad-placeholder rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground/50',
        SIZES[format] ?? SIZES.retangulo,
        className,
      )}
    >
      <Megaphone className="h-6 w-6" />
      <span className="text-xs font-medium uppercase tracking-wider">Espaço Publicitário</span>
      <span className="text-[10px]">{LABELS[format] ?? format}</span>
    </div>
  );
}
