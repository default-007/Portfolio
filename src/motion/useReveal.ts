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

      // ── The remaining data-anim families from the design's script ────────
      //
      // Every block below is a port of design source lines 581-655. Two
      // rules hold throughout, and both matter more than they look:
      //
      // 1. The design's rev() helper (line 522) resolves its own trigger —
      //    `trigger: o.trigger || arr[0]`. GSAP has no such fallback: an
      //    unset trigger is null, ScrollTrigger's position math substitutes
      //    document.body, whose top never moves, and the tween fires at
      //    scroll position 0 with the reveal already spent before the reader
      //    arrives. That shipped once on this branch. So every port below
      //    passes the *resolved* trigger explicitly, never the omission.
      // 2. Everything is a fromTo with immediateRender:false, so content is
      //    visible by default and a reveal that never plays cannot hide it.
      //    The design's `gsap.to` calls become fromTo from the value the
      //    element already has for the same reason.
      //
      // `overwrite: 'auto'` is on the entrance tweens (as rev() puts it) but
      // deliberately not on the scrub tweens: the screen drift and the hero
      // parallax share their target with an entrance tween, and an auto
      // overwrite there would kill the entrance the moment the scrub is
      // created.

      // Hero portrait (design 584): the intro's scale-in. It sits at
      // position 0 of the design's intro timeline with no delay, so a
      // standalone tween is the same animation.
      const heroPhoto = document.querySelector<HTMLElement>('[data-anim="hero-photo"]');
      if (heroPhoto) {
        gsap.fromTo(
          heroPhoto,
          { opacity: 0, scale: 1.06 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            ease: 'power2.out',
            immediateRender: false,
            overwrite: 'auto',
          },
        );

        // Design 586-589: the img inside it parallaxes as ch0 scrolls away.
        // The design triggers on the '#ch0' selector; the resolved element is
        // the section this photo lives in, taken from the photo itself so the
        // trigger can never come back null.
        const heroImg = heroPhoto.querySelector<HTMLImageElement>('img');
        const heroSection = heroPhoto.closest('section') ?? heroPhoto;
        if (heroImg) {
          gsap.fromTo(
            heroImg,
            { yPercent: 0 },
            {
              yPercent: -8,
              ease: 'none',
              immediateRender: false,
              scrollTrigger: {
                trigger: heroSection,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
              },
            },
          );
        }
      }

      // Auras (design 590-593): each aura drifts and fades against its own
      // chapter, so the trigger is the parent section, not the aura — an
      // absolutely-positioned aura's own box is not what the reader scrolls.
      gsap.utils.toArray<HTMLElement>('[data-anim="aura"]').forEach((el) => {
        const parent = el.parentElement;
        if (!parent) return;
        gsap.fromTo(
          el,
          { yPercent: 0, opacity: 1 },
          {
            yPercent: 16,
            opacity: 0.45,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger: parent, start: 'top top', end: 'bottom top', scrub: 0.6 },
          },
        );
      });

      // Career Gantt bars (design 601-602): one tween over all of them, so
      // they deploy left to right in sequence from their 0 50% origin. One
      // shared trigger — the first bar — is the design's own resolution.
      const bars = gsap.utils.toArray<HTMLElement>('[data-bar]');
      if (bars.length) {
        gsap.fromTo(
          bars,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.9,
            stagger: 0.09,
            ease: 'expo.out',
            immediateRender: false,
            overwrite: 'auto',
            scrollTrigger: { trigger: bars[0], start: 'top 85%' },
          },
        );
      }

      // Timeline rows (design 603-604): per-row, each on its own trigger, so
      // a row entering the viewport reveals itself rather than the whole
      // table firing on the first one.
      gsap.utils.toArray<HTMLElement>('[data-anim="leg"]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: -14 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: 'power3.out',
            immediateRender: false,
            overwrite: 'auto',
            scrollTrigger: { trigger: el, start: 'top 92%' },
          },
        );
      });

      // Dispatch chart bars (design 606-607): vertical, so scaleY from the
      // 50% 100% origin the markup already sets.
      const verticalBars = gsap.utils.toArray<HTMLElement>('[data-bar-v]');
      if (verticalBars.length) {
        gsap.fromTo(
          verticalBars,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 0.7,
            stagger: 0.04,
            ease: 'expo.out',
            immediateRender: false,
            overwrite: 'auto',
            scrollTrigger: { trigger: verticalBars[0], start: 'top 88%' },
          },
        );
      }

      // Occurrence report (design 610-614): the form arrives, then its answer
      // fields stagger in. Both tweens trigger on the report itself — the
      // fields are inside it, so triggering them on their own boxes would
      // fire them all at once anyway, and the design says so explicitly.
      gsap.utils.toArray<HTMLElement>('[data-anim="report"]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'expo.out',
            immediateRender: false,
            overwrite: 'auto',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          },
        );

        const fields = Array.from(el.querySelectorAll<HTMLElement>('[data-field]'));
        if (fields.length) {
          gsap.fromTo(
            fields,
            { opacity: 0, x: 12 },
            {
              opacity: 1,
              x: 0,
              duration: 0.5,
              stagger: 0.09,
              ease: 'power3.out',
              immediateRender: false,
              overwrite: 'auto',
              scrollTrigger: { trigger: el, start: 'top 84%' },
            },
          );
        }
      });

      // Product mockups (design 615-625): three tweens per screen — it
      // arrives with perspective, drifts on scrub while it is on screen, and
      // its interior rows stage in on the screen's trigger.
      gsap.utils.toArray<HTMLElement>('[data-anim="screen"]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 46, rotateX: 7, scale: 0.97, transformPerspective: 1400 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            duration: 1.1,
            ease: 'expo.out',
            immediateRender: false,
            overwrite: 'auto',
            scrollTrigger: { trigger: el, start: 'top 86%' },
          },
        );

        gsap.fromTo(
          el,
          { yPercent: 3 },
          {
            yPercent: -3,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
          },
        );

        const rows = Array.from(el.querySelectorAll<HTMLElement>('[data-row]'));
        if (rows.length) {
          gsap.fromTo(
            rows,
            { opacity: 0, x: 16 },
            {
              opacity: 1,
              x: 0,
              duration: 0.5,
              stagger: 0.07,
              ease: 'power3.out',
              immediateRender: false,
              overwrite: 'auto',
              scrollTrigger: { trigger: el, start: 'top 80%' },
            },
          );
        }
      });

      // Stat tiles (design 641-643): the number rolls up out of its tile, so
      // the target is each tile's first child, not the tile. The design
      // triggers the whole row on `document.querySelector('[data-anim="stat"]')`
      // — the first tile — which is this first child's parent.
      const statValues = gsap.utils.toArray<HTMLElement>('[data-anim="stat"] > div:first-child');
      const firstStatTile = statValues[0]?.parentElement;
      if (statValues.length && firstStatTile) {
        gsap.fromTo(
          statValues,
          { yPercent: 40, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.08,
            ease: 'expo.out',
            immediateRender: false,
            overwrite: 'auto',
            scrollTrigger: { trigger: firstStatTile, start: 'top 88%' },
          },
        );
      }
    },
    { scope },
  );
}
