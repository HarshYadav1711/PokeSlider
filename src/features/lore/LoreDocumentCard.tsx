import { motion } from 'motion/react';
import type { ReactNode } from 'react';

import type { LoreCardTone } from './pokemonLoreViewModel';

const toneClass: Record<LoreCardTone, { frame: string; kicker: string; glow: string }> = {
  violet: {
    frame: 'border-violet-300/30 bg-[rgb(18_12_32/0.45)] shadow-[0_0_0_1px_rgba(167,139,250,0.12)]',
    kicker: 'text-violet-200/90',
    glow: 'from-violet-500/20 via-transparent to-transparent',
  },
  amber: {
    frame: 'border-amber-300/28 bg-[rgb(28_18_8/0.4)] shadow-[0_0_0_1px_rgba(251,191,36,0.1)]',
    kicker: 'text-amber-200/90',
    glow: 'from-amber-400/18 via-transparent to-transparent',
  },
  emerald: {
    frame: 'border-emerald-300/28 bg-[rgb(8_24_18/0.38)] shadow-[0_0_0_1px_rgba(52,211,153,0.1)]',
    kicker: 'text-emerald-200/90',
    glow: 'from-emerald-400/16 via-transparent to-transparent',
  },
  sky: {
    frame: 'border-sky-300/28 bg-[rgb(8_16_28/0.42)] shadow-[0_0_0_1px_rgba(56,189,248,0.1)]',
    kicker: 'text-sky-200/90',
    glow: 'from-sky-400/16 via-transparent to-transparent',
  },
};

export interface LoreDocumentCardProps {
  tone: LoreCardTone;
  kicker: string;
  title: string;
  subtitle?: string;
  reduced: boolean;
  children: ReactNode;
}

export function LoreDocumentCard({ tone, kicker, title, subtitle, reduced, children }: LoreDocumentCardProps) {
  const tc = toneClass[tone];
  return (
    <motion.article
      layout={!reduced}
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0.01 } : { duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'relative overflow-hidden rounded-[var(--radius-3xl)] border backdrop-blur-md',
        'p-6 md:p-7',
        tc.frame,
      ].join(' ')}
    >
      <div
        aria-hidden
        className={['pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90', tc.glow].join(' ')}
      />
      <div className="relative space-y-4">
        <header className="space-y-1 border-b border-white/10 pb-4">
          <p className={['text-[0.65rem] font-black uppercase tracking-[0.22em]', tc.kicker].join(' ')}>{kicker}</p>
          <h3 className="text-xl font-black tracking-tight text-white [font-family:var(--font-display)] md:text-2xl">
            {title}
          </h3>
          {subtitle ? <p className="text-sm text-white/72">{subtitle}</p> : null}
        </header>
        {children}
      </div>
    </motion.article>
  );
}
