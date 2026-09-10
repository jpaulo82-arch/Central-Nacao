import { Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdPlaceholderProps {
  format: 'leaderboard' | 'retangulo' | 'sidebar';
  className?: string;
}

const SIZES: Record<string, string> = {
  leaderboard: 'w-full h-[90px] md:h-[90px]',
  retangulo: 'w-full h-[200px] md:h-[250px]',
  sidebar: 'w-full h-[600px]',
};

const LABELS: Record<string, string> = {
  leaderboard: 'Leaderboard 728×90',
  retangulo: 'Retângulo Médio 300×250',
  sidebar: 'Sidebar 300×600',
};

export function AdPlaceholder({ format, className }: AdPlaceholderProps) {
  return (
    <div
      className={cn(
        'ad-placeholder rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground/50',
        SIZES[format] ?? SIZES.retangulo,
        className,
      )}
    >
      <Megaphone className="h-6 w-6" />
      <span className="text-xs font-medium uppercase tracking-wider">Espaço Publicitário</span>
      <span className="text-[10px]">{LABELS[format] ?? format}</span>
    </div>
  );
}
