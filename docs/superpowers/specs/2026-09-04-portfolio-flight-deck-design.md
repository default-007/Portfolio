# Portfolio v5 "Flight Deck" — Design Spec

Date: 2026-09-04
Status: approved for planning
Source design: Claude Design project `df2fbf8d-3371-4dc4-bb6f-a8c40c433eaa`,
file `Portfolio v5 Flight Deck.dc.html`

## 1. Purpose

Ship Brian Otieno's portfolio as a static site, built from the approved
"Portfolio v5 Flight Deck" canvas design, hosted on HostPinnacle free
shared hosting.

The site is a hiring artifact. It targets senior full-stack and platform
roles, and it argues its case through a single conceit: aviation
discipline applied to software. That conceit is load-bearing, not
decoration — the copy, the HUD, the checklist chapter and the command
console all serve it. Implementation must preserve it.

## 2. Constraints

| Constraint | Consequence |
| --- | --- |
| HostPinnacle free tier is cPanel shared hosting: static files, PHP, MySQL — no Python/WSGI | The existing Django project cannot run there and is removed. No server-side code of any kind. |
| Deployment is a file upload, not a pipeline | Build output must be self-contained and path-relative. |
| Site is a hiring artifact | The repo itself is read by hiring managers. Code quality is part of the deliverable. |
| Audience includes low-bandwidth and low-end Android devices (stated in the design's own copy) | First paint must not depend on the 3D bundle. Content must render without *motion*: every reveal is a `fromTo` with `immediateRender: false` and every effect is gated on `prefers-reduced-motion`, so a device that never runs the animations still shows the whole page. With JavaScript disabled entirely, `index.html`'s `<noscript>` routes the visitor to `./resume.html` — a complete, standalone, dependency-free résumé, not an apology. |

**On rendering without JavaScript.** An earlier draft of this row read
"content must render without JS", which §3 contradicts: the stack chosen
there is a client-rendered React SPA served as static files. Prerendering
the single page at build time (`react-dom/server` into `#root`, or
`vite-plugin-prerender`) was considered and **deferred**. It is mechanically
cheap — one page, no router, no data fetching — but it makes hydration
mismatch a live concern for `useSplitText`'s raw DOM mutations and
`StatusStrip`'s clock, and that risk is not worth taking at this point in
the branch. What ships instead is the guarantee stated in the row above, and
that guarantee is what addresses the audience concern this constraint is
about: bandwidth and CPU. The entry chunk is ~21 kB gzipped, the 3D layer is
lazy and desktop-only, and `resume.html` is the no-JS deliverable. Revisit
prerendering if the site ever grows a second route.

## 3. Stack

- **Vite + React 19 + TypeScript** — static build output.
- **Tailwind CSS v4** — CSS-first `@theme` configuration.
- **GSAP + ScrollTrigger** — already the design's motion system; carried over.
- **Lenis** — smooth scrolling, bridged to ScrollTrigger.
- **three.js + @react-three/fiber** — exactly one effect (§7).
- **Vitest + Testing Library** — unit tests for logic (§8).

No router. The site is one scrolling page with anchor chapters, which is
what the design's `jump()` already does. This keeps `.htaccess` to
caching rules only, with no SPA rewrite fallback to misconfigure.

### Rejected alternatives

**Vanilla JS/HTML.** Considered first and rejected. The design's logic is
already authored as a React-shaped component — `state`, `setState` with
updater functions, `componentDidMount`/`DidUpdate`/`WillUnmount`, a ref
on the console input, `<sc-if>` for conditional rendering and `<sc-for>`
for list rendering. The console holds real state (a rolling line buffer,
a sound toggle, the active chapter). Porting to React is closer to a
translation than a rewrite; porting to vanilla means hand-rolling DOM
updates React already does.

**Keeping Django.** Nothing on the site needs a server. The only
interactive surfaces — the console, the HUD, the animations — are
client-side, and the contact CTA is a `mailto:` in the design as
approved. Keeping Django would rule out the chosen host for no gain.

## 4. Source design — what is being built

Seven full-viewport chapters, dark aviation flight deck.

| Chapter | Content |
| --- | --- |
| `ch0` Arrival | Headline, positioning paragraph, two CTAs, portrait panel with scanline/radar treatment |
| `ch1` Flight profile | Career timeline as a 2018–2026 Gantt of five "legs", plus four stat tiles |
| `ch2` CBC School Management | Case study + bespoke mockup of a competency assessment sheet |
| `ch3` WaterWatch | Case study + bespoke mockup of a triage queue, point map, MTTR/SLA metrics |
| `ch4` Smart Ticketing | Case study + bespoke mockup |
| `ch5` Checklist & incident | Six-item pre-production checklist, plus an occurrence report form |
| `ch6` Clearance | Contact block, education and certifications |

Persistent chrome across all chapters: top status strip (availability
indicator, live clock, `NBO · UTC+3`, current chapter readout), left
altitude ladder tracking scroll progress with a percentage readout,
corner brackets, and a pinned command console.

### Design tokens

| Token | Value | Role |
| --- | --- | --- |
| `--color-deck` | `#0A0807` | Page background |
| `--color-deck-raised` | `#0D0A09` | Alternating chapter background |
| `--color-ember` | `#E8A33D` | Primary accent, links, HUD active |
| `--color-rust` | `#C0603A` | Secondary accent, primary CTA |
| `--color-bone` | `#FBF7F1` | Display type |
| `--color-body` | `#EFE6DA` | Body type |
| `--color-muted` | `#B8AAA0` | Prose |
| `--color-dim` | `#8A7A6D` / `#7E6F63` / `#6E6058` / `#5F534B` | Instrumentation labels, four steps |
| `--color-go` | `#8FB877` | Success / routing confirmations |

Type: **Newsreader** (200/300/400 + italic) for display, **IBM Plex Sans**
for body, **IBM Plex Mono** for all instrumentation.

## 5. Structure

```
src/
  main.tsx
  App.tsx
  data/
    chapters.ts      chapter registry: id, hud label, screen label
    experience.ts    five career legs + four stat tiles
    projects.ts      case study copy for ch2/ch3/ch4
    checklist.ts     six checklist items
    contact.ts       contact rows, education, certifications
    commands.ts      console command table
  components/
    hud/             StatusStrip · AltitudeLadder · CornerBrackets
    console/         Console · ConsoleLog · useConsole
    chapters/        Arrival · FlightProfile · CaseStudy · Checklist · Clearance
      mockups/       CompetencySheet · TriageQueue · TicketQueuePhone
    atmosphere/      Grain · Vignette · Spotlight · EmberField
  motion/
    useSmoothScroll.ts   Lenis + ScrollTrigger bridge
    useSplitText.ts      per-character headline reveal
    useReveal.ts         generic scroll-in
    useCounter.ts        stat tile count-up
    useMagnetic.ts       cursor-attracted CTAs
    useChapterTracking.ts  HUD chapter + ladder + percentage
  styles/
    index.css        Tailwind import, @theme tokens, base
    atmosphere.css   grain, vignette, scanlines, radar sweep, keyframes
```

### Content extraction

Repeated markup becomes data. The five career legs currently differ only
in company, role, metric line, grid span, gradient and sector — they
become an `experience.ts` array rendered by one component. Same for the
four stat tiles, the six checklist items, the contact rows and the
console command table.

### Case studies: shared shell, bespoke mockups

Chapters 02/03/04 share a **text side** — leg label, title, positioning
paragraph, three `✓` bullets and one `→` outcome line. That is driven
from `projects.ts` by one `CaseStudy` component, which also takes the
side the text sits on as a prop. The order is not a strict alternation:
ch2 is text-left, ch3 is mock-left, ch4 is text-left again.

Their **mockup side** is bespoke per project and stays hand-written:
ch2 is a competency assessment sheet with a learner table and EE/ME/AE
level chips; ch3 is a triage queue with status pills, a point map and a
metrics strip; ch4 is a phone frame showing an agent's SLA queue. These share a visual
vocabulary but not a data shape, and forcing them through common props
would produce a worse component than three honest ones.

## 6. Styling approach

Tailwind v4 for layout, spacing, grid, flex, sizing and type. Palette and
font families as `@theme` tokens so they are editable in one place.

Hand-written CSS for effects utilities express badly, with values carried
across exactly:

- Film grain (inline SVG `feTurbulence`, `opacity: .045`)
- Vignette (`box-shadow: inset 0 0 240px 70px rgba(0,0,0,0.62)`)
- Cursor spotlight (720px radial gradient, GSAP `quickTo`-driven)
- Portrait scanlines (`repeating-linear-gradient`) and sweep band
- Radar sweep (`conic-gradient` + rotation)
- Drifting hero auras (layered `radial-gradient`)
- Keyframes: `v5-blink`, `v5-sweep`, `v5-drift`, `v5-scan`

The design's `style-hover="..."` attributes are a canvas convention, not
real HTML. They become Tailwind `hover:` variants.

## 7. Motion

### Scroll

Lenis owns scrolling. Bridged to ScrollTrigger the standard way:
`lenis.on('scroll', ScrollTrigger.update)`, with Lenis's RAF driven off
`gsap.ticker` so there is one animation loop rather than two competing
ones. The console's `jump()` becomes `lenis.scrollTo`.

This deletes the design's `findScroller()`, which walks the DOM at
runtime hunting for whatever element happens to be scrollable — an
artifact of running inside the canvas host, where the component does not
own the scroll container. In this app it does.

### GSAP lifecycle

All GSAP runs through `useGSAP` for scoped, automatic cleanup.

**Two workarounds from the source are deliberately dropped:**

1. The 1.2s `watch()` interval that rebuilds ScrollTriggers whenever it
   finds zero registered.
2. The 2.2s `_safety` timer that force-restores any element left below
   0.9 opacity.

Both exist because the canvas host remounts components unpredictably and
a torn-down trigger could strand content invisible. A React app with real
effect cleanup does not have that failure mode, and carrying the hacks
over would be cargo-culting. The `window.__v5Owner` global-ownership
handshake goes for the same reason.

**The principle underneath them is kept:** content is visible by default,
and every reveal is a `fromTo` with `immediateRender: false`. If JS fails
or is slow, the page reads as plain HTML rather than a screen of
invisible text. This is a correctness property, not an optimisation.

### Effects inventory

| Hook | Effect |
| --- | --- |
| `data-split` (7×) | Per-character headline reveal, `yPercent: 108 → 0`, `expo.out`, 0.014s stagger |
| `data-anim="fade"` (18×) | `y: 20 → 0` + fade, `power3.out` |
| `data-anim="leg"` (6×) | Timeline row entrance |
| `data-bar` (5×) | Career bars scaling from `transform-origin: 0 50%` |
| `data-anim="stat"` (6×) + `data-count` (4×) | Count-up (`8`, `99.5`, `244`, `90`) |
| `data-anim="check"` (19×) | Checklist item reveals |
| `data-row` (12×), `data-bar-v` (12×) | Mockup internals |
| `data-anim="hero-photo"` | Scale-in, then `yPercent: -8` parallax on scroll |
| `data-anim="aura"` (3×) | Scrubbed parallax drift |
| `data-magnetic` (2×) | Cursor-attracted CTAs, `elastic.out` release |

### Reduced motion

`prefers-reduced-motion: reduce` disables grain, spotlight, drift,
`EmberField`, and all entrance animations. Content renders in its final
state. The chapter HUD, clock and ladder still update — they are
information, not motion.

## 8. three.js scope

**One effect: `EmberField`**, behind the Arrival headline. A single
fullscreen plane with a fragment shader producing volumetric ember haze
that drifts with cursor and scroll position. No models, no loaders, no
controls, no post-processing.

Loaded via `React.lazy` + `Suspense` so three.js and R3F land in a
separate chunk that never blocks first paint. It mounts only when all of
the following hold:

- WebGL context is obtainable
- `prefers-reduced-motion` does not match
- Viewport is wide enough to be a desktop

Otherwise the design's existing CSS `radial-gradient` aura renders
instead — so the fallback is the design as approved, not a degraded
version of it.

Rationale for the narrow scope: the source design contains no 3D. Its
atmosphere is CSS, and it works. `EmberField` replaces one effect CSS can
only fake; adding 3D anywhere else would fight a design that is already
resolved.

## 9. Testing

Vitest + Testing Library, written test-first, scoped to where logic
actually lives:

- **Command parser** — a pure `parseCommand(input)` returning a typed
  result. Covers `help`/`?`, `ls`, `whoami`, `profile`, `open 00`–`open
  06`, the aliases (`cbc`, `water`, `waterwatch`, `ticketing`, `tickets`,
  `checklist`, `incident`, `hire`, `contact`, `top`), `stats`, `resume`,
  `sound`, `clear`, empty input, and unknown-command handling.
- **Console reducer** — the rolling buffer caps at 6 lines; `clear`
  empties it; `sound` toggles; echoed input and system replies carry the
  right mark and colour.
- **Reduced-motion gating** — no animation is registered when the media
  query matches.

Not unit-tested: scroll animation positions and visual output. That is
Playwright territory and is better verified by looking at it.

## 10. Deployment

- `base: './'` in the Vite config, so hashed assets resolve under
  whatever path cPanel serves from. This is the single most common way a
  working build 404s on shared hosting.
- Build output in `dist/` uploads to `public_html`.
- `.htaccess`: gzip/deflate, long cache lifetimes on hashed assets, no
  caching on `index.html`.
- `DEPLOY.md` with the cPanel File Manager / FTP steps.
- Portrait converted to AVIF + WebP with a PNG fallback.

## 11. Removals

Removed in their own clearly-labelled commit, separate from new code, so
the deletion is trivially revertible:

- `portfolio/`, `web/`, `manage.py` — Django scaffolding that cannot run
  on the target host. Currently a bare `startproject`: empty views, no
  URLs, no templates, and `web` is not in `INSTALLED_APPS`.
- `venv/` — committed virtualenv.
- `Template/` and `Template.zip` — 6.4MB purchased Bootstrap theme. The
  design project's own `github.md` records that it was reviewed and
  deliberately not reused.

## 12. Open items

### 12.1 Résumé — resolved

The console's `resume` command opens the résumé. The source was retrieved
on a second attempt and is vendored at `design/brian-otieno-resume.dc.html`
(16.9 KB). It carries the full document: contact block, summary, six
experience entries, a technical-skills grid, three selected projects, four
education entries, and two certifications.

It is a `<doc-page>` canvas document with `margin="0.6in"` and a print
palette (`#1f3a5f` navy, `#141414`, `#2b2b2b`, `#4a4a4a`, `#6b6b6b`,
`#d8dde3`) entirely distinct from the flight deck's. The deliverable is a
standalone `public/resume.html` ported from it verbatim — no PDF, since
none exists and the page prints to one from any browser.

### 12.2 Portrait asset — resolved

`images/brian-speaking.png` was retrieved and decoded to `assets/brian-speaking.png`
(506 × 627, RGBA, 192 KB). It is small — roughly 1.5× the design's 340 px
display width — so it is adequate but not generous. A higher-resolution
original would improve the Arrival chapter on dense displays; nothing is
blocked without one.

### 12.3 Occurrence report is an unfilled placeholder

Chapter 05's "Occurrence report / FORM 05—A" is not finished content. Its
four fields read as prompts addressed to Brian:

> 1. WHAT HAPPENED — *Awaiting your account — the one production failure
>    worth telling.*
> 2. HOW IT WAS DETECTED — *Alert, or a user telling you first? Both are
>    honest answers.*
> 3. IMMEDIATE ACTION — *What you did in the first hour.*
> 4. WHAT CHANGED AFTER — *The line that turned into a checklist item
>    above.*

and the panel closes: *"Send me the four answers and I'll set this in
type — no failure invented on your behalf."*

This is the strongest section on the page conceptually — a real incident,
honestly told, is exactly the evidence the aviation conceit promises —
and it is currently empty. Four answers are needed. Nothing will be
invented.

Until they arrive, build the component with the placeholder copy intact
so the layout is real and the text is a one-line swap.

### 12.4 Two content discrepancies to confirm

Both are between the résumé and the flight deck, and both need Brian to
say which is correct:

1. **Employer name.** Résumé: "Lloyd Cooper Consulting Group". Flight
   deck: "Lloyd Constellations".
2. **Cisco certification.** Résumé: "Cisco Certified Network Associate
   (CCNA) · in progress". Flight deck: "Cisco Junior Cyber Security
   Analyst · in progress".

These are factual claims on a hiring document. Neither will be guessed.
