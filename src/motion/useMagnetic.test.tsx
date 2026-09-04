import { describe, it, expect, vi, beforeEach } from 'vitest';
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

beforeEach(() => vi.clearAllMocks());

describe('useMagnetic', () => {
  it('registers no pointermove listener under reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    const addSpy = vi.spyOn(window, 'addEventListener');

    render(<Probe />);

    expect(addSpy).not.toHaveBeenCalledWith('pointermove', expect.any(Function), expect.anything());

    addSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('registers a passive pointermove listener when motion is allowed, and removes the same listener on unmount', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<Probe />);

    const pointerCall = addSpy.mock.calls.find((call) => call[0] === 'pointermove');
    expect(pointerCall).toBeDefined();
    expect(pointerCall![2]).toEqual({ passive: true });
    const registeredListener = pointerCall![1];

    unmount();

    const removeCall = removeSpy.mock.calls.find((call) => call[0] === 'pointermove');
    expect(removeCall).toBeDefined();
    expect(removeCall![1]).toBe(registeredListener);

    addSpy.mockRestore();
    removeSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});
