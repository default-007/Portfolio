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
});
