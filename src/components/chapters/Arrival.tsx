import { useRef } from 'react';
import { useSplitText } from '../../motion/useSplitText';
import { useMagnetic } from '../../motion/useMagnetic';
import { prefersReducedMotion } from '../../lib/env';
import { HeroAtmosphere } from '../atmosphere/HeroAtmosphere';
import portrait from '../../assets/brian-speaking.png';
import portraitAvif from '../../assets/brian-speaking.avif';
import portraitWebp from '../../assets/brian-speaking.webp';

// Ported from design source (portfolio-v5-flight-deck.dc.html lines 73-101):
// chapter 00, the hero the visitor lands on. The section id/data attributes
// are copied verbatim from the design — `useChapterTracking` keys off
// `section[data-chapter]` and the console anchors to `#ch0`.
export function Arrival() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useSplitText(headingRef);

  const primaryCtaRef = useMagnetic();
  const secondaryCtaRef = useMagnetic();

  const reduced = prefersReducedMotion();

  return (
    <section
      id="ch0"
      data-chapter="00 · Arrival"
      data-screen-label="00"
      className="relative grid min-h-[calc(100dvh-var(--console-rest-h))] items-center overflow-hidden border-b border-body/10 pb-[120px] pl-[64px] pr-5 md:pl-[76px] md:pr-10 pt-[78px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-10"
    >
      {/* The aura lives in HeroAtmosphere, which renders the design's CSS
          layer and swaps in the WebGL ember field only where the device can
          afford it. It keeps [data-anim="aura"] on a frame that outlives that
          swap, because useReveal scrubs whatever carries the marker at App
          mount and would otherwise lose the element out from under itself. */}
      <HeroAtmosphere />

      <div className="relative z-[1]">
        <div
          data-anim="fade"
          className="mb-[34px] flex w-max max-w-full flex-wrap whitespace-nowrap border border-body/14 font-mono text-[11px] uppercase tracking-[0.1em] text-dim-2"
        >
          <span className="border-r border-body/14 px-3 py-2">Reg. 5Y-BOO</span>
          <span className="border-r border-body/14 px-3 py-2">Full-stack engineer</span>
          <span className="px-3 py-2 text-ember">5 yr + logged</span>
        </div>

        <h1
          ref={headingRef}
          data-split="1"
          className="m-0 mb-7 font-display text-[clamp(40px,5.4vw,78px)] font-light md:font-extralight leading-[0.9] tracking-[-0.04em] text-bone"
        >
          Brian Otieno<br />{' '}
          <span className="italic text-ember">
            certifies
          </span>{' '}
          systems<br />{' '}
          for daily service.
        </h1>

        <p
          data-anim="fade"
          className="m-0 mb-[30px] max-w-[600px] font-display text-[19.5px] leading-[1.6] text-muted [text-wrap:pretty]"
        >
          Civil aviation before software. Aviation taught me that procedure is not bureaucracy.
          It is the thing standing between a checklist and a headline. I build ERP, school, and
          geospatial systems the same way: restorable, reversible, auditable.
        </p>

        <div data-anim="fade" className="flex flex-wrap items-center gap-3">
          <a
            ref={primaryCtaRef}
            href="#ch2"
            data-magnetic="1"
            className="bg-rust px-6 py-[14px] font-mono text-[12px] uppercase tracking-[0.12em] text-bone hover:bg-rust-bright hover:shadow-[0_8px_22px_rgba(96,38,20,0.55)]"
            style={{ transition: 'background .3s, box-shadow .4s' }}
          >
            Walk the deck →
          </a>
          <a
            ref={secondaryCtaRef}
            href="mailto:brianokola@gmail.com"
            data-magnetic="1"
            className="border border-body/24 px-6 py-[14px] font-mono text-[12px] uppercase tracking-[0.12em] text-body hover:border-ember hover:text-ember hover:shadow-[0_8px_22px_rgba(70,48,18,0.5)]"
            style={{ transition: 'border-color .3s, box-shadow .4s' }}
          >
            Request contact
          </a>
        </div>
      </div>

      <div
        data-anim="hero-photo"
        className="relative z-[1] min-h-[300px] w-full max-w-[340px] max-h-[min(64vh,520px)] justify-self-start self-stretch overflow-hidden border border-body/12"
      >
        <picture>
          <source srcSet={portraitAvif} type="image/avif" />
          <source srcSet={portraitWebp} type="image/webp" />
          <img
            src={portrait}
            alt="Brian Otieno"
            className="block h-[108%] w-full object-cover object-[52%_14%] saturate-[.8] contrast-[1.06] brightness-90"
          />
        </picture>
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,8,7,0.5) 0%, rgba(10,8,7,0) 32%, rgba(10,8,7,0.78) 100%)',
          }}
        />
        <div aria-hidden="true" className="deck-scanlines" />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 h-[20%]${reduced ? '' : ' animate-[deck-scan_7.5s_linear_infinite]'}`}
          style={{
            background:
              'linear-gradient(180deg, rgba(232,163,61,0) 0%, rgba(232,163,61,0.14) 50%, rgba(232,163,61,0) 100%)',
          }}
        />
      </div>
    </section>
  );
}
