import { getNews, getMatches, getSocial, getCortes, getVenues } from '@/lib/data';
import { HubClient } from '@/components/central/hub-client';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [newsResult, matchesResult, socialResult, cortesResult, venuesResult] = await Promise.all([
    getNews(),
    getMatches(),
    getSocial(),
    getCortes(),
    getVenues(),
  ]);

  return (
    <HubClient
      news={newsResult?.data ?? []}
      matches={matchesResult?.data ?? []}
      social={socialResult?.data ?? []}
      cortes={cortesResult?.data ?? []}
      venues={venuesResult?.data ?? []}
      newsDemo={newsResult?.isDemo ?? true}
      matchesDemo={matchesResult?.isDemo ?? true}
      socialDemo={socialResult?.isDemo ?? true}
      cortesDemo={cortesResult?.isDemo ?? true}
      venuesDemo={venuesResult?.isDemo ?? true}
    />
  );
}
