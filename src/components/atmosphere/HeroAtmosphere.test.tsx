import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('../../lib/env', () => ({
  hasWebGL: vi.fn(),
  prefersReducedMotion: vi.fn(),
}));

// Standing in for the real WebGL component: jsdom has no GL context, and the
// point of these two tests is which branch HeroAtmosphere chooses, not what
// the shader draws.
vi.mock('./EmberField', () => ({
  EmberField: () => <div data-testid="ember-field" />,
}));

import { hasWebGL, prefersReducedMotion } from '../../lib/env';
import { HeroAtmosphere } from './HeroAtmosphere';

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

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

  // Every test above lands on the fallback, so all of them would still pass if
  // the capability check were broken to always return false. These two are the
  // ones that fail in that case: they drive the upgrade branch itself.
  it('mounts the ember field on a wide screen with WebGL and motion allowed', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    vi.mocked(hasWebGL).mockReturnValue(true);
    vi.mocked(prefersReducedMotion).mockReturnValue(false);
    render(<HeroAtmosphere />);
    await waitFor(() => expect(screen.getByTestId('ember-field')).toBeInTheDocument());
    expect(screen.queryByTestId('css-aura')).not.toBeInTheDocument();
  });

  // The scroll scrub for the whole atmosphere is created once, at App mount,
  // over whatever carries data-anim="aura" at that moment — always the CSS
  // fallback, since use3D starts false and EmberField is lazy. If that marker
  // sat on the swapped child, the upgrade would unmount the scrubbed node and
  // mount an unscrubbed one, and the ember field would sit motionless against
  // scroll on exactly the machines it exists for. What keeps the scrub alive
  // is that the marked node is the frame and never the layer inside it, so
  // both capability paths are checked for that same shape.
  it.each([
    ['the CSS fallback', false, 'css-aura'],
    ['the ember field', true, 'ember-field'],
  ])('marks the frame, not %s, so the scroll scrub survives the swap', async (_l, webgl, id) => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    vi.mocked(hasWebGL).mockReturnValue(webgl as boolean);
    vi.mocked(prefersReducedMotion).mockReturnValue(false);
    const { container } = render(<HeroAtmosphere />);

    await waitFor(() => expect(screen.getByTestId(id as string)).toBeInTheDocument());

    const marked = container.querySelectorAll('[data-anim="aura"]');
    expect(marked).toHaveLength(1);
    const layer = screen.getByTestId(id as string);
    expect(marked[0]).not.toBe(layer);
    expect(marked[0]).toContainElement(layer);
  });

  it('keeps the aura on a narrow screen even when WebGL and motion allow it', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
    vi.mocked(hasWebGL).mockReturnValue(true);
    vi.mocked(prefersReducedMotion).mockReturnValue(false);
    render(<HeroAtmosphere />);
    expect(screen.getByTestId('css-aura')).toBeInTheDocument();
    expect(screen.queryByTestId('ember-field')).not.toBeInTheDocument();
  });

  it('carries the design aura gradient and drift class verbatim', () => {
    vi.mocked(hasWebGL).mockReturnValue(false);
    vi.mocked(prefersReducedMotion).mockReturnValue(false);
    render(<HeroAtmosphere />);
    const aura = screen.getByTestId('css-aura');
    expect(aura).toHaveClass('deck-aura');
    // aria-hidden and the positioning live on the frame that wraps whichever
    // layer is mounted, so the whole atmosphere is hidden from assistive tech
    // whether it is the CSS fallback or the WebGL upgrade.
    const frame = aura.parentElement!;
    expect(frame).toHaveAttribute('aria-hidden', 'true');
    expect(frame).toHaveAttribute('data-anim', 'aura');
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
