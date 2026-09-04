import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { useEffect, useRef } from 'react';

vi.mock('gsap', () => ({
  gsap: {
    fromTo: vi.fn(),
    set: vi.fn(),
    registerPlugin: vi.fn(),
    utils: { toArray: (sel: string) => Array.from(document.querySelectorAll(sel)) },
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { update: vi.fn() } }));
// Mirror useReveal.test.tsx: defer to a real effect so the callback sees a
// committed DOM tree, matching the real useGSAP's layout-effect timing.
vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void) => { useEffect(fn); },
}));

import { useSplitText } from './useSplitText';

const Probe = ({ text }: { text: string }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  useSplitText(ref);
  return <h1 ref={ref}>{text}</h1>;
};

beforeEach(() => vi.clearAllMocks());

describe('useSplitText', () => {
  it('carries the original text as aria-label and hides the split spans from a11y tree', () => {
    const { container } = render(<Probe text="Flight Deck" />);
    const heading = container.querySelector('h1')!;

    expect(heading.getAttribute('aria-label')).toBe('Flight Deck');

    const charSpans = heading.querySelectorAll('.deck-char');
    expect(charSpans.length).toBe('Flight Deck'.replace(/\s/g, '').length);

    // Every wrapping word-span carrying characters is hidden from a11y.
    const wordWrappers = Array.from(heading.children) as HTMLElement[];
    expect(wordWrappers.length).toBeGreaterThan(0);
    wordWrappers.forEach((wrapper) => {
      expect(wrapper.getAttribute('aria-hidden')).toBe('true');
    });

    // The visible text, read char by char, reconstitutes the original.
    expect(heading.textContent).toBe('Flight Deck');
  });

  it('leaves the text intact and readable under reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    const { container } = render(<Probe text="Flight Deck" />);
    const heading = container.querySelector('h1')!;

    expect(heading.textContent).toBe('Flight Deck');
    expect(heading.querySelectorAll('.deck-char').length).toBe(0);
    expect(heading.getAttribute('aria-label')).toBeNull();

    vi.unstubAllGlobals();
  });
});
