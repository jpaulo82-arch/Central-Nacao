'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeroBanner } from './hero-banner';
import { Header } from './header';
import { Footer } from './footer';
import { AgoraSection } from './agora-section';
import { NacaoSection } from './nacao-section';
import { CortesSection } from './cortes-section';
import { PertoSection } from './perto-section';
import { AdPlaceholder } from './ad-placeholder';
import { StatusBar } from './status-bar';
import { GaleriaNacao } from './galeria-nacao';
import { MusicPlayer } from './music-player';
import type { NewsCard, Match, SocialPost, Corte, Venue, Classificacao } from '@/lib/types';

const REFRESH_MS = 5 * 60 * 1000; // atualiza os dados a cada 5 minutos

interface HubClientProps {
  news: NewsCard[];
  matches: Match[];
  social: SocialPost[];
  cortes: Corte[];
  venues: Venue[];
  classificacao: Classificacao | null;
  newsDemo: boolean;
  matchesDemo: boolean;
  socialDemo: boolean;
  cortesDemo: boolean;
  venuesDemo: boolean;
  erros: Partial<Record<'news' | 'matches' | 'social' | 'cortes' | 'venues', string | undefined>>;
  payloadGeneratedAt: string | null;
  supabaseConfigured: boolean;
  renderedAt: string;
}

export function HubClient({
  news,
  matches,
  social,
  cortes,
  venues,
  classificacao,
  newsDemo,
  matchesDemo,
  socialDemo,
  cortesDemo,
  venuesDemo,
  erros,
  payloadGeneratedAt,
  supabaseConfigured,
  renderedAt,
}: HubClientProps) {
  const router = useRouter();

  // Auto-refresh: busca dados novos no servidor sem recarregar a página inteira
  useEffect(() => {
    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        router.refresh();
      }
    }, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [router]);

  const ultimaNoticia = (news ?? []).reduce<string | null>((acc, n) => {
    if (!n?.timestamp) return acc;
    return !acc || n.timestamp > acc ? n.timestamp : acc;
  }, null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <HeroBanner />

      <StatusBar
        supabaseConfigured={supabaseConfigured}
        renderedAt={renderedAt}
        payloadGeneratedAt={payloadGeneratedAt}
        ultimaNoticia={ultimaNoticia}
        onRefresh={() => router.refresh()}
      />

      {/* Leaderboard Ad */}
      <div className="mx-auto max-w-[1200px] px-4 pt-6">
        <AdPlaceholder format="leaderboard" creative="bar" />
      </div>

      <div className="mx-auto max-w-[1200px] px-4">
        <div className="flex gap-8">
          {/* Main content */}
          <main className="flex-1 min-w-0">
            <AgoraSection
              news={news ?? []}
              matches={matches ?? []}
              classificacao={classificacao}
              isDemo={newsDemo || matchesDemo}
              erro={erros?.news ?? erros?.matches}
            />

            <AdPlaceholder format="retangulo" creative="manto" className="my-4" />

            <GaleriaNacao />

            <NacaoSection posts={social ?? []} isDemo={socialDemo} erro={erros?.social} />

            <AdPlaceholder format="retangulo" creative="delivery" className="my-4" />

            <CortesSection cortes={cortes ?? []} isDemo={cortesDemo} erro={erros?.cortes} />

            <AdPlaceholder format="retangulo" creative="bar" className="my-4" />

            <PertoSection venues={venues ?? []} isDemo={venuesDemo} erro={erros?.venues} />
          </main>

          {/* Desktop sidebar ads */}
          <aside className="hidden lg:block w-[300px] shrink-0 pt-8 space-y-6">
            <div className="sticky top-20 space-y-6">
              <AdPlaceholder format="sidebar" creative="seguros" />
              <AdPlaceholder format="retangulo" creative="delivery" />
            </div>
          </aside>
        </div>
      </div>

      <Footer />
      <MusicPlayer />
    </div>
  );
}
