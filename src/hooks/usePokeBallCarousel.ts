import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import { addRotation, angleStepForCount, angleToSnapIndexToFront } from '../a11y/carouselAngle';
import { useMediaQuery } from './useMediaQuery';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface PokeBallTransform {
  readonly transform: string;
  readonly active: boolean;
}

const AUTO_SPEED = 0.5;

export function usePokeBallCarousel(ballCount: number): {
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

  const [angle, setAngle] = useState(0);
  const angleRef = useRef(0);
  const draggingRef = useRef(false);
  const autoRotateRef = useRef(true);
  const startXRef = useRef(0);
  const startAngleRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const resumeTimerRef = useRef(0);

  const angleStep = useMemo(() => angleStepForCount(ballCount), [ballCount]);

  useEffect(() => {
    angleRef.current = angle;
  }, [angle]);

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
      setAngle((a) => addRotation(a, deltaDegrees));
      scheduleResumeAuto();
    },
    [scheduleResumeAuto],
  );

  const snapToIndex = useCallback(
    (index: number) => {
      autoRotateRef.current = false;
      setAngle(angleToSnapIndexToFront(index, ballCount));
      scheduleResumeAuto();
    },
    [ballCount, scheduleResumeAuto],
  );

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const tick = () => {
      if (autoRotateRef.current && !draggingRef.current) {
        setAngle((prev) => {
          const next = prev + AUTO_SPEED;
          angleRef.current = next;
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
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
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.setTimeout(() => {
        autoRotateRef.current = true;
      }, 2000);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }, []);

  const transforms: PokeBallTransform[] = useMemo(() => {
    const step = angleStep;
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
  }, [angle, ballCount, radius, angleStep]);

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
    angleStep,
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
