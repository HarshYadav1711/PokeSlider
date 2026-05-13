import { forwardRef, type ReactNode } from 'react';

/** Stable surface for future image export (e.g. html-to-canvas) — no hidden layout. */
export const ComparisonShareSurface = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  function ComparisonShareSurface({ children, className = '' }, ref) {
    return (
      <div
        ref={ref}
        data-comparison-export="true"
        className={['rounded-3xl border border-white/15 bg-[#0f172a]/95 p-6 shadow-2xl', className].join(' ')}
      >
        {children}
      </div>
    );
  },
);
