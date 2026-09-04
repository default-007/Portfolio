import { type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../lib/env';

export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>('[data-anim="fade"]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            immediateRender: false,
            overwrite: 'auto',
            scrollTrigger: { trigger: el, start: 'top 90%' },
          },
        );
      });
    },
    { scope },
  );
}
