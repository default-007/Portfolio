import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { useLayoutEffect } from 'react';

vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    registerPlugin: vi.fn(),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { update: vi.fn() } }));
// The real useGSAP runs its callback in useIsomorphicLayoutEffect; mimic
// that with useLayoutEffect rather than useEffect.
vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void) => { useLayoutEffect(fn); },
}));

import { gsap } from 'gsap';
import { useCounter } from './useCounter';

const Probe = ({ value, decimals }: { value: number; decimals?: number }) => {
  const ref = useCounter(value, decimals);
  return <span ref={ref} />;
};

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('useCounter', () => {
  it('writes the final integer value immediately under reduced motion, with no decimal point', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    const { container } = render(<Probe value={244} />);
    expect(container.querySelector('span')!.textContent).toBe('244');
    // No ScrollTrigger-bound tween should be created under reduced motion —
    // otherwise one is left registered for a value that was already set.
    expect(gsap.to).not.toHaveBeenCalled();
  });

  it('honours decimals under reduced motion (99.5 with one decimal renders "99.5")', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    const { container } = render(<Probe value={99.5} decimals={1} />);
    expect(container.querySelector('span')!.textContent).toBe('99.5');
    expect(gsap.to).not.toHaveBeenCalled();
  });
});
