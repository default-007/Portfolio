import { ticketQueuePhoneVars } from './mockupPalette';

// Ported from design source (portfolio-v5-flight-deck.dc.html lines 214-238):
// the Smart Ticketing agent-queue phone mockup for ch4. Rendered as
// `children` of `CaseStudy`, which already supplies the horizontal-scroll
// wrapper (see the note in CompetencySheet.tsx), so this component's root
// is the inner `data-anim="screen"` box at line 215, not the wrapper at
// line 214.
//
// This root is itself the two-column CSS grid (phone + dispatch panel), so
// (unlike the other two mockups) `aria-hidden` is applied to each of its two
// direct children individually rather than to one wrapping div — a wrapper
// would become the grid's sole auto-placed item and collapse the
// `248px minmax(0,1fr)` column split.
//
// Decorative product illustration with invented sample data (ticket
// numbers, branch names, SLA figures): wrapped in role="img" with a
// describing aria-label, and every internal node is aria-hidden so a
// screen reader isn't read a fabricated ticket queue.
export function TicketQueuePhone() {
  return (
    <div
      data-anim="screen"
      role="img"
      aria-label="Mockup of the Smart Ticketing agent queue on a phone"
      style={ticketQueuePhoneVars}
      className="grid min-w-[560px] grid-cols-[248px_minmax(0,1fr)] items-center gap-5"
    >
      <div
        aria-hidden="true"
        className="rounded-[26px] border border-body/16 bg-[var(--mock-phone-case)] p-[10px] shadow-[0_40px_90px_rgba(0,0,0,0.6)]"
      >
        <div className="overflow-hidden rounded-[18px] bg-[var(--mock-phone-screen)]">
          <div className="flex justify-between p-[9px_14px_7px] font-mono text-[9.5px] text-dim-1">
            <span>9:41</span>
            <span>▮▮▮ ⌁</span>
          </div>
          <div className="flex flex-col gap-2 p-[10px_12px_14px]">
            <div className="mb-0.5 font-display text-[19px] text-bone">My queue · 6</div>

            <div className="border border-ember/30 p-[9px_10px]">
              <div className="text-[12.5px] text-bone">#4821 · POS offline</div>
              <div className="mt-1 font-mono text-[9.5px] text-dim-1">Nakuru branch · P1</div>
              <div className="mt-2 h-[3px] bg-body/12">
                <div className="h-[3px] w-[82%] bg-rust" />
              </div>
              <div className="mt-[5px] font-mono text-[9px] text-rust">SLA 82% · 34m LEFT</div>
            </div>

            <div className="border border-body/12 p-[9px_10px]">
              <div className="text-[12.5px] text-bone">#4817 · Receipt printer</div>
              <div className="mt-1 font-mono text-[9.5px] text-dim-1">Thika road · P2</div>
              <div className="mt-2 h-[3px] bg-body/12">
                <div className="h-[3px] w-[44%] bg-ember" />
              </div>
              <div className="mt-[5px] font-mono text-[9px] text-ember">SLA 44% · 3h 12m</div>
            </div>

            <div className="border border-body/12 p-[9px_10px]">
              <div className="text-[12.5px] text-bone">#4809 · M-Pesa mismatch</div>
              <div className="mt-1 font-mono text-[9.5px] text-dim-1">Westlands · P3</div>
              <div className="mt-2 h-[3px] bg-body/12">
                <div className="h-[3px] w-[18%] bg-go" />
              </div>
              <div className="mt-[5px] font-mono text-[9px] text-go">SLA 18% · 9h 40m</div>
            </div>

            <div className="mt-0.5 flex gap-[7px]">
              <span className="flex-1 bg-rust p-[8px_0] text-center font-mono text-[9.5px] text-bone">
                CLAIM
              </span>
              <span className="flex-1 border border-body/20 p-[8px_0] text-center font-mono text-[9.5px] text-body">
                ESCALATE
              </span>
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="border border-body/12 bg-[var(--mock-dispatch-bg)] p-[16px_18px]">
        <div className="mb-3 font-mono text-[9.5px] tracking-[0.16em] text-dim-3">
          DISPATCH · SLA PRESSURE, LAST 12H
        </div>
        <div className="grid h-[150px] grid-cols-12 items-end gap-[5px]">
          <div className="h-[38%] origin-[50%_100%] bg-[var(--mock-deep-green)]" />
          <div className="h-[52%] origin-[50%_100%] bg-[var(--mock-deep-green)]" />
          <div className="h-[44%] origin-[50%_100%] bg-[var(--mock-deep-green)]" />
          <div className="h-[68%] origin-[50%_100%] bg-ember" />
          <div className="h-[82%] origin-[50%_100%] bg-ember" />
          <div className="h-[96%] origin-[50%_100%] bg-rust" />
          <div className="h-[74%] origin-[50%_100%] bg-ember" />
          <div className="h-[58%] origin-[50%_100%] bg-[var(--mock-deep-green)]" />
          <div className="h-[46%] origin-[50%_100%] bg-[var(--mock-deep-green)]" />
          <div className="h-[34%] origin-[50%_100%] bg-[var(--mock-deep-green)]" />
          <div className="h-[28%] origin-[50%_100%] bg-[var(--mock-deep-green)]" />
          <div className="h-[40%] origin-[50%_100%] bg-[var(--mock-deep-green)]" />
        </div>
        <div className="mt-[9px] flex justify-between font-mono text-[9px] text-dim-4">
          <span>21:00</span>
          <span>03:00</span>
          <span>09:00</span>
        </div>
        <div className="mt-[14px] border-t border-body/10 pt-[11px] font-mono text-[10px] leading-[1.9] text-dim-1">
          PEAK 06:00 · 96% OF SLA
          <br />
          ESCALATED BEFORE BREACH · 1
          <br />
          BREACHES · 0
        </div>
      </div>
    </div>
  );
}
