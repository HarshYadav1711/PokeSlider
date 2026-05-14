import type { DiscoveryRelationship } from './discoveryRecommendationTypes';

interface DiscoveryRelationshipOrbitProps {
  readonly relationships: readonly DiscoveryRelationship[];
}

/** Compact constellation motif — line opacity encodes relationship strength. */
export function DiscoveryRelationshipOrbit({ relationships }: DiscoveryRelationshipOrbitProps) {
  if (relationships.length === 0) return null;

  const label = relationships.map((r) => `${r.label} (${Math.round(r.strength * 100)}%)`).join('; ');

  const w = 76;
  const h = 40;
  const cx = 20;
  const cy = h / 2;
  const slice = relationships.slice(0, 4);

  return (
    <svg
      width={w}
      height={h}
      className="shrink-0 text-violet-200/90"
      role="img"
      aria-label={`Relationship cues: ${label}`}
    >
      <title>{label}</title>
      <circle cx={cx} cy={cy} r={6} className="fill-white/80" />
      {slice.map((rel, i) => {
        const angle = (i / Math.max(slice.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * 24;
        const y = cy + Math.sin(angle) * 14;
        const op = 0.22 + rel.strength * 0.62;
        return (
          <g key={`${rel.kind}-${i}`}>
            <line
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth={1.5}
              strokeOpacity={op}
              strokeLinecap="round"
            />
            <circle cx={x} cy={y} r={3.5} fill="currentColor" fillOpacity={0.35 + rel.strength * 0.55} />
          </g>
        );
      })}
    </svg>
  );
}
