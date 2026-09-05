import { type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../lib/env';

gsap.registerPlugin(ScrollTrigger);

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

      // Ported from design source (portfolio-v5-flight-deck.dc.html lines
      // 628-640): checklist/bullet rows marked data-anim="check" — the
      // case-study bullet rows (CaseStudy.tsx) and the checklist rows
      // (Checklist.tsx). The design groups these by parentElement so each
      // chapter's list staggers on its own trigger rather than every
      // chapter's rows sharing one; two tweens per group, the rows
      // themselves and (separately) each row's first child, the ✓/→ glyph.
      const checkGroups = new Map<Element, HTMLElement[]>();
      gsap.utils.toArray<HTMLElement>('[data-anim="check"]').forEach((el) => {
        const parent = el.parentElement;
        if (!parent) return;
        if (!checkGroups.has(parent)) checkGroups.set(parent, []);
        checkGroups.get(parent)!.push(el);
      });

      checkGroups.forEach((items) => {
        // The design's rev() helper resolves its own default —
        // `trigger: o.trigger || arr[0]` (design source line 527) — so a
        // call that passes no trigger still ends up triggered on the
        // group's first row. GSAP has no such fallback: leaving `trigger`
        // unset yields null, and ScrollTrigger's position math then
        // substitutes document.body, whose top never moves, firing
        // `top 92%` at scroll position 0. The trigger is therefore passed
        // explicitly, exactly as the glyph tween below already does.
        gsap.fromTo(
          items,
          { opacity: 0, x: -10 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            immediateRender: false,
            overwrite: 'auto',
            scrollTrigger: { trigger: items[0], start: 'top 92%' },
          },
        );

        const glyphs = items
          .map((item) => item.firstElementChild)
          .filter((glyph): glyph is Element => glyph !== null);

        gsap.fromTo(
          glyphs,
          { scale: 0.2, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.42,
            stagger: 0.08,
            ease: 'back.out(2.6)',
            immediateRender: false,
            overwrite: 'auto',
            scrollTrigger: { trigger: items[0], start: 'top 92%' },
          },
        );
      });
    },
    { scope },
  );
}
