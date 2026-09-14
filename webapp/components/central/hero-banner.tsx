'use client';

import Image from 'next/image';
import { Flame, ChevronDown } from 'lucide-react';

export function HeroBanner() {
  const scrollToContent = () => {
    const el = document.getElementById('agora');
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Image
          src="https://www.binghamtonhomepage.com/wp-content/uploads/sites/79/2026/06/6a414705d859d3.43904097.jpeg?w=2560&h=1440&crop=1"
          alt="Torcida vibrando no estádio"
          fill
          className="object-cover opacity-40"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 py-16 md:py-24 flex flex-col items-center text-center gap-5">
        <div className="flex items-center gap-3">
          <Flame className="h-10 w-10 md:h-12 md:w-12 text-primary" />
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Central da <span className="text-primary">Nação</span>
          </h1>
        </div>

        <p className="text-sm md:text-base text-muted-foreground max-w-lg">
          O hub independente da torcida rubro-negra. Notícias, lances, memes
          e tudo que movimenta a Nação — 24 horas por dia.
        </p>

        <button
          onClick={scrollToContent}
          className="mt-4 flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <span className="text-xs font-medium">Explorar</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </button>
      </div>
    </div>
  );
}
