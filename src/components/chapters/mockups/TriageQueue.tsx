import { prefersReducedMotion } from '../../../lib/env';
import { triageQueueVars } from './mockupPalette';

// Ported from design source (portfolio-v5-flight-deck.dc.html lines 164-188):
// the WaterWatch fault-triage queue mockup for ch3. Rendered as `children`
// of `CaseStudy`, which already supplies the horizontal-scroll wrapper (see
// the note in CompetencySheet.tsx), so this component's root is the inner
// `data-anim="screen"` box at line 165, not the wrapper at line 164.
//
// The breaching pin on the point map blinks via `animation:v5-blink 1.8s
// infinite` in the design (line 178). That opacity flicker is exactly what
// the existing `deck-blink` keyframe (src/styles/atmosphere.css, already
// used by Arrival.tsx) does, so it's reused here at the design's own 1.8s
// duration rather than adding a second, identical keyframe under a new
// name — gated by `prefersReducedMotion()` the same way Arrival.tsx gates
// its own use of it.
//
// The four queue rows carry data-row="1" from the design (lines 169-172):
// useReveal stages the rows of each [data-anim="screen"] in on the screen's
// own trigger, so the marker is what puts this queue's rows in that stagger.
//
// Decorative product illustration with invented sample data (site names,
// timestamps, technician handles): wrapped in role="img" with a describing
// aria-label, and every internal node is aria-hidden so a screen reader
// isn't read a fabricated incident log.
export function TriageQueue() {
  const reduced = prefersReducedMotion();

  return (
    <div
      data-anim="screen"
      role="img"
      aria-label="Mockup of the WaterWatch fault-triage queue"
      style={triageQueueVars}
      className="min-w-[660px] overflow-hidden border border-body/14 bg-[var(--mock-dark-bg)] shadow-[0_40px_90px_rgba(0,0,0,0.6)]"
    >
      <div
        aria-hidden="true"
        className="flex items-center justify-between whitespace-nowrap border-b border-go/20 bg-[var(--mock-header-bg)] px-3 py-[9px] font-mono text-[10px] text-go"
      >
        <span className="overflow-hidden text-ellipsis">WATERWATCH · TRIAGE QUEUE · SDG 6.1</span>
        <span>14 OPEN · 3 BREACHING</span>
      </div>

      <div
        aria-hidden="true"
        className="grid min-h-[340px] [grid-template-columns:minmax(0,1fr)_210px]"
      >
        <div className="flex flex-col gap-2 px-[14px] py-3">
          <div
            data-row="1"
            className="grid grid-cols-[minmax(0,1fr)_92px] items-center gap-3 border border-go/22 p-[11px_12px]"
          >
            <div>
              <div className="text-[13px] text-body">Borehole 14 · Kibera South</div>
              <div className="mt-[3px] font-mono text-[10px] text-[var(--mock-muted-green-gray)]">
                CONTAMINATION · reported 09:14 · 22 households
              </div>
            </div>
            <div className="bg-rust px-[7px] py-1 text-center font-mono text-[9.5px] text-[var(--mock-badge-ink)]">
              BREACHING
            </div>
          </div>

          <div
            data-row="1"
            className="grid grid-cols-[minmax(0,1fr)_92px] items-center gap-3 border border-go/16 p-[11px_12px]"
          >
            <div>
              <div className="text-[13px] text-body">Standpipe 07 · Ruiru</div>
              <div className="mt-[3px] font-mono text-[10px] text-[var(--mock-muted-green-gray)]">
                NO FLOW · claimed by tech_04 · 41m ago
              </div>
            </div>
            <div className="bg-ember px-[7px] py-1 text-center font-mono text-[9.5px] text-[var(--mock-badge-ink)]">
              CLAIMED
            </div>
          </div>

          <div
            data-row="1"
            className="grid grid-cols-[minmax(0,1fr)_92px] items-center gap-3 border border-go/16 p-[11px_12px]"
          >
            <div>
              <div className="text-[13px] text-body">Kiosk 22 · Athi River</div>
              <div className="mt-[3px] font-mono text-[10px] text-[var(--mock-muted-green-gray)]">
                PUMP FAULT · unassigned · 2h 06m
              </div>
            </div>
            <div className="border border-body/30 px-[7px] py-1 text-center font-mono text-[9.5px] text-body">
              TRIAGE
            </div>
          </div>

          <div
            data-row="1"
            className="grid grid-cols-[minmax(0,1fr)_92px] items-center gap-3 border border-go/16 p-[11px_12px]"
          >
            <div>
              <div className="text-[13px] text-body">Borehole 03 · Kajiado</div>
              <div className="mt-[3px] font-mono text-[10px] text-[var(--mock-muted-green-gray)]">
                RESOLVED by tech_01 · signed off 08:52
              </div>
            </div>
            <div className="bg-go px-[7px] py-1 text-center font-mono text-[9.5px] text-[var(--mock-badge-ink)]">
              CLOSED
            </div>
          </div>

          <div className="mt-auto border-t border-go/14 pt-[9px] font-mono text-[9.5px] text-[var(--mock-dim-green-gray)]">
            AUDIT · every transition carries actor + timestamp
          </div>
        </div>

        <div className="relative border-l border-go/18 bg-[var(--mock-panel-bg)] p-3">
          <div className="mb-[10px] font-mono text-[9.5px] tracking-[0.14em] text-[var(--mock-dim-green-gray)]">
            POINT MAP
          </div>
          <div
            className="relative h-[210px] border border-go/16"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg,rgba(143,184,119,0.07) 0px,rgba(143,184,119,0.07) 1px,transparent 1px,transparent 26px),repeating-linear-gradient(90deg,rgba(143,184,119,0.07) 0px,rgba(143,184,119,0.07) 1px,transparent 1px,transparent 26px)',
            }}
          >
            <div
              className={`absolute h-[9px] w-[9px] rounded-full bg-rust shadow-[0_0_12px_3px_rgba(192,96,58,0.6)]${reduced ? '' : ' animate-[deck-blink_1.8s_infinite]'}`}
              style={{ left: '22%', top: '30%' }}
            />
            <div className="absolute h-[7px] w-[7px] rounded-full bg-ember" style={{ left: '58%', top: '20%' }} />
            <div className="absolute h-[7px] w-[7px] rounded-full bg-body" style={{ left: '70%', top: '62%' }} />
            <div className="absolute h-[7px] w-[7px] rounded-full bg-go" style={{ left: '34%', top: '74%' }} />
            <div className="absolute h-[7px] w-[7px] rounded-full bg-go" style={{ left: '46%', top: '48%' }} />
          </div>
          <div className="mt-3 font-mono text-[10px] leading-[2] text-[var(--mock-muted-green-gray)]">
            MTTR · 11h 24m
            <br />
            SLA HIT · 90%
            <br />
            OWNERLESS · 0
          </div>
        </div>
      </div>
    </div>
  );
}
