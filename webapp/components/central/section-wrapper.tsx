'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionWrapperProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  children: ReactNode;
  rightSlot?: ReactNode;
}

export function SectionWrapper({ id, title, subtitle, icon: Icon, children, rightSlot }: SectionWrapperProps) {
  return (
    <section id={id} className="scroll-mt-16 py-8 md:py-12">
      <div>
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-foreground">{title}</h2>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
              </div>
            </div>
            {rightSlot}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
