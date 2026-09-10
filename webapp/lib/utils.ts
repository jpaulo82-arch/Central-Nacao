import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(isoDate: string): string {
  try {
    const now = Date.now();
    const then = new Date(isoDate).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  } catch {
    return '';
  }
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function getSeloLabel(tipo: string): string {
  const map: Record<string, string> = {
    oficial: 'Oficial',
    confirmado: 'Confirmado',
    rumor: 'Rumor',
    opiniao: 'Opinião',
    meme: 'Meme',
    ugc: 'Da Torcida',
  };
  return map[tipo] ?? tipo;
}

export function getSeloClass(tipo: string): string {
  const map: Record<string, string> = {
    oficial: 'selo-oficial',
    confirmado: 'selo-confirmado',
    rumor: 'selo-rumor',
    opiniao: 'selo-opiniao',
    meme: 'selo-meme',
    ugc: 'selo-ugc',
  };
  return map[tipo] ?? 'selo-ugc';
}
