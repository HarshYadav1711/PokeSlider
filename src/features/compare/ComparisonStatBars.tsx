import { motion } from 'motion/react';

import type { PokemonComparisonProfile } from '../../types/pokemon';

interface ComparisonStatBarsProps {
  a: PokemonComparisonProfile;
  b: PokemonComparisonProfile;
}

export function ComparisonStatBars({ a, b }: ComparisonStatBarsProps) {
  const byName = (p: PokemonComparisonProfile) => new Map(p.stats.map((s) => [s.name.toLowerCase(), s.value]));
  const names = [...new Set([...a.stats.map((s) => s.name), ...b.stats.map((s) => s.name)])].sort();

  return (
    <div className="space-y-3" aria-label="Base stat comparison">
      {names.map((name) => {
        const va = byName(a).get(name.toLowerCase()) ?? 0;
        const vb = byName(b).get(name.toLowerCase()) ?? 0;
        const max = Math.max(va, vb, 1);
        const wa = (va / max) * 100;
        const wb = (vb / max) * 100;
        const winner = va > vb ? 'a' : vb > va ? 'b' : 'tie';
        return (
          <div key={name} className="grid grid-cols-1 gap-1.5 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-3">
            <div className="order-1 md:order-none">
              <div className="mb-1 flex justify-between text-xs text-white/70">
                <span className="capitalize">{name}</span>
                <span className={winner === 'a' ? 'font-bold text-emerald-200' : ''}>{va}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${wa}%` }}
                  transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-400/90 to-fuchsia-400/80"
                />
              </div>
            </div>
            <div
              className="order-3 hidden text-center text-[10px] font-bold uppercase tracking-wider text-white/40 md:order-none md:block"
              aria-hidden
            >
              VS
            </div>
            <div className="order-2 md:order-none">
              <div className="mb-1 flex justify-between text-xs text-white/70">
                <span className="capitalize md:hidden">{name}</span>
                <span className={winner === 'b' ? 'ml-auto font-bold text-emerald-200' : 'ml-auto'}>{vb}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${wb}%` }}
                  transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.04 }}
                  className="h-full rounded-full bg-gradient-to-r from-sky-400/90 to-cyan-400/80"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
