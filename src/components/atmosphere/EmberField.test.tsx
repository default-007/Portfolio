import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// The Canvas is stubbed to render nothing. Everything inside it needs a WebGL
// context jsdom does not have, and none of it is what this file is about: the
// subject is EmberField's own wrapper element, which is plain DOM and which
// the HeroAtmosphere tests cannot see, because there EmberField itself is the
// thing being mocked.
vi.mock('@react-three/fiber', () => ({
  Canvas: () => null,
  useFrame: vi.fn(),
  useThree: vi.fn(),
}));

import { EmberField } from './EmberField';

describe('EmberField', () => {
  // The scroll scrub is created once, at App mount, over whatever carries
  // data-anim="aura" — and at that moment this component does not exist yet,
  // because it is lazy and gated behind a capability check. A marker here
  // would therefore never be scrubbed, while also giving useReveal a second
  // aura to find on any later run. The marker belongs to HeroAtmosphere's
  // frame, which outlives the swap; this element must not carry one.
  it('leaves the aura marker to the frame that outlives the swap', () => {
    const { container } = render(<EmberField />);
    const wrapper = container.querySelector('[data-testid="ember-field"]')!;
    expect(wrapper).not.toBeNull();
    expect(wrapper).not.toHaveAttribute('data-anim');
    expect(container.querySelectorAll('[data-anim="aura"]')).toHaveLength(0);
  });

  // Positioning belongs to the frame too. If this element positioned itself
  // as well, the two would compound and the field would not sit where the
  // CSS fallback does — the fallback and the upgrade have to read as one
  // design, which is the whole premise of swapping one for the other.
  it('fills its frame rather than positioning itself', () => {
    const { container } = render(<EmberField />);
    const wrapper = container.querySelector('[data-testid="ember-field"]')!;
    expect(wrapper).toHaveClass('absolute', 'inset-0');
    expect(wrapper.className).not.toMatch(/-top-|-left-|h-\[|w-\[/);
  });
});
