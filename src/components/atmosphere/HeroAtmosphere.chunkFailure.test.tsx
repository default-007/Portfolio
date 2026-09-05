import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Its own file because vi.mock is hoisted per module registry: this is the
// only way to make the EmberField chunk *fail* to load while the sibling
// suite loads it successfully.
vi.mock('../../lib/env', () => ({
  hasWebGL: vi.fn(() => true),
  prefersReducedMotion: vi.fn(() => false),
}));

// Stands in for the chunk never arriving — offline, a cache miss, a blocked
// asset. Unhandled, this rejection reaches the nearest error boundary and the
// hero loses its atmosphere entirely.
vi.mock('./EmberField', () => {
  throw new Error('Failed to fetch dynamically imported module');
});

import { loadEmberField } from './HeroAtmosphere';

describe('HeroAtmosphere when the three chunk fails to load', () => {
  // Asserted against the loader rather than through <Suspense>, because
  // Suspense's fallback is the aura as well: rendering it proves only that
  // the import is pending, not that a rejection was handled.
  it('resolves the failed import to the CSS aura rather than rejecting', async () => {
    const mod = await loadEmberField();

    render(<mod.default />);
    expect(screen.getByTestId('css-aura')).toBeInTheDocument();
  });
});
