import { getHubData } from '@/lib/data';
import { HubClient } from '@/components/central/hub-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const hub = await getHubData();
  // Carimbo de renderização do servidor (componente de servidor; o cliente só o exibe após montar)
  const renderedAt = hub.renderedAt;

  return (
    <HubClient
      news={hub.news.data ?? []}
      matches={hub.matches.data ?? []}
      social={hub.social.data ?? []}
      cortes={hub.cortes.data ?? []}
      venues={hub.venues.data ?? []}
      classificacao={hub.classificacao}
      newsDemo={hub.news.isDemo}
      matchesDemo={hub.matches.isDemo}
      socialDemo={hub.social.isDemo}
      cortesDemo={hub.cortes.isDemo}
      venuesDemo={hub.venues.isDemo}
      erros={{
        news: hub.news.error,
        matches: hub.matches.error,
        social: hub.social.error,
        cortes: hub.cortes.error,
        venues: hub.venues.error,
      }}
      payloadGeneratedAt={hub.payloadGeneratedAt}
      supabaseConfigured={hub.supabaseConfigured}
      renderedAt={renderedAt}
    />
  );
}
