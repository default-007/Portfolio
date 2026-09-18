// Ported from design source (portfolio-v5-flight-deck.dc.html lines 48-50):
// three 16px L-shaped corner marks, each two adjoining 1px ember borders,
// positioned against a full-viewport wrapper exactly as in the design.
export function CornerBrackets() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60]">
      <div className="absolute right-[14px] top-[52px] h-[16px] w-[16px] border-t border-r border-ember/40" />
      <div className="absolute bottom-[88px] right-[14px] h-[16px] w-[16px] border-b border-r border-ember/40" />
      <div className="absolute bottom-[88px] left-[70px] h-[16px] w-[16px] border-b border-l border-ember/40" />
    </div>
  );
}
