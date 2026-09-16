# Portfolio — "Flight Deck"

Brian Otieno's portfolio: a static, single-page React site built from the
approved "Portfolio v5 Flight Deck" design, deployed to cPanel shared hosting
by uploading a folder.

The site is a hiring artifact, and it argues its case through one conceit —
aviation discipline applied to software. The HUD chrome, the seven numbered
chapters, the pre-flight checklist and the command console all serve that
conceit rather than decorate it. The repo is part of the deliverable too: it
is read by the same people the site is addressed to.

## Stack

Vite 6 · React 19 · TypeScript 5 · Tailwind CSS v4 (`@theme` tokens, no config
file) · GSAP 3 + ScrollTrigger + `@gsap/react` · Lenis · three.js +
`@react-three/fiber` (one lazy effect) · Vitest + Testing Library + jsdom.

No router: one scrolling page with anchor chapters `ch0`–`ch6`. No server-side
code, no API calls, no runtime environment variables.

## Getting started

```bash
npm install
npm run dev        # Vite dev server
npx vitest run     # 186 tests across 25 files
npm run build      # tsc --noEmit → vite build → build-output guards
npm run preview    # serve the production build locally
```

`npm run build` is the gate. It type-checks, builds, and then runs
`scripts/check-bundle.mjs`, which must print all three check lines — bundle,
resume, htaccess. If it does not, the build is not deployable.

## Layout

| Path | Responsibility |
| --- | --- |
| `index.html` | Shell, font preconnects, `<noscript>` route to the résumé |
| `src/main.tsx` | React root |
| `src/App.tsx` | Chapter composition + global chrome |
| `src/styles/` | `index.css` (Tailwind import, `@theme` tokens), `atmosphere.css` |
| `src/data/` | All copy, as typed modules — chapters, experience, projects, checklist, contact |
| `src/console/` | Command parser, state reducer, console UI |
| `src/components/hud/` | Status strip, altitude ladder, corner brackets |
| `src/components/atmosphere/` | Grain, vignette, cursor spotlight, WebGL ember field |
| `src/components/chapters/` | One component per chapter, plus three bespoke project mockups |
| `src/motion/` | Lenis↔ScrollTrigger bridge, reveal / split-text / counter / magnetic hooks |
| `src/lib/env.ts` | Reduced-motion and WebGL capability checks |
| `public/resume.html` | Standalone, dependency-free résumé page |
| `public/.htaccess` | Compression and cache headers |
| `scripts/` | Build-output guards (`check-bundle.mjs`, `htaccessGuard.mjs`) |
| `design/` | Vendored design sources — the authority for markup, copy and style values |
| `docs/` | Design spec and implementation plan |

## Load-bearing constraints

These are not preferences; changing one breaks something specific.

- **`base: './'` in `vite.config.ts`.** Absolute asset paths 404 on cPanel
  shared hosting. Every reference in `dist/index.html` must stay relative so
  the bundle works from a domain root or a subdirectory alike.
- **three.js is lazy and desktop-only.** It is ~240 kB gzipped and must be
  reachable *only* through `EmberField`'s dynamic import. `manualChunks` in
  `vite.config.ts` is in function form for this reason; the object form once
  swept React's JSX runtime into the three chunk, which put three into the
  entry's static graph for every visitor. `scripts/check-bundle.mjs` asserts
  the edge is absent, because no unit test can see it.
- **Content is visible by default.** Every scroll reveal is a GSAP `fromTo`
  with `immediateRender: false`. Nothing animates *from* a hidden state, so a
  device that never runs the animations still shows the whole page.
- **`prefers-reduced-motion: reduce` disables motion, not information.** Grain,
  spotlight, aura drift, `EmberField` and all entrance animations go; the
  clock, chapter readout and altitude ladder keep updating.
- **Copy is never invented.** All text comes from `design/` verbatim, via the
  typed modules in `src/data/`. Link targets are the documented exception —
  they are build artifacts, not copy (see the note in `src/data/contact.ts`).
- **Chapter IDs `ch0`–`ch6` are referenced by the console, the HUD and anchor
  links.** Do not rename them.
- **Every `Header` directive in `public/.htaccess` stays inside
  `<IfModule mod_headers.c>`.** An unguarded one does not degrade on a host
  without `mod_headers` — Apache serves 500 for every request under the
  directory. `scripts/htaccessGuard.mjs` enforces this at build time.

## Console commands

The console is a command line fixed to the bottom of the viewport; `help` or
`?` lists the commands.

| Command | Effect |
| --- | --- |
| `help`, `?` | List commands |
| `ls` | List the seven chapters |
| `whoami`, `stats` | Print the summary lines |
| `top`, `profile`, `cbc`, `waterwatch`, `ticketing`, `checklist`, `incident`, `hire`, `contact` | Route to a chapter |
| `open 00`–`open 06` | Route by number |
| `resume` | Open `./resume.html` |
| `sound` | Toggle sound |
| `clear` | Clear the log |

Routing goes through Lenis' `scrollTo`, so console navigation and scrolling
share one motion system.

## Testing

`npx vitest run` — jsdom environment, globals on, `src/test-setup.ts` as setup.
Unit tests cover the console parser and reducer, the motion hooks, the data
modules and every component. Two defect classes live in build output rather
than behaviour and are guarded by `scripts/check-bundle.mjs` instead: the
three.js static-import edge, and the shape of `resume.html` (present, free of
unresolved template syntax, print-safe, all six employers intact).

There is no `npm test` script; run Vitest directly.

## Deployment

Static upload to HostPinnacle (cPanel, Apache). Full steps, including the zip
workaround for File Manager's file-only uploader and the dotfile trap that
strands a stale `.htaccess`, are in [DEPLOY.md](DEPLOY.md).

## Docs

- [Design spec](docs/superpowers/specs/2026-09-04-portfolio-flight-deck-design.md)
  — constraints, stack rationale, rejected alternatives, open items.
- [Implementation plan](docs/superpowers/plans/2026-09-04-portfolio-flight-deck.md)
  — the 19 tasks that built this, complete, with the divergences recorded.

## Open item

Chapter 05's occurrence report ships with placeholder copy: its four fields are
prompts addressed to Brian, not finished content (spec §12.3). The layout is
real and the text is a one-line swap in `src/data/checklist.ts` — flip
`REPORT_IS_PLACEHOLDER` and fill `REPORT_FIELDS` when the answers arrive. No
failure will be invented to fill it.
