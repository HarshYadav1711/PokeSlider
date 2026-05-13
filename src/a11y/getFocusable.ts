const FOCUSABLE_SELECTOR = [
  'a[href]:not([disabled])',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isInertOrHidden(el: HTMLElement): boolean {
  if (el.closest('[inert]')) return true;
  const hidden = el.closest('[aria-hidden="true"]');
  return hidden !== null && hidden !== el;
}

/** Returns visible, enabled focusable elements in DOM order inside `root`. */
export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  const nodes = root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  const out: HTMLElement[] = [];
  nodes.forEach((el) => {
    if (isInertOrHidden(el)) return;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return;
    if (el.tabIndex < 0) return;
    out.push(el);
  });
  return out;
}
