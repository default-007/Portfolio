import { useRef } from 'react';
import { useSplitText } from '../../motion/useSplitText';
import { CHAPTERS } from '../../data/chapters';
import { CHECKLIST, REPORT_FIELDS, REPORT_CLOSING_NOTE } from '../../data/checklist';

// Ported from design source (portfolio-v5-flight-deck.dc.html lines 240-265):
// chapter 05, the standard-procedure checklist and the occurrence report
// panel. The report's four fields are the design's own unanswered
// placeholders (see src/data/checklist.ts REPORT_IS_PLACEHOLDER) — this
// component renders them as static text only, with no <form>/<input>, since
// there is no backend to receive a submission on this static build.
export function Checklist() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useSplitText(headingRef);

  const chapter = CHAPTERS.find((c) => c.id === 'ch5')!;

  return (
    <section
      id="ch5"
      data-chapter={chapter.hudLabel}
      data-screen-label={chapter.screenLabel}
      className="relative grid min-h-screen items-center gap-[52px] border-b border-body/10 bg-deck-raised pb-[120px] pl-[76px] pr-10 pt-[78px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))]"
    >
      <div>
        <div
          data-anim="fade"
          className="mb-5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ember"
        >
          Leg 05 · standard procedure
        </div>

        <h3
          ref={headingRef}
          data-split="1"
          className="m-0 mb-5 font-display text-[clamp(30px,4vw,60px)] font-extralight leading-[1.04] tracking-[-0.03em] text-bone [text-wrap:pretty]"
        >
          Aviation gave me a checklist habit. I never shipped it away.
        </h3>

        <p
          data-anim="fade"
          className="m-0 mb-8 max-w-[460px] text-[16px] leading-[1.68] text-dim-0 [text-wrap:pretty]"
        >
          At the Kenya Civil Aviation Authority I prepared Air Operator Certificates and
          reviewed operations manuals — documents whose whole purpose is that nothing
          important depends on memory. Six things I run before anything of mine touches
          production.
        </p>

        <div data-anim="report" className="max-w-[460px] border border-ember/30 bg-ember/4">
          <div className="flex items-center justify-between gap-3 whitespace-nowrap border-b border-ember/25 px-4 py-[11px] font-mono text-[9.5px] uppercase tracking-[0.16em] text-ember">
            <span>Occurrence report</span>
            <span className="text-dim-2">FORM 05—A</span>
          </div>

          <div className="flex flex-col gap-[13px] px-4 py-[15px]">
            {REPORT_FIELDS.map((field, i) => (
              <div key={field.n}>
                <div className="mb-[5px] font-mono text-[9px] tracking-[0.14em] text-dim-2">
                  <span>{field.n} · </span>
                  <span>{field.label}</span>
                </div>
                {/* data-field is a hook, not a copy-paste artifact: the
                    design's report reveal queries [data-field] inside
                    [data-anim="report"] (line 613) and its 2.2s safety-net
                    re-shows anything still faded (line 540). It sits on the
                    answer text alone, so the numbered label stays put while
                    only the answer slides in — putting it on the wrapper
                    would animate the whole block and change the reveal. */}
                <div
                  data-field="1"
                  className={`text-[14px] italic leading-[1.55] text-dim-1 ${
                    i < REPORT_FIELDS.length - 1
                      ? 'border-b border-dashed border-body/18 pb-[9px]'
                      : 'pb-0.5'
                  }`}
                >
                  {field.placeholder}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-ember/20 px-4 py-[10px] font-mono text-[10.5px] text-dim-0 [text-wrap:pretty]">
            {REPORT_CLOSING_NOTE}
          </div>
        </div>
      </div>

      <div className="border-t border-body/12">
        {CHECKLIST.map((item, i) => (
          <div
            key={item.title}
            data-anim="check"
            className={`grid grid-cols-[24px_1fr_88px] items-baseline gap-[14px] py-4 ${
              i < CHECKLIST.length - 1 ? 'border-b border-body/8' : ''
            }`}
          >
            <span className="font-mono text-[13px] text-go">✓</span>
            <div>
              <div className="text-[16px] font-semibold text-bone">{item.title}</div>
              <div className="mt-[3px] text-[14px] text-dim-1">{item.body}</div>
            </div>
            <span className="text-right font-mono text-[9.5px] text-dim-4">CHECKED</span>
          </div>
        ))}
      </div>
    </section>
  );
}
