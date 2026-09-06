import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { hasWebGL, prefersReducedMotion } from '../../lib/env';

// Ported verbatim from the design source
// (portfolio-v5-flight-deck.dc.html line 74) — the chapter 00 aura. This is
// the contract: it paints first and it is what remains whenever the WebGL
// upgrade is unavailable, declined or fails to load.
const AURA_BACKGROUND =
  'radial-gradient(45% 45% at 38% 44%, rgba(192,96,58,0.36) 0%, rgba(192,96,58,0) 70%), ' +
  'radial-gradient(38% 38% at 66% 62%, rgba(232,163,61,0.22) 0%, rgba(232,163,61,0) 72%)';

// The positioning and the `data-anim="aura"` marker live on this wrapper, not
// on what it contains. useReveal's aura scrub runs once, at App mount, over
// whatever carries the marker then — which is always the CSS fallback, since
// `use3D` starts false and EmberField is lazy. If the marker travelled with
// the swapped child, the upgrade would unmount the scrubbed node and mount an
// unscrubbed one: on exactly the wide WebGL desktops the ember field is built
// for, the atmosphere would stop responding to scroll, and a tween would be
// left animating a detached element. A wrapper that outlives the swap keeps
// one scrubbed node for the page's lifetime and lets the contents change
// underneath it.
function AuraFrame({ children }: { children: ReactNode }) {
  return (
    <div
      data-anim="aura"
      aria-hidden="true"
      className="pointer-events-none absolute -top-[24%] -left-[8%] h-[150%] w-[72%]"
    >
      {children}
    </div>
  );
}

// Fills the frame above rather than positioning itself. `deck-aura` carries
// the CSS drift keyframes (design line 74); the scroll scrub is the wrapper's.
function CssAura() {
  return (
    <div
      data-testid="css-aura"
      className="deck-aura absolute inset-0"
      style={{ background: AURA_BACKGROUND }}
    />
  );
}

// If the `three` chunk fails to arrive (offline, cache miss, blocked CDN), a
// bare React.lazy would throw into the nearest error boundary and the hero
// would lose its atmosphere entirely. Resolving the failure to the CSS aura
// keeps the fallback as the floor: the worst case is the design without the
// upgrade, never a hole in the page.
// Exported so the failure path can be asserted directly. Going through
// <Suspense> instead proves nothing: its fallback is the aura too, so the
// aura shows while the import is merely pending, whether or not the
// rejection is ever handled.
export const loadEmberField = () =>
  import('./EmberField')
    .then((m) => ({ default: m.EmberField }))
    .catch(() => ({ default: CssAura }));

const EmberField = lazy(loadEmberField);

export function HeroAtmosphere() {
  // Capability checks run after mount so the first paint is always the CSS
  // fallback — the 3D layer is an upgrade, never a prerequisite.
  const [use3D, setUse3D] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1024px)').matches;
    setUse3D(wide && hasWebGL() && !prefersReducedMotion());
  }, []);

  return (
    <AuraFrame>
      {use3D ? (
        <Suspense fallback={<CssAura />}>
          <EmberField />
        </Suspense>
      ) : (
        <CssAura />
      )}
    </AuraFrame>
  );
}
