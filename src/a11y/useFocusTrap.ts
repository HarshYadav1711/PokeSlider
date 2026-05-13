import { useEffect, useRef } from 'react';

import { getFocusableElements } from './getFocusable';

export interface UseFocusTrapOptions {
  /** When true, trap Tab within `containerRef` and restore focus on deactivate. */
  readonly active: boolean;
  readonly containerRef: React.RefObject<HTMLElement | null>;
  /** If set, this element is focused first when the trap activates (must be inside the container). */
  readonly initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Prefer an element matching this selector inside the container (e.g. `[data-initial-focus]`). */
  readonly initialFocusSelector?: string;
}

/**
 * Minimal focus trap: Tab / Shift+Tab cycles focusables inside the container; restores prior focus when `active` becomes false.
 * Escape is handled by app-level shortcuts, not here.
 */
export function useFocusTrap({
  active,
  containerRef,
  initialFocusRef,
  initialFocusSelector,
}: UseFocusTrapOptions): void {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) {
      const prev = previouslyFocusedRef.current;
      previouslyFocusedRef.current = null;
      if (prev && document.contains(prev)) {
        queueMicrotask(() => prev.focus());
      }
      return;
    }

    const root = containerRef.current;
    if (!root) return;

    previouslyFocusedRef.current = (document.activeElement as HTMLElement) ?? null;

    const runInitialFocus = () => {
      const fromRef = initialFocusRef?.current;
      if (fromRef && root.contains(fromRef)) {
        fromRef.focus();
        return;
      }
      if (initialFocusSelector) {
        const picked = root.querySelector<HTMLElement>(initialFocusSelector);
        if (picked) {
          picked.focus();
          return;
        }
      }
      getFocusableElements(root)[0]?.focus();
    };

    queueMicrotask(runInitialFocus);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || e.defaultPrevented) return;
      const ae = document.activeElement;
      if (!ae || !root.contains(ae)) return;
      const list = getFocusableElements(root);
      if (list.length === 0) return;
      const first = list[0]!;
      const last = list[list.length - 1]!;
      const activeEl = ae as HTMLElement;
      if (list.indexOf(activeEl) < 0) {
        if (e.shiftKey) {
          e.preventDefault();
          last.focus();
        } else {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      if (e.shiftKey) {
        if (activeEl === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [active, containerRef, initialFocusRef, initialFocusSelector]);
}
