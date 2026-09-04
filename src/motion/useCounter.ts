import { useRef, type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../lib/env';

gsap.registerPlugin(ScrollTrigger);

// Design source (portfolio-v5-flight-deck.dc.html lines 645-653) counts over
// 1.5s with a ScrollTrigger fired at 'top 92%' — both values diverge from
// the brief's prose (1.4s / 'top 90%'); the design source wins.
export function useCounter(value: number, decimals = 0): RefObject<HTMLSpanElement | null> {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        el.textContent = value.toFixed(decimals);
        return;
      }

      const obj = { v: 0 };
      gsap.to(obj, {
        v: value,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = obj.v.toFixed(decimals);
        },
        scrollTrigger: { trigger: el, start: 'top 92%' },
      });
    },
    { scope: ref, dependencies: [value, decimals] },
  );

  return ref;
}
