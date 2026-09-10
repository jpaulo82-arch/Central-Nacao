'use client';

import { HeroBanner } from './hero-banner';
import { Header } from './header';
import { Footer } from './footer';
import { AgoraSection } from './agora-section';
import { NacaoSection } from './nacao-section';
import { CortesSection } from './cortes-section';
import { PertoSection } from './perto-section';
import { AdPlaceholder } from './ad-placeholder';
import type { NewsCard, Match, SocialPost, Corte, Venue } from '@/lib/types';

interface HubClientProps {
  news: NewsCard[];
  matches: Match[];
  social: SocialPost[];
  cortes: Corte[];
  venues: Venue[];
  newsDemo: boolean;
  matchesDemo: boolean;
  socialDemo: boolean;
  cortesDemo: boolean;
  venuesDemo: boolean;
}

export function HubClient({
  news,
  matches,
  social,
  cortes,
  venues,
  newsDemo,
  matchesDemo,
  socialDemo,
  cortesDemo,
  venuesDemo,
}: HubClientProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <HeroBanner />

      {/* Leaderboard Ad */}
      <div className="mx-auto max-w-[1200px] px-4 pt-6">
        <AdPlaceholder format="leaderboard" />
      </div>

      <div className="mx-auto max-w-[1200px] px-4">
        <div className="flex gap-8">
          {/* Main content */}
          <main className="flex-1 min-w-0">
            <AgoraSection news={news ?? []} matches={matches ?? []} isDemo={newsDemo || matchesDemo} />

            {/* Ad between sections */}
            <AdPlaceholder format="retangulo" className="my-4" />

            <NacaoSection posts={social ?? []} isDemo={socialDemo} />

            {/* Ad between sections */}
            <AdPlaceholder format="retangulo" className="my-4" />

            <CortesSection cortes={cortes ?? []} isDemo={cortesDemo} />

            {/* Ad between sections */}
            <AdPlaceholder format="retangulo" className="my-4" />

            <PertoSection venues={venues ?? []} isDemo={venuesDemo} />
          </main>

          {/* Desktop sidebar ads */}
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
