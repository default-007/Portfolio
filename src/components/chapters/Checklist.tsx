import { useRef } from 'react';
import { useSplitText } from '../../motion/useSplitText';
import { CHAPTERS } from '../../data/chapters';
import { CHECKLIST } from '../../data/checklist';

// Ported from design source (portfolio-v5-flight-deck.dc.html lines 240-265):
// chapter 05, the standard-procedure checklist.
//
// The design's companion "occurrence report" panel is deliberately not
// rendered. Its four fields were never filled in, so the deployed page was
// showing the design's own prompts to Brian ("Awaiting your account...",
// "Send me the four answers and I'll set this in type") as though they were
// body copy. An empty form is worse than no form: it reads as unfinished and
// it is addressed to the wrong person. The panel's markup is still in
// design/portfolio-v5-flight-deck.dc.html and in this file's git history, so
// restoring it is a copy change once a real incident account exists.
export function Checklist() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useSplitText(headingRef);

  const chapter = CHAPTERS.find((c) => c.id === 'ch5')!;

  return (
    <section
      id="ch5"
      data-chapter={chapter.hudLabel}
      data-screen-label={chapter.screenLabel}
      className="relative grid min-h-[calc(100dvh-var(--console-rest-h))] items-center gap-[52px] border-b border-body/10 bg-deck-raised pb-[120px] pl-[64px] pr-5 md:pl-[76px] md:pr-10 pt-[78px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))]"
    >
      <div>
        <h3
          ref={headingRef}
          data-split="1"
          className="m-0 mb-5 font-display text-[clamp(30px,4vw,60px)] font-light leading-[1.04] tracking-[-0.03em] text-bone [text-wrap:pretty]"
        >
          Aviation gave me a checklist habit. I never shipped it away.
        </h3>

        <p
          data-anim="fade"
          className="m-0 max-w-[460px] text-[16px] leading-[1.68] text-dim-0 [text-wrap:pretty]"
        >
          At the Kenya Civil Aviation Authority I prepared Air Operator Certificates and
          reviewed operations manuals, documents whose whole purpose is that nothing
          important depends on memory. Six things I run before anything of mine touches
          production.
        </p>
      </div>

      <div className="border-t border-body/12">
        {CHECKLIST.map((item, i) => (
          <div
            key={item.title}
            data-anim="check"
            className={`grid grid-cols-[24px_1fr] items-baseline gap-[14px] py-4 ${
              i < CHECKLIST.length - 1 ? 'border-b border-body/8' : ''
            }`}
          >
            {/* The design's third column printed "CHECKED" on every row. The
                tick already carries that, so six repetitions of the word were
                decoration, and the column they sat in was the widest-tracked,
                lowest-contrast text on the page. */}
            <span className="font-mono text-[13px] text-go">✓</span>
            <div>
              <div className="text-[16px] font-semibold text-bone">{item.title}</div>
              <div className="mt-[3px] text-[14px] text-dim-1">{item.body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
