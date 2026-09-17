'use client';

import Image from 'next/image';
import { IMG } from '@/lib/fixtures';

const FOTOS = [
  { src: IMG.bandeira, alt: 'Bandeiras rubro-negras tremulando na arquibancada', legenda: 'Bandeiras ao vento' },
  { src: IMG.camisa, alt: 'Camisa listrada vermelha e preta do Flamengo', legenda: 'O Manto' },
  { src: IMG.gol, alt: 'Jogadores do Flamengo comemorando gol', legenda: 'Festa do gol' },
  { src: IMG.acao, alt: 'Jogador do Flamengo dominando a bola em jogo', legenda: 'Em campo' },
  { src: IMG.mosaico, alt: 'Mosaico e sinalizadores da torcida do Flamengo', legenda: 'Mosaico da Nação' },
  { src: IMG.rua, alt: 'Torcida do Flamengo em festa na rua', legenda: 'A rua é nossa' },
];

/** Faixa de fotos rubro-negras — rolagem horizontal no mobile, grade no desktop. */
export function GaleriaNacao() {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">A Nação em imagens</p>
        <span className="text-[10px] text-muted-foreground/60">Fotos ilustrativas</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-6 md:overflow-visible">
        {FOTOS.map((f) => (
          <figure
            key={f.src}
            className="group relative aspect-[4/5] w-[42%] shrink-0 snap-start overflow-hidden rounded-lg bg-muted md:w-auto"
          >
            <Image
              src={f.src}
              alt={f.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 42vw, 180px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <figcaption className="absolute bottom-2 left-2 right-2 text-[11px] font-semibold text-white drop-shadow">
              {f.legenda}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
