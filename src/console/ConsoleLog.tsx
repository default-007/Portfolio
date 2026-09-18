import type { ConsoleLine } from './useConsole';

// Ported from design source (portfolio-v5-flight-deck.dc.html lines 56-59):
// the scrollback above the command row. Bottom-aligned and capped to
// 150px so it grows upward as lines are appended; each line is a mono
// 11.5px row with the mark in dim-4 and the text in its reducer-assigned
// colour. `aria-live="polite"` is not in the design canvas — it is added
// here so a screen-reader user hears replies to the commands they type.
export function ConsoleLog({ lines }: { lines: ConsoleLine[] }) {
  return (
    <div
      aria-live="polite"
      className="flex max-h-[150px] flex-col justify-end overflow-hidden px-[18px]"
    >
      {/* Keyed by the line's own id, not its array index: see the note on
          `append` in useConsole.ts — an index key turns every append past the
          cap into six rewritten nodes in this aria-live region. */}
      {lines.map((line) => (
        <div key={line.id} className="flex gap-[9px] font-mono text-[11.5px] leading-[1.85]">
          <span className="flex-none text-dim-4">{line.mark}</span>
          <span style={{ color: line.color }}>{line.text}</span>
        </div>
      ))}
    </div>
  );
}
