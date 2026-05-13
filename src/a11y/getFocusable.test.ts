import { describe, expect, it } from 'vitest';

import { getFocusableElements } from './getFocusable';

describe('getFocusableElements', () => {
  it('returns buttons in order and skips disabled', () => {
    document.body.innerHTML = `
      <div id="root">
        <button type="button">One</button>
        <button type="button" disabled>Hidden</button>
        <button type="button">Two</button>
      </div>
    `;
    const root = document.getElementById('root') as HTMLElement;
    const list = getFocusableElements(root);
    expect(list).toHaveLength(2);
    expect(list[0]?.textContent).toBe('One');
    expect(list[1]?.textContent).toBe('Two');
  });

  it('skips elements under aria-hidden', () => {
    document.body.innerHTML = `
      <div id="root">
        <button type="button">Outer</button>
        <div aria-hidden="true"><button type="button">Inner</button></div>
      </div>
    `;
    const root = document.getElementById('root') as HTMLElement;
    const list = getFocusableElements(root);
    expect(list.map((e) => e.textContent)).toEqual(['Outer']);
  });
});
