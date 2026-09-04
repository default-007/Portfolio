// Ported from design source (portfolio-v5-flight-deck.dc.html): a fixed,
// full-viewport film-grain overlay. All visual values (opacity, the SVG
// turbulence noise, z-index) live in `.deck-grain` (src/styles/atmosphere.css);
// this component only mounts the element. Reduced-motion suppression is
// handled by that same CSS's `prefers-reduced-motion` block, not here.
export function Grain() {
  return <div aria-hidden="true" className="deck-grain" />;
}
