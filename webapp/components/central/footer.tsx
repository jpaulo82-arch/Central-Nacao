import { Flame } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background py-8">
      <div className="mx-auto max-w-[1200px] px-4 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          <span className="font-display text-sm font-bold tracking-tight text-foreground">
            Central da <span className="text-primary">Nação</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground max-w-md">
          Central da Nação — Veículo independente. Não somos o Flamengo.
          Conteúdo curado pela comunidade rubro-negra.
        </p>
        <p className="text-xs text-muted-foreground/60">
          © 2026 Central da Nação · Projeto de demonstração
        </p>
      </div>
    </footer>
  );
}
