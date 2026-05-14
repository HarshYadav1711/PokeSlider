import type { PokeBallRarityTier } from '../../data/pokeballs';

export function rarityTierLabel(tier: PokeBallRarityTier): string {
  switch (tier) {
    case 'volume':
      return 'Mass-market staple';
    case 'premium':
      return 'Premium finish';
    case 'elite':
      return 'Elite performance';
    case 'specialty':
      return 'Situational specialist';
    case 'artifact':
      return 'Mythic artifact';
  }
}

export function rarityTierAccentClass(tier: PokeBallRarityTier): string {
  switch (tier) {
    case 'volume':
      return 'from-slate-200/70 to-slate-400/40';
    case 'premium':
      return 'from-sky-200/70 to-indigo-400/45';
    case 'elite':
      return 'from-amber-200/80 to-orange-500/50';
    case 'specialty':
      return 'from-emerald-200/70 to-teal-500/45';
    case 'artifact':
      return 'from-fuchsia-300/85 to-violet-600/55';
  }
}
