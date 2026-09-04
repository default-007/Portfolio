import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { useEffect } from 'react';

vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    registerPlugin: vi.fn(),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { update: vi.fn() } }));
vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void) => { useEffect(fn); },
}));

import { useCounter } from './useCounter';

const Probe = ({ value, decimals }: { value: number; decimals?: number }) => {
  const ref = useCounter(value, decimals);
  return <span ref={ref} />;
};

beforeEach(() => vi.clearAllMocks());

describe('useCounter', () => {
  it('writes the final integer value immediately under reduced motion, with no decimal point', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    const { container } = render(<Probe value={244} />);
    expect(container.querySelector('span')!.textContent).toBe('244');
    vi.unstubAllGlobals();
  });

  it('honours decimals under reduced motion (99.5 with one decimal renders "99.5")', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    const { container } = render(<Probe value={99.5} decimals={1} />);
    expect(container.querySelector('span')!.textContent).toBe('99.5');
    vi.unstubAllGlobals();
  });
});
