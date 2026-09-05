import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { useLayoutEffect, useRef } from 'react';

const { fromTo } = vi.hoisted(() => ({ fromTo: vi.fn() }));
vi.mock('gsap', () => ({
  gsap: {
    fromTo,
    set: vi.fn(),
    registerPlugin: vi.fn(),
    utils: { toArray: (sel: string) => Array.from(document.querySelectorAll(sel)) },
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { update: vi.fn() } }));
// The real useGSAP runs its callback in useIsomorphicLayoutEffect (a
// layout effect, scoping queries to committed DOM, and owning cleanup). We
// only care that the callback runs against a committed tree, so we mimic
// that timing with useLayoutEffect rather than invoking the callback
// mid-render, when the scope's children don't exist yet.
vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void) => { useLayoutEffect(fn); },
}));

import { useReveal } from './useReveal';

const Probe = () => {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  return <div ref={ref}><p data-anim="fade">hello</p></div>;
};

// Two separate parents, each with their own data-anim="check" rows — the
// design groups by parentElement (lines 628-640), so this must produce two
// independently-triggered groups rather than one group of three rows.
const CheckProbe = () => {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  return (
    <div ref={ref}>
      <div data-testid="group-a">
        <div data-anim="check">
          <span>✓</span>
          <p>a1</p>
        </div>
        <div data-anim="check">
          <span>✓</span>
          <p>a2</p>
        </div>
      </div>
      <div data-testid="group-b">
        <div data-anim="check">
          <span>→</span>
          <p>b1</p>
        </div>
      </div>
    </div>
  );
};

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('useReveal', () => {
  it('registers no tweens when reduced motion is preferred', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    render(<Probe />);
    expect(fromTo).not.toHaveBeenCalled();
  });

  it('animates from a visible-safe fromTo when motion is allowed', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
    render(<Probe />);
    expect(fromTo).toHaveBeenCalled();
    const [, , to] = fromTo.mock.calls[0];
    expect(to.immediateRender).toBe(false);
  });

  describe('data-anim="check" rows', () => {
    it('groups check rows by parentElement into separate tweens', () => {
      vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
      const { getByTestId } = render(<CheckProbe />);
      const groupA = getByTestId('group-a');
      const groupB = getByTestId('group-b');
      const rowsOf = (el: HTMLElement) => Array.from(el.querySelectorAll('[data-anim="check"]'));

      // One call whose target array is exactly group A's two rows, and a
      // separate call whose target array is exactly group B's one row —
      // never a single call mixing rows from both parents.
      const rowTweenTargets = fromTo.mock.calls
        .map(([target]) => target)
        .filter((target) => Array.isArray(target) && target[0]?.getAttribute?.('data-anim') === 'check');

      expect(rowTweenTargets).toContainEqual(rowsOf(groupA));
      expect(rowTweenTargets).toContainEqual(rowsOf(groupB));
      expect(rowTweenTargets).not.toContainEqual([...rowsOf(groupA), ...rowsOf(groupB)]);
    });

    it('pops each row\'s first child (the glyph) with its own fromTo, immediateRender false', () => {
      vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
      const { getByTestId } = render(<CheckProbe />);
      const groupA = getByTestId('group-a');
      const glyphsA = Array.from(groupA.querySelectorAll('[data-anim="check"]')).map(
        (row) => row.firstElementChild,
      );

      const glyphCall = fromTo.mock.calls.find(
        ([target]) => Array.isArray(target) && target[0] === glyphsA[0],
      );
      expect(glyphCall).toBeDefined();
      const [, from, to] = glyphCall!;
      expect(from).toMatchObject({ scale: 0.2, opacity: 0 });
      expect(to.immediateRender).toBe(false);
    });

    it('registers no check tweens when reduced motion is preferred', () => {
      vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
      render(<CheckProbe />);
      expect(fromTo).not.toHaveBeenCalled();
    });
  });
});
