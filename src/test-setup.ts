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
