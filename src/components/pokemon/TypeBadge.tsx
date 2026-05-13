import type { PokemonTypeName } from '../../types/pokemon';
import { TYPE_GRADIENT } from '../../utils/typeGradients';

interface TypeBadgeProps {
  type: PokemonTypeName;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-full border-2 border-white/20 px-4 py-1 text-sm font-bold capitalize text-white shadow-md"
      style={{ background: TYPE_GRADIENT[type] }}
    >
      {type}
    </span>
  );
}
