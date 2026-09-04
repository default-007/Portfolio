import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../../lib/env';

function readClock(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

// Ported from design source (portfolio-v5-flight-deck.dc.html lines 37-41):
// a fixed 38px strip with availability status on the left, the active
// chapter label centred, and a live clock plus location on the right.
export function StatusStrip({ activeChapterLabel }: { activeChapterLabel: string }) {
  const [clock, setClock] = useState(readClock);

  useEffect(() => {
    const id = window.setInterval(() => setClock(readClock()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const reduced = prefersReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex h-[38px] items-center justify-between gap-[18px] overflow-hidden whitespace-nowrap border-b border-body/12 px-[18px] font-mono text-[10px] uppercase tracking-[0.18em] text-dim-2"
      style={{
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--color-deck) 94%, transparent), color-mix(in srgb, var(--color-deck) 55%, transparent))',
      }}
    >
      <span className="flex flex-none items-center gap-[9px] text-go">
        <span
          className={`h-[6px] w-[6px] rounded-full bg-go${reduced ? '' : ' animate-[deck-blink_2.4s_infinite]'}`}
        />
        Available for assignment
      </span>
      <span className="overflow-hidden text-ellipsis text-ember">{activeChapterLabel}</span>
      <span className="flex flex-none gap-[16px]">
        <span data-testid="hud-clock" aria-hidden="true">
          {clock}
        </span>
        <span>NBO · UTC+3</span>
      </span>
    </div>
  );
}
