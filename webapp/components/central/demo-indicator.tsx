'use client';

import { AlertCircle } from 'lucide-react';

interface DemoIndicatorProps {
  show: boolean;
  erro?: string;
}

export function DemoIndicator({ show, erro }: DemoIndicatorProps) {
  if (!show) return null;
  return (
    <div
      title={erro ? `Fonte indisponível: ${erro}` : 'Exibindo conteúdo de demonstração'}
      className="flex items-center gap-1.5 rounded-full bg-yellow-500/15 px-3 py-1 text-[11px] font-medium text-yellow-400"
    >
      <AlertCircle className="h-3 w-3" />
      {erro ? 'Fonte indisponível' : 'Demonstração'}
    </div>
  );
}
