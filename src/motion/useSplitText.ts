import { type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../lib/env';

gsap.registerPlugin(ScrollTrigger);

const CHAR_CLASS = 'deck-char';

// Wraps each word in an overflow-hidden inline-block and each character in
// a `.deck-char` span, so the entrance tween can slide characters up from
// underneath their own line without affecting layout. The original text is
// preserved as an `aria-label` on the element so a screen reader still
// hears one string instead of one per character.
function split(el: HTMLElement): void {
  const original = el.textContent ?? '';
  el.setAttribute('aria-label', original);

  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE && n.textContent && n.textContent.trim()) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((word) => {
          if (!word.trim()) {
            frag.appendChild(document.createTextNode(word));
            return;
          }
          const wrapper = document.createElement('span');
          wrapper.style.display = 'inline-block';
          wrapper.style.overflow = 'hidden';
          wrapper.style.verticalAlign = 'top';
          wrapper.setAttribute('aria-hidden', 'true');
          word.split('').forEach((ch) => {
            const charEl = document.createElement('span');
            charEl.className = CHAR_CLASS;
            charEl.style.display = 'inline-block';
            charEl.textContent = ch;
            wrapper.appendChild(charEl);
          });
          frag.appendChild(wrapper);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        walk(n);
      }
    });
  };

  walk(el);
}

export function useSplitText(ref: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      // Content is visible by default; skipping the split under reduced
      // motion leaves the original text node untouched and readable, and
      // there is nothing to tween.
      if (prefersReducedMotion()) return;

      split(el);

      const chars = el.querySelectorAll<HTMLElement>(`.${CHAR_CLASS}`);
      if (!chars.length) return;

      // Characters are visible by default; the entrance is a fromTo that
      // never renders its start state until the trigger fires, so a killed
      // or missing tween can never strand the type invisible.
      gsap.set(chars, { clearProps: 'opacity,transform,translate', opacity: 1 });
      gsap.fromTo(
        chars,
        { yPercent: 108, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.72,
          ease: 'expo.out',
          immediateRender: false,
          stagger: { each: 0.014 },
          scrollTrigger: { trigger: el, start: 'top 88%' },
        },
      );
    },
    { scope: ref },
  );
}
