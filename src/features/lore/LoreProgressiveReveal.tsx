import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useId, useState } from 'react';

export interface LoreProgressiveRevealProps {
  paragraphs: readonly string[];
  reduced: boolean;
  expandLabel?: string;
  collapseLabel?: string;
}

export function LoreProgressiveReveal({
  paragraphs,
  reduced,
  expandLabel = 'Continue reading',
  collapseLabel = 'Show less',
}: LoreProgressiveRevealProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  if (paragraphs.length === 0) {
    return <p className="text-sm text-white/65">No narrative on file.</p>;
  }

  const [first, ...rest] = paragraphs;
  const hasMore = rest.length > 0;

  return (
    <div className="space-y-3">
      <p className="text-[0.95rem] leading-relaxed text-white/92 md:text-base">{first}</p>
      {hasMore ? (
        <>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={`${id}-more`}
            className="app-focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-white/18 bg-white/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white/88 transition hover:border-white/26 hover:bg-white/12"
          >
            {open ? collapseLabel : expandLabel}
            <span aria-hidden className="text-[0.7rem]">
              {open ? '▴' : '▾'}
            </span>
          </button>
          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                id={`${id}-more`}
                key="more"
                initial={reduced ? false : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={reduced ? { duration: 0.12 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden space-y-3"
              >
                {rest.map((p, i) => (
                  <motion.p
                    key={`${i}-${p.slice(0, 12)}`}
                    initial={reduced ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduced ? 0 : 0.04 * i, duration: 0.28 }}
                    className="text-[0.95rem] leading-relaxed text-white/88 md:text-base"
                  >
                    {p}
                  </motion.p>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}
    </div>
  );
}
