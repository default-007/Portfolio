import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CHAPTER_IDS } from '../data/chapters';

gsap.registerPlugin(ScrollTrigger);

// Ported from design source (portfolio-v5-flight-deck.dc.html lines 552-579):
// one ScrollTrigger per `section[data-chapter]` toggles the active chapter
// as it crosses the vertical centre of the viewport, and a single
// page-length trigger reports overall scroll progress for the altitude
// ladder. Both live in one hook so AltitudeLadder and StatusStrip read a
// single, consistently-updated source of truth.
export function useChapterTracking(): { activeId: string; progress: number } {
  const [activeId, setActiveId] = useState<string>(CHAPTER_IDS[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    triggers.push(
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => setProgress(self.progress),
      }),
    );

    document.querySelectorAll<HTMLElement>('section[data-chapter]').forEach((section) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: 'top 55%',
          end: 'bottom 45%',
          onToggle: (self) => {
            if (!self.isActive) return;
            setActiveId(section.id);
          },
        }),
      );
    });

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return { activeId, progress };
}
