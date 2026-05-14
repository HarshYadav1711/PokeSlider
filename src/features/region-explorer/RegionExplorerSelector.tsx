import { memo, useId } from 'react';

import type { RegionDefinition, RegionId } from './data/regionTypes';

interface RegionExplorerSelectorProps {
  readonly regions: readonly RegionDefinition[];
  readonly value: RegionId;
  readonly onChange: (id: RegionId) => void;
}

export const RegionExplorerSelector = memo(function RegionExplorerSelector({
  regions,
  value,
  onChange,
}: RegionExplorerSelectorProps) {
  const labelId = useId();

  return (
    <div className="shrink-0 border-b border-white/10 px-4 py-3 md:px-5">
      <p id={labelId} className="mb-2 text-[var(--text-eyebrow)] font-semibold uppercase tracking-[0.12em] text-white/55">
        Region
      </p>
      <div
        role="tablist"
        aria-labelledby={labelId}
        className="flex max-w-full gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {regions.map((r) => {
          const selected = r.id === value;
          return (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={
                selected
                  ? 'app-focus-ring shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold shadow-[var(--shadow-sm)] md:min-h-11 md:px-4'
                  : 'app-focus-ring shrink-0 rounded-full border border-white/14 bg-white/[0.04] px-3.5 py-2 text-sm font-semibold text-white/80 hover:bg-white/[0.08] md:min-h-11 md:px-4'
              }
              style={
                selected
                  ? {
                      borderColor: 'color-mix(in srgb, var(--rex-accent) 55%, white)',
                      backgroundColor: 'color-mix(in srgb, var(--rex-accent) 18%, rgb(8 10 18 / 0.65))',
                      color: 'var(--rex-accent-soft)',
                    }
                  : undefined
              }
              onClick={() => onChange(r.id)}
            >
              {r.name}
            </button>
          );
        })}
      </div>
    </div>
  );
});
