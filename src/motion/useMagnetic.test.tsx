import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn(),
  },
}));

import { useMagnetic } from './useMagnetic';

const Probe = () => {
  const ref = useMagnetic();
  return (
    <a ref={ref} href="#">
      link
    </a>
  );
};

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

describe('useMagnetic', () => {
  it('registers no pointermove listener under reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    addSpy = vi.spyOn(window, 'addEventListener');

    render(<Probe />);

    expect(addSpy).not.toHaveBeenCalledWith('pointermove', expect.any(Function), expect.anything());
  });

  it('registers a passive pointermove listener when motion is allowed, and removes the same listener on unmount', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
    addSpy = vi.spyOn(window, 'addEventListener');
    removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<Probe />);

    const pointerCall = addSpy.mock.calls.find((call) => call[0] === 'pointermove');
    expect(pointerCall).toBeDefined();
    expect(pointerCall![2]).toEqual({ passive: true });
    const registeredListener = pointerCall![1];

    unmount();

    const removeCall = removeSpy.mock.calls.find((call) => call[0] === 'pointermove');
    expect(removeCall).toBeDefined();
    expect(removeCall![1]).toBe(registeredListener);
  });
});
