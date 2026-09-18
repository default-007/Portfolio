import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { useLayoutEffect, useRef } from 'react';

vi.mock('gsap', () => ({
  gsap: {
    fromTo: vi.fn(),
    set: vi.fn(),
    registerPlugin: vi.fn(),
    utils: { toArray: (sel: string) => Array.from(document.querySelectorAll(sel)) },
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { update: vi.fn() } }));
// The real useGSAP runs its callback in useIsomorphicLayoutEffect (a layout
// effect, scoping queries to committed DOM). We mimic that timing with
// useLayoutEffect rather than useEffect, and — because it takes no
// dependency array — it reruns on every render, letting the idempotence
// test below force a second invocation against the same DOM node the way
// StrictMode's double-invoked mount effect would in dev.
vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void) => { useLayoutEffect(fn); },
}));

import { useSplitText } from './useSplitText';

const Probe = ({ text }: { text: string }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  useSplitText(ref);
  return <h1 ref={ref}>{text}</h1>;
};

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

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
  });

  it('does not re-split an already-split element on a second invocation against the same node', () => {
    const { container, rerender } = render(<Probe text="Flight Deck" />);
    const heading = container.querySelector('h1')!;
    const expectedCharCount = 'Flight Deck'.replace(/\s/g, '').length;

    expect(heading.querySelectorAll('.deck-char').length).toBe(expectedCharCount);

    // Force the mocked layout effect to run again against the very same
    // element — reproducing StrictMode's double-invoked mount effect, which
    // useGSAP's context.revert() cleanup does not undo (it reverts
    // GSAP-tracked properties, not split()'s raw DOM mutations). Without the
    // re-entry guard this would re-split every existing `.deck-char` (each
    // one now its own whitespace-free "word"), doubling the char count and
    // nesting a second word-wrapper inside the first.
    rerender(<Probe text="Flight Deck" />);

    const charSpans = heading.querySelectorAll('.deck-char');
    expect(charSpans.length).toBe(expectedCharCount);

    // Nesting depth is unchanged: each char span's parent (the word
    // wrapper) is still a direct child of the heading, not nested inside a
    // second word-wrapper produced by re-splitting an already-split span.
    charSpans.forEach((span) => {
      expect(span.parentElement?.parentElement).toBe(heading);
    });

    expect(heading.getAttribute('aria-label')).toBe('Flight Deck');
  });
});
