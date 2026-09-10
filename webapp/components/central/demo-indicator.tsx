'use client';

import { AlertCircle } from 'lucide-react';

export function DemoIndicator({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/15 px-3 py-1 text-[11px] font-medium text-yellow-400">
      <AlertCircle className="h-3 w-3" />
      Modo demonstração
    </div>
  );
}
