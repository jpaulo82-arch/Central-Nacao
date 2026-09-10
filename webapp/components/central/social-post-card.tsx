'use client';

import { Heart, ExternalLink } from 'lucide-react';
import type { SocialPost } from '@/lib/types';
import { formatRelativeTime, formatNumber } from '@/lib/utils';

const PLATFORM_COLORS: Record<string, string> = {
  twitter: 'text-sky-400',
  instagram: 'text-pink-400',
  tiktok: 'text-cyan-300',
  youtube: 'text-red-400',
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: '𝕏',
  instagram: 'IG',
  tiktok: 'TikTok',
  youtube: 'YT',
};

export function SocialPostCard({ post }: { post: SocialPost }) {
  const platform = post?.plataforma ?? 'twitter';
  return (
    <article className="rounded-lg bg-card border border-border/40 p-4 transition-all hover:border-primary/20 hover:shadow-md">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${PLATFORM_COLORS[platform] ?? 'text-muted-foreground'}`}>
            {PLATFORM_LABELS[platform] ?? platform}
          </span>
          <span className="text-xs font-semibold text-foreground">{post?.autor ?? ''}</span>
          <span className="text-[10px] text-muted-foreground">{post?.handle ?? ''}</span>
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {formatRelativeTime(post?.timestamp ?? '')}
        </span>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed mb-3">{post?.texto ?? ''}</p>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Heart className="h-3 w-3" /> {formatNumber(post?.curtidas ?? 0)}
        </span>
        <a
          href={post?.url_post ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
        >
          Ver post <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </article>
  );
}
