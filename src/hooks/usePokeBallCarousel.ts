import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import { addRotation, angleStepForCount, angleToSnapIndexToFront } from '../a11y/carouselAngle';
import { persistCarouselAngle, takeInitialCarouselAngle } from '../features/carousel/carouselAngleSession';
import { useMediaQuery } from './useMediaQuery';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import type { PerformanceTier } from './usePerformanceTier';

export interface PokeBallTransform {
  readonly transform: string;
  readonly active: boolean;
}

const BASE_AUTO_SPEED = 0.5;

function autoSpeedForTier(tier: PerformanceTier, narrow: boolean): number {
  if (tier === 'low') return narrow ? 0.22 : 0.3;
  if (tier === 'mid') return narrow ? 0.35 : 0.42;
  return narrow ? 0.42 : BASE_AUTO_SPEED;
}

export function usePokeBallCarousel(
  ballCount: number,
  opts: { readonly performanceTier: PerformanceTier },
): {
  transforms: PokeBallTransform[];
  carouselProps: {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  };
  reducedMotion: boolean;
  activeIndex: number;
  angleStep: number;
  rotateBy: (deltaDegrees: number) => void;
  snapToIndex: (index: number) => void;
} {
  const isNarrow = useMediaQuery('(max-width: 768px)');
  const reducedMotion = usePrefersReducedMotion();
  const radius = isNarrow ? 180 : 250;

  const [angle, setAngle] = useState(takeInitialCarouselAngle);
  const angleRef = useRef(angle);
  const draggingRef = useRef(false);
  const autoRotateRef = useRef(true);
  const startXRef = useRef(0);
  const startAngleRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const resumeTimerRef = useRef(0);
  const tabVisibleRef = useRef(typeof document === 'undefined' ? true : document.visibilityState === 'visible');
  const pointerSessionRef = useRef<AbortController | null>(null);

  const autoSpeed = useMemo(
    () => autoSpeedForTier(opts.performanceTier, isNarrow),
    [opts.performanceTier, isNarrow],
  );

  useEffect(() => {
    const onVis = () => {
      tabVisibleRef.current = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', onVis);
    onVis();
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    angleRef.current = angle;
  }, [angle]);

  useEffect(
    () => () => {
      persistCarouselAngle(angleRef.current);
      pointerSessionRef.current?.abort();
      pointerSessionRef.current = null;
    },
    [],
  );

  const scheduleResumeAuto = useCallback(() => {
    if (reducedMotion) return;
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      autoRotateRef.current = true;
    }, 2000);
  }, [reducedMotion]);

  const rotateBy = useCallback(
    (deltaDegrees: number) => {
      autoRotateRef.current = false;
      setAngle((a) => {
        const next = addRotation(a, deltaDegrees);
        angleRef.current = next;
        return next;
      });
      scheduleResumeAuto();
    },
    [scheduleResumeAuto],
  );

  const snapToIndex = useCallback(
    (index: number) => {
      autoRotateRef.current = false;
      const next = angleToSnapIndexToFront(index, ballCount);
      angleRef.current = next;
      setAngle(next);
      scheduleResumeAuto();
    },
    [ballCount, scheduleResumeAuto],
  );

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const tick = () => {
      const allowSpin = tabVisibleRef.current && !document.hidden;
      if (allowSpin && autoRotateRef.current && !draggingRef.current) {
        setAngle((prev) => {
          const next = prev + autoSpeed;
          angleRef.current = next;
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, autoSpeed]);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    pointerSessionRef.current?.abort();
    const ac = new AbortController();
    pointerSessionRef.current = ac;
    const { signal } = ac;

    draggingRef.current = true;
    autoRotateRef.current = false;
    pointerIdRef.current = event.pointerId;
    startXRef.current = event.clientX;
    startAngleRef.current = angleRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);

    const sensitivity = event.pointerType === 'touch' ? 0.6 : 0.5;

    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const delta = e.clientX - startXRef.current;
      const next = startAngleRef.current + delta * sensitivity;
      angleRef.current = next;
      setAngle(next);
    };

    const onUp = (e: PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;
      draggingRef.current = false;
      pointerIdRef.current = null;
      ac.abort();
      pointerSessionRef.current = null;
      window.setTimeout(() => {
        autoRotateRef.current = true;
      }, 2000);
    };

    window.addEventListener('pointermove', onMove, { signal });
    window.addEventListener('pointerup', onUp, { signal });
    window.addEventListener('pointercancel', onUp, { signal });
  }, []);

  const transforms: PokeBallTransform[] = useMemo(() => {
    const step = angleStepForCount(ballCount);
    return Array.from({ length: ballCount }, (_, index) => {
      const currentAngle = angle + index * step;
      const radian = (currentAngle * Math.PI) / 180;
      const x = Math.sin(radian) * radius;
      const z = Math.cos(radian) * radius;
      const rotateY = currentAngle;
      const transform = `translateX(${x}px) translateZ(${z}px) rotateY(${-rotateY}deg)`;
      const normalized = ((currentAngle % 360) + 360) % 360;
      const distanceFromFront = Math.min(normalized, 360 - normalized);
      const active = distanceFromFront < 20;
      return { transform, active };
    });
  }, [angle, ballCount, radius]);

  useEffect(() => {
    return () => window.clearTimeout(resumeTimerRef.current);
  }, []);

  const activeIndex = useMemo(() => {
    const idx = transforms.findIndex((t) => t.active);
    return idx >= 0 ? idx : 0;
  }, [transforms]);

  return {
    transforms,
    reducedMotion,
    activeIndex,
    angleStep: angleStepForCount(ballCount),
    rotateBy,
    snapToIndex,
    carouselProps: {
      onPointerEnter: () => {
        if (!reducedMotion) autoRotateRef.current = false;
      },
      onPointerLeave: () => {
        if (!reducedMotion) autoRotateRef.current = true;
      },
      onPointerDown,
    },
  };
}
