'use client';

import { AlertCircle } from 'lucide-react';
import { HeroBanner } from './hero-banner';
import { Header } from './header';
import { Footer } from './footer';
import { AgoraSection } from './agora-section';
import { NacaoSection } from './nacao-section';
import { CortesSection } from './cortes-section';
import { PertoSection } from './perto-section';
import { AdPlaceholder } from './ad-placeholder';
import type { NewsCard, Match, Corte, Venue } from '@/lib/types';

interface HubClientProps {
  news: NewsCard[];
  matches: Match[];
  nacaoMatches: Match[];
  nacaoClassificacao: string | null;
  cortes: Corte[];
  venues: Venue[];
  errors: string[];
}

export function HubClient({
  news,
  matches,
  nacaoMatches,
  nacaoClassificacao,
  cortes,
  venues,
  errors,
}: HubClientProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <HeroBanner />

      {(errors ?? []).length > 0 && (
        <div className="mx-auto mt-4 max-w-[1200px] px-4">
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Algumas seções podem estar vazias agora: {(errors ?? []).join(' ')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1200px] px-4 pt-6">
        <AdPlaceholder format="leaderboard" />
      </div>

      <div className="mx-auto max-w-[1200px] px-4">
        <div className="flex gap-8">
          <main className="flex-1 min-w-0">
            <AgoraSection news={news ?? []} matches={matches ?? []} />

            <AdPlaceholder format="retangulo" className="my-4" />

            <NacaoSection matches={nacaoMatches ?? []} classificacaoLabel={nacaoClassificacao} />

            <AdPlaceholder format="retangulo" className="my-4" />

            <CortesSection cortes={cortes ?? []} />

            <AdPlaceholder format="retangulo" className="my-4" />

            <PertoSection venues={venues ?? []} />
          </main>

          <aside className="hidden lg:block w-[300px] shrink-0 pt-8 space-y-6">
            <div className="sticky top-20 space-y-6">
              <AdPlaceholder format="sidebar" />
              <AdPlaceholder format="retangulo" />
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
