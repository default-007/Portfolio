import '@testing-library/jest-dom/vitest';

// jsdom implements no media queries; default every test to "motion allowed"
// so reduced-motion behaviour is opt-in and explicit per test.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// jsdom implements no ResizeObserver. Every earlier test that touches
// useSmoothScroll mocked the `lenis` module outright, so this never came
// up before Task 16's App.test.tsx, which renders the full tree (including
// the real useSmoothScroll -> real Lenis) with no such mock. Lenis's
// Dimensions helper observes its wrapper element on construction, so a
// no-op stub is enough to let it construct under jsdom.
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
