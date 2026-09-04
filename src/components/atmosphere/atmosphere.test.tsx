import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('gsap', () => ({
  gsap: {
    quickTo: vi.fn(() => vi.fn()),
  },
}));

import { gsap } from 'gsap';
import { Grain } from './Grain';
import { Vignette } from './Vignette';
import { Spotlight } from './Spotlight';

let addSpy: MockInstance<typeof window.addEventListener> | undefined;
let removeSpy: MockInstance<typeof window.removeEventListener> | undefined;

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  addSpy?.mockRestore();
  removeSpy?.mockRestore();
  addSpy = undefined;
  removeSpy = undefined;
  vi.unstubAllGlobals();
});

describe('Grain', () => {
  it('renders a single aria-hidden element carrying .deck-grain', () => {
    const { container } = render(<Grain />);
    expect(container.children).toHaveLength(1);
    const el = container.firstElementChild;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveClass('deck-grain');
  });

  it('renders identically under reduced motion (CSS handles suppression, not JS)', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    const reduced = render(<Grain />);
    vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
    const allowed = render(<Grain />);
    expect(reduced.container.innerHTML).toBe(allowed.container.innerHTML);
  });
});

describe('Vignette', () => {
  it('renders a single aria-hidden element carrying .deck-vignette', () => {
    const { container } = render(<Vignette />);
    expect(container.children).toHaveLength(1);
    const el = container.firstElementChild;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveClass('deck-vignette');
  });

  it('renders identically under reduced motion (CSS handles suppression, not JS)', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    const reduced = render(<Vignette />);
    vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
    const allowed = render(<Vignette />);
    expect(reduced.container.innerHTML).toBe(allowed.container.innerHTML);
  });
});

describe('Spotlight', () => {
  it('renders nothing and registers no pointermove listener under reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    addSpy = vi.spyOn(window, 'addEventListener');

    const { container } = render(<Spotlight />);

    expect(container).toBeEmptyDOMElement();
    // Filter by event name rather than matching a full argument list: a
    // toHaveBeenCalledWith assertion also passes when the call shape changes,
    // so it would go quiet if a regression registered the listener with no
    // options object.
    expect(addSpy.mock.calls.filter((c) => c[0] === 'pointermove')).toHaveLength(0);
  });

  it('renders its element and registers a pointermove listener when motion is allowed, removing the same listener on unmount', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
    addSpy = vi.spyOn(window, 'addEventListener');
    removeSpy = vi.spyOn(window, 'removeEventListener');

    const { container, unmount } = render(<Spotlight />);

    const el = container.firstElementChild;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveClass('deck-spotlight');

    const pointerCall = addSpy.mock.calls.find((call) => call[0] === 'pointermove');
    expect(pointerCall).toBeDefined();
    expect(pointerCall![2]).toEqual({ passive: true });
    const registeredListener = pointerCall![1];

    unmount();

    const removeCall = removeSpy.mock.calls.find((call) => call[0] === 'pointermove');
    expect(removeCall).toBeDefined();
    expect(removeCall![1]).toBe(registeredListener);
  });

  it('wires quickTo tweens for left and top with the design-ported duration and ease', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);

    render(<Spotlight />);

    const quickTo = gsap.quickTo as unknown as MockInstance;
    expect(quickTo).toHaveBeenCalledWith(expect.anything(), 'left', { duration: 0.55, ease: 'power3' });
    expect(quickTo).toHaveBeenCalledWith(expect.anything(), 'top', { duration: 0.55, ease: 'power3' });
  });
});
