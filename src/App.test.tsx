import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';
import { CHAPTER_IDS } from './data/chapters';

// Scoped to this file rather than raised globally in vite.config.ts: App is
// the only test that mounts the whole tree with real ScrollTrigger, a real
// Lenis and useSplitText's per-character DOM walk, and under parallel worker
// contention that occasionally overran the 5s default. Every other test file
// keeps the default, so a genuinely hung test there still fails in 5s.
vi.setConfig({ testTimeout: 15000 });

describe('App', () => {
  it('renders all seven chapters in order with the expected ids', () => {
    const { container } = render(<App />);
    const ids = Array.from(container.querySelectorAll('section[data-chapter]')).map((s) => s.id);
    expect(ids).toEqual([...CHAPTER_IDS]);
  });

  it('renders exactly one console', () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll('[aria-label="Flight deck command line"]')).toHaveLength(1);
  });
});
