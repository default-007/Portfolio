// Ported from design source (portfolio-v5-flight-deck.dc.html lines 42-47):
// a fixed left rail below the status strip with a track running down its
// centre, an ember dot positioned by scroll progress, and a zero-padded
// percentage readout beneath it. In the design this sits inside a
// `position:fixed;inset:0` wrapper and is itself `position:absolute`; split
// out as its own component it is `position:fixed` directly, which is
// geometrically identical since that wrapper covered the full viewport.
export function AltitudeLadder({ progress }: { progress: number }) {
  const pct = String(Math.round(progress * 100)).padStart(3, '0');

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-0 left-0 top-[38px] z-[60] flex w-[56px] flex-col items-center justify-center border-r border-body/8"
    >
      <div className="relative h-[52%] w-px bg-body/14">
        <div
          className="absolute -left-[3px] h-[7px] w-[7px] rounded-full bg-ember shadow-[0_0_14px_3px_rgba(232,163,61,0.5)]"
          style={{ top: `${progress * 100}%` }}
        />
      </div>
      <div className="mt-[16px] font-mono text-[10px] tracking-[0.14em] text-dim-2">{pct}</div>
    </div>
  );
}
