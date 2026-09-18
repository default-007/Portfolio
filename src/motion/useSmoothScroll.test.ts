import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const lenisInstance = {
  on: vi.fn(),
  raf: vi.fn(),
  scrollTo: vi.fn(),
  destroy: vi.fn(),
};

vi.mock('lenis', () => {
  const LenisMock = vi.fn(function () {
    return lenisInstance;
  });
  return { default: LenisMock };
});

beforeEach(() => vi.clearAllMocks());

import { useSmoothScroll } from './useSmoothScroll';
import * as lenisModule from 'lenis';
import { gsap } from 'gsap';

describe('useSmoothScroll', () => {
  it('drives Lenis via gsap.ticker with seconds-to-milliseconds conversion', () => {
    // Spy on gsap.ticker methods
    const tickerAddSpy = vi.spyOn(gsap.ticker, 'add');
    const lagSmoothingSpy = vi.spyOn(gsap.ticker, 'lagSmoothing');

    renderHook(() => useSmoothScroll());

    // Verify gsap.ticker.add was called with a function
    expect(tickerAddSpy).toHaveBeenCalledWith(expect.any(Function));

    // Verify lagSmoothing(0) was called
    expect(lagSmoothingSpy).toHaveBeenCalledWith(0);

    // Capture the tick callback and invoke it with a known time
    const tickCallback = tickerAddSpy.mock.calls[0][0];
    tickCallback(2, 0.016, 120, 2); // time in seconds, deltaTime, frame, elapsed

    // Verify lenis.raf was called with time converted to milliseconds
    expect(lenisInstance.raf).toHaveBeenCalledWith(2000);

    tickerAddSpy.mockRestore();
    lagSmoothingSpy.mockRestore();
  });

  it('subscribes ScrollTrigger to Lenis scroll events', () => {
    renderHook(() => useSmoothScroll());
    expect(lenisInstance.on).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('removes the ticker callback before destroying the instance on unmount', () => {
    // Spy on gsap.ticker methods
    const tickerAddSpy = vi.spyOn(gsap.ticker, 'add');
    const tickerRemoveSpy = vi.spyOn(gsap.ticker, 'remove');

    const { unmount } = renderHook(() => useSmoothScroll());

    // Capture the tick callback that was added
    const tickCallback = tickerAddSpy.mock.calls[0][0];

    unmount();

    // Verify gsap.ticker.remove was called with the same function
    expect(tickerRemoveSpy).toHaveBeenCalledWith(tickCallback);

    // Verify remove was called before destroy (using invocationCallOrder)
    const removCallOrder = tickerRemoveSpy.mock.invocationCallOrder[0];
    const destroyCallOrder = lenisInstance.destroy.mock.invocationCallOrder[0];
    expect(removCallOrder).toBeLessThan(destroyCallOrder);

    tickerAddSpy.mockRestore();
    tickerRemoveSpy.mockRestore();
  });

  it('scrollTo targets the element by id selector', () => {
    const { result } = renderHook(() => useSmoothScroll());
    result.current.scrollTo('ch3');
    expect(lenisInstance.scrollTo).toHaveBeenCalledWith('#ch3', expect.any(Object));
  });

  it('respects prefers-reduced-motion and does not drive gsap.ticker', () => {
    // Save original matchMedia
    const originalMatchMedia = window.matchMedia;

    // Stub window.matchMedia to report reduced motion for this test
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as any;

    // Clear all mocks to reset the Lenis constructor call count
    vi.clearAllMocks();

    let scrollIntoViewSpy: ReturnType<typeof vi.spyOn> | null = null;
    let element: HTMLElement | null = null;

    try {
      const tickerAddSpy = vi.spyOn(gsap.ticker, 'add');
      const { result } = renderHook(() => useSmoothScroll());

      // Verify Lenis was not constructed
      const LenisMock = vi.mocked(lenisModule.default);
      expect(LenisMock).not.toHaveBeenCalled();

      // Verify lenisInstance.on was not called
      expect(lenisInstance.on).not.toHaveBeenCalled();

      // Verify gsap.ticker.add was not called
      expect(tickerAddSpy).not.toHaveBeenCalled();

      // Create a real element to test scrollIntoView
      element = document.createElement('div');
      element.id = 'ch3';
      document.body.appendChild(element);

      // Add scrollIntoView to Element prototype if it doesn't exist (jsdom doesn't implement it)
      if (!Element.prototype.scrollIntoView) {
        (Element.prototype as any).scrollIntoView = vi.fn();
      }

      // Mock scrollIntoView on Element prototype
      scrollIntoViewSpy = vi.spyOn(Element.prototype, 'scrollIntoView');

      // Call scrollTo
      result.current.scrollTo('ch3');

      // The fallback branch exists *because* reduced motion is on, so the
      // scroll it performs must not itself be animated. 'smooth' here is an
      // explicit animation request that no UA suppresses.
      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'auto' });

      tickerAddSpy.mockRestore();
    } finally {
      // Restore original matchMedia
      window.matchMedia = originalMatchMedia;
      // Clean up spies and elements
      if (scrollIntoViewSpy) {
        scrollIntoViewSpy.mockRestore();
      }
      if (element && element.parentNode) {
        document.body.removeChild(element);
      }
    }
  });
});
