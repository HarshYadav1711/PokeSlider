import { useEffect, useRef, useState } from 'react';

/**
 * Dev-only: lightweight FPS / frame-time readout. Disabled in production builds.
 */
export function PerformanceDiagnostics() {
  const [fps, setFps] = useState(0);
  const [ms, setMs] = useState(0);
  const lastRef = useRef(performance.now());
  const framesRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const loop = (now: number) => {
      framesRef.current += 1;
      const elapsed = now - lastRef.current;
      if (elapsed >= 750) {
        const instFps = (framesRef.current / elapsed) * 1000;
        setFps(Math.round(instFps));
        setMs(Math.round((elapsed / framesRef.current) * 10) / 10);
        framesRef.current = 0;
        lastRef.current = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      className="pointer-events-none fixed bottom-2 left-2 z-[9998] rounded-md border border-white/15 bg-black/55 px-2 py-1 font-mono text-[10px] text-white/80 tabular-nums backdrop-blur-sm"
      aria-hidden
    >
      ~{fps} fps · {ms} ms/frame
    </div>
  );
}
