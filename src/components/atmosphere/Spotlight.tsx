import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../../lib/env';

// Ported from ambient()'s spotlight logic (design source
// portfolio-v5-flight-deck.dc.html lines 444-462): a single pointermove
// listener reveals the spotlight (opacity 1, transitioned by `.deck-spotlight`
// itself) and eases its position toward the cursor via two independent
// gsap.quickTo tweens on 'left'/'top' — duration 0.55, ease 'power3', exactly
// as in the design. Under reduced motion no listener is ever registered and
// the element itself is not rendered (the design instead relies on CSS to
// hide `#v5-spot`; not rendering here is equivalent and avoids a dead node).
export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const el = ref.current;
    if (!el) return;

    const moveX = gsap.quickTo(el, 'left', { duration: 0.55, ease: 'power3' });
    const moveY = gsap.quickTo(el, 'top', { duration: 0.55, ease: 'power3' });

    const onPointerMove = (e: PointerEvent) => {
      el.style.opacity = '1';
      moveX(e.clientX);
      moveY(e.clientY);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  if (prefersReducedMotion()) return null;

  return <div ref={ref} aria-hidden="true" className="deck-spotlight" />;
}
