'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music2 } from 'lucide-react';

const AUDIO_SRC = '/audio/canto-da-nacao.mp3';
const STORAGE_KEY = 'cdn-canto-ativo';

/**
 * Trilha de fundo: canto da torcida em loop.
 * Navegadores bloqueiam autoplay com som, então a música só começa depois
 * de um toque do usuário. A preferência fica salva no navegador.
 */
export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = 'auto';
    audioRef.current = audio;
    setReady(true);

    // Se o torcedor já tinha ligado antes, tenta retomar no primeiro toque na página
    let wanted = false;
    try {
      wanted = localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      wanted = false;
    }
    if (wanted) {
      setHint(true);
      const resume = () => {
        audio
          .play()
          .then(() => {
            setPlaying(true);
            setHint(false);
          })
          .catch(() => undefined);
        window.removeEventListener('pointerdown', resume);
        window.removeEventListener('keydown', resume);
      };
      window.addEventListener('pointerdown', resume, { once: true });
      window.addEventListener('keydown', resume, { once: true });
    }

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      try {
        localStorage.setItem(STORAGE_KEY, '0');
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
      setHint(false);
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (err) {
      console.error('[central-da-nacao] Não foi possível tocar o canto da torcida:', err);
    }
  };

  if (!ready) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
      {hint && !playing && (
        <span className="hidden sm:inline rounded-full bg-card/95 border border-border/40 px-3 py-1 text-[11px] text-muted-foreground shadow-lg">
          Toque para ligar o canto da Nação
        </span>
      )}
      <button
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? 'Pausar canto da torcida' : 'Tocar canto da torcida'}
        title={playing ? 'Pausar canto da torcida' : 'Tocar canto da torcida'}
        className={`flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-xs font-semibold shadow-lg backdrop-blur-md transition-all ${
          playing
            ? 'bg-primary text-primary-foreground border-primary/60 hover:bg-primary/90'
            : 'bg-card/95 text-foreground border-border/50 hover:border-primary/50 hover:text-primary'
        }`}
      >
        <span className="relative flex h-4 w-4 items-center justify-center">
          {playing ? (
            <>
              <Volume2 className="h-4 w-4" />
              <span className="absolute -inset-1 rounded-full border border-white/40 animate-ping" />
            </>
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </span>
        <span className="hidden sm:inline">{playing ? 'Canto da Nação' : 'Ligar o canto'}</span>
        <Music2 className="h-3.5 w-3.5 opacity-70 sm:hidden" />
      </button>
    </div>
  );
}
