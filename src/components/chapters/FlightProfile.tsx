import { useRef, Fragment } from 'react';
import { useSplitText } from '../../motion/useSplitText';
import { useCounter } from '../../motion/useCounter';
import { LEGS, STATS, type Stat } from '../../data/experience';

const YEARS = ['18', '19', '20', '21', '22', '23', '24', '25', '26'];

// One stat tile per instance so each gets its own useCounter hook call —
// STATS has a fixed length, but a per-item subcomponent keeps hook usage
// unconditional and out of a loop in the parent's own body.
function StatTile({ stat, isFirst }: { stat: Stat; isFirst: boolean }) {
  const countRef = useCounter(stat.value, stat.decimals);

  return (
    <div
      data-anim="stat"
      className={`bg-deck-raised py-5 ${isFirst ? 'pl-0 pr-5' : 'p-5'}`}
    >
      <div className="font-display text-[clamp(34px,3.8vw,52px)] leading-none text-ember">
        <span ref={countRef}>{stat.value.toFixed(stat.decimals ?? 0)}</span>
        {stat.suffix}
      </div>
      <div className="mt-[7px] font-mono text-[10.5px] leading-[1.7] text-dim-1">
        {stat.label.split('\n').map((line, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {line}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// Ported from design source (portfolio-v5-flight-deck.dc.html lines 102-121):
// chapter 01, the career timeline and the four headline stats. The section
// id/data attributes are copied verbatim from the design — the console
// anchors to `#ch1` and `useChapterTracking` keys off `section[data-chapter]`.
export function FlightProfile() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useSplitText(headingRef);

  return (
    <section
      id="ch1"
      data-chapter="01 · Flight profile"
      data-screen-label="01"
      className="relative flex min-h-screen flex-col justify-center gap-[34px] border-b border-body/10 bg-deck-raised pb-[120px] pl-[76px] pr-10 pt-[78px]"
    >
      <div
        data-anim="fade"
        className="flex flex-wrap items-baseline justify-between gap-[10px] border-b border-body/12 pb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-dim-2"
      >
        <span className="whitespace-nowrap text-ember">Flight profile · 2018 — 2026</span>
        <span className="whitespace-nowrap">6 legs logged</span>
      </div>

      <h2
        ref={headingRef}
        data-split="1"
        className="m-0 max-w-[900px] font-display text-[clamp(30px,4.4vw,64px)] font-extralight leading-[1.04] tracking-[-0.03em] text-bone [text-wrap:pretty]"
      >
        Aviation, then fintech, then GIS, then ERP. The altitude only went one way.
      </h2>

      <div className="flex flex-col gap-0 border-t border-body/10">
        <div className="grid grid-cols-[190px_minmax(0,1fr)_96px] gap-[18px] py-[11px] font-mono text-[9.5px] uppercase tracking-[0.16em] text-dim-4">
          <span>Operator</span>
          <span className="grid grid-cols-9">
            {YEARS.map((year) => (
              <span key={year}>{year}</span>
            ))}
          </span>
          <span className="text-right">Sector</span>
        </div>

        {LEGS.map((leg) => (
          <div
            key={leg.company}
            data-anim="leg"
            className="grid grid-cols-[190px_minmax(0,1fr)_96px] items-center gap-[18px] border-t border-body/7 py-[13px] transition-colors duration-[350ms] hover:bg-ember/5"
          >
            <div className="text-[13.5px] text-bone">
              {leg.company}
              <div className="mt-0.5 font-mono text-[10.5px] text-dim-1">
                {leg.role}
                <span className="mt-0.5 block text-dim-3">{leg.detail}</span>
              </div>
            </div>
            <div className="relative grid h-[26px] grid-cols-9">
              <div
                data-bar="1"
                className="h-[26px] overflow-hidden whitespace-nowrap"
                style={{
                  gridColumn: `${leg.startCol} / span ${leg.span}`,
                  background: `linear-gradient(90deg, ${leg.gradient[0]}, ${leg.gradient[1]})`,
                  transformOrigin: '0 50%',
                }}
              />
            </div>
            <div className="text-right font-mono text-[10.5px] text-dim-3">{leg.sector}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-px bg-body/10">
        {STATS.map((stat, i) => (
          <StatTile key={stat.label} stat={stat} isFirst={i === 0} />
        ))}
      </div>
    </section>
  );
}
