import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import { useMediaQuery } from './useMediaQuery';

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
} {
  const isNarrow = useMediaQuery('(max-width: 768px)');
  const radius = isNarrow ? 180 : 250;

  const [angle, setAngle] = useState(0);
  const angleRef = useRef(0);
  const draggingRef = useRef(false);
  const autoRotateRef = useRef(true);
  const startXRef = useRef(0);
  const startAngleRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    angleRef.current = angle;
  }, [angle]);

  useEffect(() => {
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
  }, []);

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

  const angleStep = 360 / ballCount;
  const transforms: PokeBallTransform[] = Array.from({ length: ballCount }, (_, index) => {
    const currentAngle = angle + index * angleStep;
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

  return {
    transforms,
    carouselProps: {
      onPointerEnter: () => {
        autoRotateRef.current = false;
      },
      onPointerLeave: () => {
        autoRotateRef.current = true;
      },
      onPointerDown,
    },
  };
}
