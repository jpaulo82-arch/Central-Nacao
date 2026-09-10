'use client';

import { Users } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { SocialPostCard } from './social-post-card';
import { DemoIndicator } from './demo-indicator';
import type { SocialPost } from '@/lib/types';

interface NacaoSectionProps {
  posts: SocialPost[];
  isDemo: boolean;
}

export function NacaoSection({ posts, isDemo }: NacaoSectionProps) {
  return (
    <SectionWrapper
      id="nacao"
      title="Nação"
      subtitle="O pulso das redes — voz da torcida"
      icon={Users}
      rightSlot={<DemoIndicator show={isDemo} />}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {(posts ?? []).map((post: SocialPost, idx: number) => (
          <SocialPostCard key={post?.id ?? `post-${idx}`} post={post} />
        ))}
      </div>
    </SectionWrapper>
  );
}
