import { MapPin, Beer, ShoppingBag, Flag } from 'lucide-react';
import type { Venue } from '@/lib/types';

const TIPO_ICONS: Record<string, any> = {
  bar: Beer,
  loja: ShoppingBag,
  embaixada: Flag,
};

const TIPO_LABELS: Record<string, string> = {
  bar: 'Bar',
  loja: 'Loja',
  embaixada: 'Embaixada',
};

export function VenueCard({ venue }: { venue: Venue }) {
  const Icon = TIPO_ICONS[venue?.tipo ?? 'bar'] ?? MapPin;
  return (
    <article className="rounded-lg bg-card border border-border/40 p-4 transition-all hover:border-primary/20 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground truncate">{venue?.nome ?? ''}</h3>
            <span className="shrink-0 rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground uppercase">
              {TIPO_LABELS[venue?.tipo ?? ''] ?? venue?.tipo}
            </span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {venue?.endereco ?? ''} — {venue?.bairro ?? ''}
          </p>
          <p className="text-xs text-foreground/80 leading-relaxed">{venue?.descricao ?? ''}</p>
        </div>
      </div>
    </article>
  );
}
