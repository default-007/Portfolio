// Ported from design source (portfolio-v5-flight-deck.dc.html lines 37-41):
// a fixed 38px strip with availability status on the left, the active
// chapter label centred, and the operating timezone on the right.
//
// Two things from the design are deliberately gone. The ticking seconds
// clock: it re-rendered this component once a second to display information
// no visitor needs, and a running clock is the stock "atmospheric HUD"
// flourish. And the blink on the availability lamp: availability is a
// standing fact, not a live feed, so the lamp is simply lit. What stays is
// "Nairobi · UTC+3", which is real information for anyone reading this as a
// remote hire, stated once and not animated.
export function StatusStrip({ activeChapterLabel }: { activeChapterLabel: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex h-[38px] items-center justify-between gap-[18px] overflow-hidden whitespace-nowrap border-b border-body/12 px-[18px] font-mono text-[11px] uppercase tracking-[0.12em] text-dim-2"
      style={{
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--color-deck) 94%, transparent), color-mix(in srgb, var(--color-deck) 55%, transparent))',
      }}
    >
      <span className="flex flex-none items-center gap-[9px] text-go">
        <span className="h-[6px] w-[6px] rounded-full bg-go" />
        Available for assignment
      </span>
      <span className="overflow-hidden text-ellipsis text-ember">{activeChapterLabel}</span>
      {/* Three items do not fit a 375px strip, and the strip clips rather
          than wraps, so on a phone this was rendering half-cut. Availability
          and the chapter readout are the two that earn the space. */}
      <span className="hidden flex-none sm:inline">Nairobi · UTC+3</span>
    </div>
  );
}
