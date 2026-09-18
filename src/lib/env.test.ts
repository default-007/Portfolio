import { describe, it, expect, vi, afterEach } from 'vitest';
import { prefersReducedMotion, hasWebGL } from './env';

const mockMatch = (matches: boolean) => {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches, media: query }) as MediaQueryList);
};

afterEach(() => vi.unstubAllGlobals());

describe('prefersReducedMotion', () => {
  it('is true when the reduce query matches', () => {
    mockMatch(true);
    expect(prefersReducedMotion()).toBe(true);
  });

  it('is false when the reduce query does not match', () => {
    mockMatch(false);
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe('hasWebGL', () => {
  it('is false when getContext returns null', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(hasWebGL()).toBe(false);
  });

  it('is true when a webgl context is returned', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as RenderingContext);
    expect(hasWebGL()).toBe(true);
  });
});
