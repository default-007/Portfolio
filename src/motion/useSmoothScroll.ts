import { useCallback, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../lib/env';

gsap.registerPlugin(ScrollTrigger);

export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((chapterId: string) => {
    const selector = `#${chapterId}`;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(selector, { offset: 0, duration: 1.2 });
      return;
    }
    // This branch is only reachable when Lenis was never constructed, and the
    // only reason that happens is the reduced-motion return above — so an
    // explicit `behavior: 'smooth'` here would hand an animated scroll across
    // six full-viewport chapters to precisely the user who asked the OS not to
    // animate. Unlike CSS `scroll-behavior`, no UA suppresses an explicit
    // scrollIntoView smooth request, so the choice has to be made here.
    document.querySelector(selector)?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, []);

  return { scrollTo };
}
