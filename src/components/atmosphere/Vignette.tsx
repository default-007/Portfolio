// Ported from design source (portfolio-v5-flight-deck.dc.html): a fixed,
// full-viewport inset shadow that darkens the screen edges. All visual
// values live in `.deck-vignette` (src/styles/atmosphere.css); this
// component only mounts the element. The vignette is static (no motion),
// so it is unaffected by prefers-reduced-motion.
export function Vignette() {
  return <div aria-hidden="true" className="deck-vignette" />;
}
