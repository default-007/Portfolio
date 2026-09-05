import { competencySheetVars } from './mockupPalette';

// Ported from design source (portfolio-v5-flight-deck.dc.html lines 135-160):
// the CBC competency assessment sheet mockup for ch2. Rendered as `children`
// of `CaseStudy`, which already supplies the horizontal-scroll wrapper
// (`max-w-full overflow-x-auto overflow-y-hidden py-1.5` in CaseStudy.tsx —
// itself a translation of the design's own `max-width:100%;overflow-x:auto;
// overflow-y:hidden;padding:6px 0` wrapper div at line 135), so this
// component's root is the inner `data-anim="screen"` box at line 136 rather
// than that wrapper — duplicating it here would double the 6px vertical
// padding and nest two overflow-x-auto containers.
//
// Decorative product illustration with invented sample data (learner names,
// scores): wrapped in role="img" with a describing aria-label, and every
// internal node is aria-hidden so a screen reader isn't read a roster of
// fictional students.
export function CompetencySheet() {
  return (
    <div
      data-anim="screen"
      role="img"
      aria-label="Mockup of a CBC competency assessment sheet"
      style={competencySheetVars}
      className="min-w-[620px] overflow-hidden border border-body/14 bg-[var(--mock-paper)] shadow-[0_40px_90px_rgba(0,0,0,0.55)]"
    >
      <div
        aria-hidden="true"
        className="flex items-center gap-2 border-b border-[var(--mock-paper-header-border)] bg-[var(--mock-paper-header)] px-3 py-[9px]"
      >
        <span className="h-2 w-2 rounded-full bg-rust" />
        <span className="h-2 w-2 rounded-full bg-ember" />
        <span className="h-2 w-2 rounded-full bg-go" />
        <span className="ml-2 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[10px] text-dim-1">
          cbc.school / grade 5 · term 2 · competency sheet
        </span>
      </div>

      <div
        aria-hidden="true"
        className="grid min-h-[330px] [grid-template-columns:132px_minmax(0,1fr)]"
      >
        <div className="flex flex-col gap-[9px] border-r border-[var(--mock-sidebar-border)] bg-[var(--mock-sidebar)] px-3 py-3.5 font-mono text-[10.5px] text-[var(--mock-sidebar-ink)]">
          <div className="tracking-[0.12em] text-[var(--mock-clay)]">MENU</div>
          <div className="bg-rust px-2 py-1.5 text-bone">Assessment</div>
          <div className="px-2 py-1.5">Learners</div>
          <div className="px-2 py-1.5">Timetable</div>
          <div className="px-2 py-1.5">Fees</div>
          <div className="px-2 py-1.5">Reports</div>
          <div className="mt-auto text-go">● synced 2m ago</div>
        </div>

        <div className="px-[18px] py-4">
          <div className="mb-3.5 flex items-baseline justify-between">
            <div className="whitespace-nowrap font-display text-[22px] text-[var(--mock-ink)]">
              Mathematics · Number
            </div>
            <div className="whitespace-nowrap font-mono text-[10px] text-dim-1">32 LEARNERS</div>
          </div>

          <div className="grid gap-0 border-b border-[var(--mock-sidebar-border)] pb-[7px] font-mono text-[9.5px] tracking-[0.1em] text-[var(--mock-clay)] [grid-template-columns:minmax(0,1fr)_62px_62px_62px_74px]">
            <span>LEARNER</span>
            <span>ADD/SUB</span>
            <span>FRACT</span>
            <span>MEASURE</span>
            <span className="text-right">LEVEL</span>
          </div>

          <div className="grid items-center border-b border-[var(--mock-row-divider)] py-[9px] text-[12.5px] text-[var(--mock-row-ink)] [grid-template-columns:minmax(0,1fr)_62px_62px_62px_74px]">
            <span>Achieng, W.</span>
            <span className="font-mono text-[11px] text-[var(--mock-deep-green)]">EE</span>
            <span className="font-mono text-[11px] text-[var(--mock-deep-green)]">EE</span>
            <span className="font-mono text-[11px] text-[var(--mock-clay)]">ME</span>
            <span className="text-right">
              <span className="bg-[var(--mock-badge-green-bg)] px-[7px] py-[3px] font-mono text-[9.5px] text-[var(--mock-deep-green)]">
                EXCEEDING
              </span>
            </span>
          </div>

          <div className="grid items-center border-b border-[var(--mock-row-divider)] py-[9px] text-[12.5px] text-[var(--mock-row-ink)] [grid-template-columns:minmax(0,1fr)_62px_62px_62px_74px]">
            <span>Barasa, K.</span>
            <span className="font-mono text-[11px] text-[var(--mock-clay)]">ME</span>
            <span className="font-mono text-[11px] text-[var(--mock-clay)]">ME</span>
            <span className="font-mono text-[11px] text-[var(--mock-clay)]">ME</span>
            <span className="text-right">
              <span className="bg-[var(--mock-badge-tan-bg)] px-[7px] py-[3px] font-mono text-[9.5px] text-[var(--mock-clay)]">
                MEETING
              </span>
            </span>
          </div>

          <div className="grid items-center border-b border-[var(--mock-row-divider)] py-[9px] text-[12.5px] text-[var(--mock-row-ink)] [grid-template-columns:minmax(0,1fr)_62px_62px_62px_74px]">
            <span>Chebet, N.</span>
            <span className="font-mono text-[11px] text-[var(--mock-clay)]">ME</span>
            <span className="font-mono text-[11px] text-rust">AE</span>
            <span className="font-mono text-[11px] text-[var(--mock-clay)]">ME</span>
            <span className="text-right">
              <span className="bg-[var(--mock-badge-tan-bg)] px-[7px] py-[3px] font-mono text-[9.5px] text-[var(--mock-clay)]">
                MEETING
              </span>
            </span>
          </div>

          <div className="grid items-center border-b border-[var(--mock-row-divider)] py-[9px] text-[12.5px] text-[var(--mock-row-ink)] [grid-template-columns:minmax(0,1fr)_62px_62px_62px_74px]">
            <span>Kimani, J.</span>
            <span className="font-mono text-[11px] text-rust">AE</span>
            <span className="font-mono text-[11px] text-rust">AE</span>
            <span className="font-mono text-[11px] text-[var(--mock-clay)]">ME</span>
            <span className="text-right">
              <span className="bg-[var(--mock-badge-peach-bg)] px-[7px] py-[3px] font-mono text-[9.5px] text-rust">
                APPROACHING
              </span>
            </span>
          </div>

          <div className="grid items-center py-[9px] text-[12.5px] text-[var(--mock-row-ink)] [grid-template-columns:minmax(0,1fr)_62px_62px_62px_74px]">
            <span>Omondi, T.</span>
            <span className="font-mono text-[11px] text-[var(--mock-deep-green)]">EE</span>
            <span className="font-mono text-[11px] text-[var(--mock-clay)]">ME</span>
            <span className="font-mono text-[11px] text-[var(--mock-deep-green)]">EE</span>
            <span className="text-right">
              <span className="bg-[var(--mock-badge-green-bg)] px-[7px] py-[3px] font-mono text-[9.5px] text-[var(--mock-deep-green)]">
                EXCEEDING
              </span>
            </span>
          </div>

          <div className="mt-3.5 flex gap-2 font-mono text-[9.5px] text-dim-1">
            <span className="whitespace-nowrap border border-[var(--mock-sidebar-border)] px-[9px] py-[5px]">
              SAVE DRAFT
            </span>
            <span className="whitespace-nowrap bg-[var(--mock-ink)] px-[9px] py-[5px] text-bone">
              SUBMIT TO HEAD
            </span>
            <span className="whitespace-nowrap py-[5px]">Audit: 4 changes stamped</span>
          </div>
        </div>
      </div>
    </div>
  );
}
