import { useRef } from 'react';
import { useSplitText } from '../../motion/useSplitText';
import { CHAPTERS } from '../../data/chapters';
import { CONTACT, EDUCATION, CERTIFICATIONS } from '../../data/contact';

const IN_PROGRESS = ' (in progress)';

// EDUCATION[0] and CERTIFICATIONS[1] each carry a literal "(in progress)"
// suffix that the design colours ember (line 273: <span
// style="color:#E8A33D">(in progress)</span>). Splitting it back out at
// render time — rather than hardcoding two more literals here — keeps the
// ember colouring driven by the same pinned strings the data test locks
// down, so the two can't drift apart.
function CredentialLine({ text }: { text: string }) {
  if (text.endsWith(IN_PROGRESS)) {
    return (
      <>
        {text.slice(0, -IN_PROGRESS.length)} <span className="text-ember">(in progress)</span>
      </>
    );
  }
  return <>{text}</>;
}

// Ported from design source (portfolio-v5-flight-deck.dc.html lines 267-282):
// chapter 06, the closing contact section. The section id/data attributes
// are copied verbatim from the design — `useChapterTracking` keys off
// `section[data-chapter]` and the HUD chapter readout reads
// `sec.dataset.chapter` directly (design lines 566-579).
//
// Design line 273 renders education/certifications as one mono block: three
// lines, each line's items joined by " · ", separated by <br>. CONTACT,
// EDUCATION and CERTIFICATIONS already exist in src/data/contact.ts (added
// by an earlier task and locked down by src/data/data.test.ts) — this
// reconstructs the design's exact three-line layout from that pinned data
// rather than re-declaring the strings.
export function Clearance() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useSplitText(headingRef);

  const chapter = CHAPTERS.find((c) => c.id === 'ch6')!;
  const [msc, ...restEducation] = EDUCATION;
  const [aws, cisco] = CERTIFICATIONS;

  return (
    <section
      id="ch6"
      data-chapter={chapter.hudLabel}
      data-screen-label={chapter.screenLabel}
      className="relative grid min-h-screen items-center gap-[52px] overflow-hidden pr-10 pb-[130px] pl-[76px] pt-[78px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))]"
    >
      <div
        data-anim="aura"
        aria-hidden="true"
        className="deck-aura pointer-events-none absolute -right-[14%] -bottom-[44%] h-[150%] w-[64%]"
        style={{
          background:
            'radial-gradient(42% 42% at 50% 50%, rgba(232,163,61,0.22) 0%, rgba(232,163,61,0) 70%), radial-gradient(36% 36% at 34% 62%, rgba(192,96,58,0.20) 0%, rgba(192,96,58,0) 72%)',
          // Design line 268 gives ch6's aura a 24s drift, not ch0's 20s
          // baked into the shared .deck-aura class (src/styles/atmosphere.css)
          // — overriding only the duration here keeps the keyframe, easing
          // and reduced-motion shutoff shared while matching ch6's own number.
          animationDuration: '24s',
        }}
      />

      <div className="relative z-[1]">
        <div
          data-anim="fade"
          className="mb-[22px] font-mono text-[10.5px] uppercase tracking-[0.18em] text-dim-2"
        >
          Leg 06 · clearance to contact
        </div>

        <h3
          ref={headingRef}
          data-split="1"
          className="m-0 mb-[22px] font-display text-[clamp(32px,5vw,78px)] font-extralight leading-none tracking-[-0.035em] text-bone [text-wrap:pretty]"
        >
          Cleared for departure.
        </h3>

        <p
          data-anim="fade"
          className="m-0 mb-[22px] max-w-[520px] text-[16.5px] leading-[1.7] text-dim-0 [text-wrap:pretty]"
        >
          Hiring for a senior full-stack or platform role? Remote-friendly, Nairobi-based,
          comfortable owning the whole path from schema to server. Happy to walk through any leg
          above in detail.
        </p>

        <div
          data-anim="fade"
          className="font-mono text-[11px] leading-[1.9] text-dim-3"
        >
          <CredentialLine text={msc} />
          <br />
          {restEducation.join(' · ')}
          <br />
          <CredentialLine text={aws} /> · <CredentialLine text={cisco} />
        </div>
      </div>

      <div data-anim="fade" className="relative z-[1] border border-body/16">
        {CONTACT.map((row) => {
          const external = row.href.startsWith('http');
          return (
            <a
              key={row.label}
              href={row.href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={`flex justify-between gap-4 border-b border-body/10 px-5 py-[17px] font-mono text-[13px] last:border-b-0 hover:bg-ember/8 hover:text-ember ${
                row.label === 'DOCUMENT' ? 'text-ember' : 'text-body'
              }`}
            >
              <span className="text-dim-3">{row.label}</span>
              {row.value}
            </a>
          );
        })}
      </div>
    </section>
  );
}
