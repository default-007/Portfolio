import { useEffect, useRef, type RefObject } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../lib/env';

// Ported from ambient()'s magnetic logic (design source lines 447-462): a
// single shared pointermove listener nudges the element toward the cursor
// while it's within max(width, 170)px of the element's center, and eases it
// back to rest otherwise.
export function useMagnetic(): RefObject<HTMLAnchorElement | null> {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const el = ref.current;
    if (!el) return;

    const onPointerMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < Math.max(r.width, 170);
      gsap.to(
        el,
        near
          ? { x: dx * 0.22, y: dy * 0.3, duration: 0.45, ease: 'power3.out' }
          : { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.5)' },
      );
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  return ref;
}
