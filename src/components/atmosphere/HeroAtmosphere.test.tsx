import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../lib/env', () => ({
  hasWebGL: vi.fn(),
  prefersReducedMotion: vi.fn(),
}));

import { hasWebGL, prefersReducedMotion } from '../../lib/env';
import { HeroAtmosphere } from './HeroAtmosphere';

afterEach(() => vi.clearAllMocks());

describe('HeroAtmosphere', () => {
  it('falls back to the CSS aura when WebGL is unavailable', () => {
    vi.mocked(hasWebGL).mockReturnValue(false);
    vi.mocked(prefersReducedMotion).mockReturnValue(false);
    render(<HeroAtmosphere />);
    expect(screen.getByTestId('css-aura')).toBeInTheDocument();
  });

  it('falls back to the CSS aura under reduced motion even with WebGL', () => {
    vi.mocked(hasWebGL).mockReturnValue(true);
    vi.mocked(prefersReducedMotion).mockReturnValue(true);
    render(<HeroAtmosphere />);
    expect(screen.getByTestId('css-aura')).toBeInTheDocument();
  });

  it('paints the CSS aura on the very first render, before the capability check', () => {
    // The 3D layer is an upgrade, never a prerequisite: capability checks run
    // in an effect, so the server/first-paint markup is always the aura.
    vi.mocked(hasWebGL).mockReturnValue(true);
    vi.mocked(prefersReducedMotion).mockReturnValue(false);
    render(<HeroAtmosphere />);
    // jsdom's matchMedia stub reports `matches: false`, so the >=1024px gate
    // also keeps this narrow-viewport render on the fallback.
    expect(screen.getByTestId('css-aura')).toBeInTheDocument();
  });

  it('carries the design aura gradient and drift class verbatim', () => {
    vi.mocked(hasWebGL).mockReturnValue(false);
    vi.mocked(prefersReducedMotion).mockReturnValue(false);
    render(<HeroAtmosphere />);
    const aura = screen.getByTestId('css-aura');
    expect(aura).toHaveClass('deck-aura');
    expect(aura).toHaveAttribute('aria-hidden', 'true');
    // jsdom re-serialises rgba() with spaces; compare on the normalised form.
    const style = aura.getAttribute('style') ?? '';
    expect(style).toContain(
      'radial-gradient(45% 45% at 38% 44%, rgba(192, 96, 58, 0.36) 0%, rgba(192, 96, 58, 0) 70%)',
    );
    expect(style).toContain(
      'radial-gradient(38% 38% at 66% 62%, rgba(232, 163, 61, 0.22) 0%, rgba(232, 163, 61, 0) 72%)',
    );
  });
});
