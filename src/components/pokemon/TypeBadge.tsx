import type { PokemonTypeName } from '../../types/pokemon';
import { TYPE_GRADIENT } from '../../utils/typeGradients';

interface TypeBadgeProps {
  type: PokemonTypeName;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-pill)] border border-white/14 px-3 py-0.5 text-[var(--text-body-sm)] font-semibold capitalize text-white shadow-[var(--shadow-sm)] [font-family:var(--font-sans)]"
      style={{ background: TYPE_GRADIENT[type] }}
    >
      {type}
    </span>
  );
}
