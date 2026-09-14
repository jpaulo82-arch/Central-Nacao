import { getHomeData } from '@/lib/data';
import { HubClient } from '@/components/central/hub-client';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const homeData = await getHomeData();

  return (
    <HubClient
      news={homeData.news}
      matches={homeData.matches}
      nacaoMatches={homeData.nacaoMatches}
      nacaoClassificacao={homeData.nacaoClassificacao}
      cortes={homeData.cortes}
      venues={homeData.venues}
      errors={homeData.errors}
    />
  );
}
