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
      className="relative grid min-h-screen items-center overflow-hidden border-b border-body/10 pb-[120px] pl-[76px] pr-10 pt-[78px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-10"
    >
      {/* The aura moved into HeroAtmosphere, which renders this exact CSS
          layer and swaps in the WebGL ember field only where the device can
          afford it. Nothing in JS queries [data-anim="aura"] — the drift is
          pure CSS on .deck-aura — so the marker travelling with the element
          changes no behaviour. */}
      <HeroAtmosphere />

      <div className="relative z-[1]">
        <div
          data-anim="fade"
          className="mb-[34px] flex w-max max-w-full overflow-hidden whitespace-nowrap border border-body/14 font-mono text-[10px] uppercase tracking-[0.14em] text-dim-2"
        >
          <span className="border-r border-body/14 px-3 py-2">Reg. 5Y—BOO</span>
          <span className="border-r border-body/14 px-3 py-2">Full-stack engineer</span>
          <span className="px-3 py-2 text-ember">5 yr + logged</span>
        </div>

        <h1
          ref={headingRef}
          data-split="1"
          className="m-0 mb-7 font-display text-[clamp(44px,7.6vw,124px)] font-extralight leading-[0.9] tracking-[-0.04em] text-bone [text-shadow:0_0_70px_rgba(232,163,61,0.14)]"
        >
          Brian Otieno<br />{' '}
          <span className="italic text-ember [text-shadow:0_0_36px_rgba(232,163,61,0.5),0_0_100px_rgba(192,96,58,0.35)]">
            certifies
          </span>{' '}
          systems<br />{' '}
          for daily service.
        </h1>

        <p
          data-anim="fade"
          className="m-0 mb-[30px] max-w-[600px] font-display text-[19.5px] leading-[1.6] text-muted [text-wrap:pretty]"
        >
          Civil aviation before software. Aviation taught me that procedure is not bureaucracy —
          it is the thing standing between a checklist and a headline. I build ERP, school, and
          geospatial systems the same way: restorable, reversible, auditable.
        </p>

        <div data-anim="fade" className="flex flex-wrap items-center gap-3">
          <a
            ref={primaryCtaRef}
            href="#ch2"
            data-magnetic="1"
            className="bg-rust px-6 py-[14px] font-mono text-[12px] uppercase tracking-[0.12em] text-bone hover:bg-rust-bright hover:shadow-[0_14px_46px_rgba(192,96,58,0.5)]"
            style={{ transition: 'background .3s, box-shadow .4s' }}
          >
            Walk the deck →
          </a>
          <a
            ref={secondaryCtaRef}
            href="mailto:brianokola@gmail.com"
            data-magnetic="1"
            className="border border-body/24 px-6 py-[14px] font-mono text-[12px] uppercase tracking-[0.12em] text-body hover:border-ember hover:text-ember hover:shadow-[0_14px_46px_rgba(232,163,61,0.22)]"
            style={{ transition: 'border-color .3s, box-shadow .4s' }}
          >
            Request contact
          </a>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim-3">
            or press <span className="text-ember">/</span> to fly it by keyboard
          </span>
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
        <div
          aria-hidden="true"
          className="absolute right-3 top-3 h-[50px] w-[50px] overflow-hidden rounded-full border border-ember/32"
        >
          <div
            className={`absolute inset-0${reduced ? '' : ' animate-[deck-sweep_3.6s_linear_infinite]'}`}
            style={{
              background:
                'conic-gradient(from 0deg, rgba(232,163,61,0.55) 0deg, rgba(232,163,61,0) 90deg)',
            }}
          />
          <div
            className={`absolute inset-[44%] rounded-full bg-ember${reduced ? '' : ' animate-[deck-blink_2.4s_infinite]'}`}
          />
        </div>
        <div className="absolute inset-x-3 bottom-3 flex justify-between font-mono text-[9.5px] tracking-[0.1em] text-body/66">
          <span>PHOTO / OTIENO_B</span>
          <span>NBO</span>
        </div>
      </div>
    </section>
  );
}
