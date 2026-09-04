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

describe('useSmoothScroll', () => {
  it('subscribes ScrollTrigger to Lenis scroll events', () => {
    renderHook(() => useSmoothScroll());
    expect(lenisInstance.on).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('destroys the instance on unmount', () => {
    const { unmount } = renderHook(() => useSmoothScroll());
    unmount();
    expect(lenisInstance.destroy).toHaveBeenCalled();
  });

  it('scrollTo targets the element by id selector', () => {
    const { result } = renderHook(() => useSmoothScroll());
    result.current.scrollTo('ch3');
    expect(lenisInstance.scrollTo).toHaveBeenCalledWith('#ch3', expect.any(Object));
  });

  it('respects prefers-reduced-motion and falls back to scrollIntoView', () => {
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

    try {
      const { result } = renderHook(() => useSmoothScroll());

      // Verify Lenis was not constructed
      const LenisMock = vi.mocked(lenisModule.default);
      expect(LenisMock).not.toHaveBeenCalled();

      // Verify lenisInstance.on was not called
      expect(lenisInstance.on).not.toHaveBeenCalled();

      // Create a real element to test scrollIntoView
      const element = document.createElement('div');
      element.id = 'ch3';
      document.body.appendChild(element);

      // Add scrollIntoView to Element prototype if it doesn't exist (jsdom doesn't implement it)
      if (!Element.prototype.scrollIntoView) {
        (Element.prototype as any).scrollIntoView = vi.fn();
      }

      // Mock scrollIntoView on Element prototype
      const scrollIntoViewSpy = vi.spyOn(Element.prototype, 'scrollIntoView');

      // Call scrollTo
      result.current.scrollTo('ch3');

      // Verify scrollIntoView was called with smooth behavior
      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth' });

      // Clean up
      scrollIntoViewSpy.mockRestore();
      document.body.removeChild(element);
    } finally {
      // Restore original matchMedia
      window.matchMedia = originalMatchMedia;
    }
  });
});
