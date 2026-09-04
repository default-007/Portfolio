# Portfolio Flight Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Brian Otieno's "Flight Deck" portfolio as a static React site deployable to HostPinnacle free shared hosting by uploading a folder.

**Architecture:** Vite builds a single-page React app — no router, seven anchor-linked full-viewport chapters. Content lives in typed data modules; presentation is Tailwind v4 utilities plus hand-written CSS for atmospheric effects. Lenis owns scrolling and drives GSAP ScrollTrigger through one shared RAF loop. One lazy-loaded three.js shader provides the hero's ember haze, falling back to the design's CSS gradient.

**Tech Stack:** Vite 6, React 19, TypeScript 5, Tailwind CSS v4, GSAP 3.12 + ScrollTrigger + @gsap/react, Lenis, three.js + @react-three/fiber, Vitest + Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-09-04-portfolio-flight-deck-design.md`

**Design source:** `design/portfolio-v5-flight-deck.dc.html` — vendored into the repo. This is the authority for markup, copy and exact style values. Line references throughout this plan point into it.

## Global Constraints

- **Palette, exact values:** `--color-deck: #0A0807`, `--color-deck-raised: #0D0A09`, `--color-ember: #E8A33D`, `--color-ember-bright: #F5BD62`, `--color-rust: #C0603A`, `--color-rust-bright: #D4703F`, `--color-bone: #FBF7F1`, `--color-body: #EFE6DA`, `--color-muted: #B8AAA0`, `--color-dim-1: #8A7A6D`, `--color-dim-2: #7E6F63`, `--color-dim-3: #6E6058`, `--color-dim-4: #5F534B`, `--color-go: #8FB877`.
- **Fonts:** Newsreader (200/300/400 + italic 300) display; IBM Plex Sans (400/500/600) body; IBM Plex Mono (400/500/600) instrumentation. Loaded from Google Fonts with `preconnect`, exactly as the design's `<helmet>` does.
- **Content is visible by default.** Every scroll reveal is a GSAP `fromTo` with `immediateRender: false`. Never animate `from` a hidden state that could strand content invisible if JS fails.
- **`prefers-reduced-motion: reduce`** disables grain, spotlight, aura drift, EmberField and all entrance animations. Content renders in final state. Clock, chapter readout and altitude ladder still update — they are information, not motion.
- **`base: './'`** in the Vite config. Non-negotiable: absolute asset paths 404 on cPanel shared hosting.
- **No server-side code.** No API calls, no forms that POST, no environment variables at runtime.
- **Copy is never invented.** All text comes from the design source verbatim. Where the design contains placeholder copy (chapter 05's occurrence report), the placeholder ships until Brian supplies real content.
- **Chapter IDs are `ch0`–`ch6`** and are referenced by the console, the HUD and anchor links. Do not rename.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `vite.config.ts` | Build config, `base: './'`, Vitest config |
| `index.html` | Shell, font preconnects, `<noscript>` fallback note |
| `src/main.tsx` | React root |
| `src/App.tsx` | Chapter composition + global chrome |
| `src/styles/index.css` | Tailwind import, `@theme` tokens, base layer |
| `src/styles/atmosphere.css` | Grain, vignette, scanlines, radar sweep, keyframes |
| `src/data/chapters.ts` | Chapter registry — ids, HUD labels |
| `src/data/experience.ts` | Five career legs, four stat tiles |
| `src/data/projects.ts` | Case study copy for ch2/ch3/ch4 |
| `src/data/checklist.ts` | Six checklist items, occurrence report fields |
| `src/data/contact.ts` | Contact rows, education, certifications |
| `src/console/commands.ts` | Pure command parser |
| `src/console/useConsole.ts` | Console state reducer |
| `src/console/Console.tsx` | Console UI |
| `src/components/hud/*.tsx` | Status strip, altitude ladder, corner brackets |
| `src/components/atmosphere/*.tsx` | Grain, Vignette, Spotlight, EmberField |
| `src/components/chapters/*.tsx` | One component per chapter |
| `src/components/chapters/mockups/*.tsx` | Three bespoke project mockups |
| `src/motion/*.ts` | Lenis bridge and GSAP hooks |
| `src/lib/env.ts` | Reduced-motion and WebGL capability checks |
| `public/.htaccess` | Compression and cache headers |
| `DEPLOY.md` | cPanel upload steps |

---

## Task 1: Scaffold, remove Django, establish tokens

**Files:**
- Delete: `portfolio/`, `web/`, `manage.py`, `venv/`, `Template/`, `Template.zip`
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `.gitignore`
- Create: `src/main.tsx`, `src/App.tsx`, `src/styles/index.css`, `src/styles/atmosphere.css`
- Create: `src/lib/env.ts`, `src/lib/env.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `prefersReducedMotion(): boolean`, `hasWebGL(): boolean` from `src/lib/env.ts`

- [ ] **Step 1: Remove Django and the unused template, as its own commit**

```bash
git rm -r --cached venv Template Template.zip portfolio web manage.py
rm -rf venv Template Template.zip portfolio web manage.py
git commit -m "Remove Django scaffolding and unused Bootstrap template

Django cannot run on HostPinnacle's free shared tier (no Python/WSGI),
and the site needs no server. The Template/ theme was reviewed during
design and deliberately not reused."
```

- [ ] **Step 2: Scaffold and install**

The directory already holds `.git/`, `docs/`, `design/` and `assets/`, so the
scaffolder will warn it is not empty — choose **"Ignore files and continue"**.

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install gsap @gsap/react lenis three @react-three/fiber
npm install -D tailwindcss @tailwindcss/vite vitest jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  @types/three
```

- [ ] **Step 3: Write `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ['gsap', '@gsap/react'],
          three: ['three', '@react-three/fiber'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

- [ ] **Step 4: Write `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';

// jsdom implements no media queries; default every test to "motion allowed"
// so reduced-motion behaviour is opt-in and explicit per test.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
```

- [ ] **Step 5: Write the failing test for capability detection**

Create `src/lib/env.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { prefersReducedMotion, hasWebGL } from './env';

const mockMatch = (matches: boolean) => {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches, media: query }) as MediaQueryList);
};

afterEach(() => vi.unstubAllGlobals());

describe('prefersReducedMotion', () => {
  it('is true when the reduce query matches', () => {
    mockMatch(true);
    expect(prefersReducedMotion()).toBe(true);
  });

  it('is false when the reduce query does not match', () => {
    mockMatch(false);
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe('hasWebGL', () => {
  it('is false when getContext returns null', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(hasWebGL()).toBe(false);
  });

  it('is true when a webgl context is returned', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as RenderingContext);
    expect(hasWebGL()).toBe(true);
  });
});
```

- [ ] **Step 6: Run the test, verify it fails**

Run: `npx vitest run src/lib/env.test.ts`
Expected: FAIL — cannot resolve `./env`.

- [ ] **Step 7: Implement `src/lib/env.ts`**

```ts
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
```

- [ ] **Step 8: Run the test, verify it passes**

Run: `npx vitest run src/lib/env.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 9: Write `src/styles/index.css` with the token set**

Values copied from the design source lines 10–29 and the Global Constraints above.

```css
@import 'tailwindcss';
@import './atmosphere.css';

@theme {
  --color-deck: #0a0807;
  --color-deck-raised: #0d0a09;
  --color-ember: #e8a33d;
  --color-ember-bright: #f5bd62;
  --color-rust: #c0603a;
  --color-rust-bright: #d4703f;
  --color-bone: #fbf7f1;
  --color-body: #efe6da;
  --color-muted: #b8aaa0;
  --color-dim-1: #8a7a6d;
  --color-dim-2: #7e6f63;
  --color-dim-3: #6e6058;
  --color-dim-4: #5f534b;
  --color-go: #8fb877;

  --font-display: 'Newsreader', Georgia, serif;
  --font-sans: 'IBM Plex Sans', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
}

@layer base {
  body {
    margin: 0;
    background: var(--color-deck);
    color: var(--color-body);
    font-family: var(--font-sans);
    overflow-x: hidden;
  }
  a {
    color: var(--color-ember);
    text-decoration: none;
  }
  a:hover {
    color: var(--color-ember-bright);
  }
  ::selection {
    background: var(--color-rust);
    color: var(--color-bone);
  }
}
```

- [ ] **Step 10: Write `src/styles/atmosphere.css`**

Port the keyframes and effect rules verbatim from design source lines 17–27. Keep the class names but drop the `v5-` id-based selectors in favour of classes:

```css
@keyframes deck-blink {
  0%, 45% { opacity: 1; }
  50%, 95% { opacity: 0.2; }
  100% { opacity: 1; }
}
@keyframes deck-sweep {
  to { transform: rotate(360deg); }
}
@keyframes deck-drift {
  0%   { transform: translate3d(-4%, -2%, 0) scale(1); }
  50%  { transform: translate3d(5%, 4%, 0) scale(1.16); }
  100% { transform: translate3d(-4%, -2%, 0) scale(1); }
}
@keyframes deck-scan {
  0%   { transform: translateY(-120%); }
  100% { transform: translateY(600%); }
}

.deck-grain {
  position: fixed;
  inset: 0;
  z-index: 80;
  pointer-events: none;
  opacity: 0.045;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
}

.deck-vignette {
  position: fixed;
  inset: 0;
  z-index: 79;
  pointer-events: none;
  box-shadow: inset 0 0 240px 70px rgba(0, 0, 0, 0.62);
}

.deck-spotlight {
  position: fixed;
  top: 0;
  left: 0;
  width: 720px;
  height: 720px;
  margin: -360px 0 0 -360px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 6;
  opacity: 0;
  transition: opacity 0.8s ease;
  background: radial-gradient(
    circle,
    rgba(232, 163, 61, 0.12) 0%,
    rgba(232, 163, 61, 0.05) 36%,
    rgba(232, 163, 61, 0) 70%
  );
}

.deck-scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    180deg,
    rgba(10, 8, 7, 0.24) 0px,
    rgba(10, 8, 7, 0.24) 1px,
    rgba(10, 8, 7, 0) 1px,
    rgba(10, 8, 7, 0) 3px
  );
  opacity: 0.55;
}

.deck-aura {
  animation: deck-drift 20s ease-in-out infinite;
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .deck-grain,
  .deck-spotlight { display: none; }
  .deck-aura { animation: none; }
}
```

- [ ] **Step 11: Write `index.html` with font loading and a no-JS note**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Brian Otieno — Software Engineer</title>
    <meta name="description" content="Full-stack software engineer in Nairobi. ERP, fintech, GIS and school systems built to be restorable, reversible and auditable." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200;0,6..72,300;0,6..72,400;1,6..72,300&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 12: Minimal `src/App.tsx` and `src/main.tsx` so the dev server boots**

```tsx
// src/App.tsx
export default function App() {
  return <main className="min-h-screen bg-deck text-body" />;
}
```

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 13: Verify the dev server and the production build**

Run: `npm run dev` — page loads, background is `#0A0807`.
Run: `npm run build` — succeeds, and `dist/index.html` references assets with `./` prefixes.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "Scaffold Vite + React + Tailwind v4 with design tokens"
```

---

## Task 2: Console command parser

The only substantial pure logic in the app. Behaviour is defined by the design source lines 335–356 (`run(raw)`).

**Files:**
- Create: `src/console/commands.ts`
- Test: `src/console/commands.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  ```ts
  export type CommandResult =
    | { kind: 'say'; text: string; color: string }
    | { kind: 'route'; chapterId: string; label: string }
    | { kind: 'clear' }
    | { kind: 'toggleSound' }
    | { kind: 'openResume' }
    | { kind: 'noop' };
  export function parseCommand(raw: string): CommandResult;
  ```

- [ ] **Step 1: Write the failing test**

Create `src/console/commands.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseCommand } from './commands';

describe('parseCommand', () => {
  it('ignores empty and whitespace-only input', () => {
    expect(parseCommand('')).toEqual({ kind: 'noop' });
    expect(parseCommand('   ')).toEqual({ kind: 'noop' });
  });

  it('is case- and whitespace-insensitive', () => {
    expect(parseCommand('  HELP  ')).toEqual(parseCommand('help'));
  });

  it('lists commands for help and ?', () => {
    const result = parseCommand('help');
    expect(result.kind).toBe('say');
    expect(parseCommand('?')).toEqual(result);
  });

  it('routes profile and open 01 to ch1', () => {
    expect(parseCommand('profile')).toEqual({
      kind: 'route', chapterId: 'ch1', label: 'flight profile',
    });
    expect(parseCommand('open 01')).toEqual(parseCommand('profile'));
  });

  it.each([
    ['open 02', 'ch2', 'cbc school management'],
    ['cbc', 'ch2', 'cbc school management'],
    ['open cbc', 'ch2', 'cbc school management'],
    ['open 03', 'ch3', 'waterwatch'],
    ['water', 'ch3', 'waterwatch'],
    ['waterwatch', 'ch3', 'waterwatch'],
    ['open 04', 'ch4', 'smart ticketing'],
    ['ticketing', 'ch4', 'smart ticketing'],
    ['tickets', 'ch4', 'smart ticketing'],
    ['checklist', 'ch5', 'checklist & incident'],
    ['open 05', 'ch5', 'checklist & incident'],
    ['incident', 'ch5', 'checklist & incident'],
    ['hire', 'ch6', 'clearance'],
    ['contact', 'ch6', 'clearance'],
    ['open 06', 'ch6', 'clearance'],
    ['top', 'ch0', 'arrival'],
    ['open 00', 'ch0', 'arrival'],
  ])('routes %s to %s', (input, chapterId, label) => {
    expect(parseCommand(input)).toEqual({ kind: 'route', chapterId, label });
  });

  it('answers whoami, ls and stats with prose', () => {
    for (const cmd of ['whoami', 'ls', 'stats']) {
      expect(parseCommand(cmd).kind).toBe('say');
    }
  });

  it('recognises the side-effect commands', () => {
    expect(parseCommand('clear')).toEqual({ kind: 'clear' });
    expect(parseCommand('sound')).toEqual({ kind: 'toggleSound' });
    expect(parseCommand('resume')).toEqual({ kind: 'openResume' });
  });

  it('reports unknown commands in the warning colour', () => {
    const result = parseCommand('launch');
    expect(result).toEqual({
      kind: 'say',
      text: 'unknown command: launch — try help',
      color: '#C0603A',
    });
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/console/commands.test.ts`
Expected: FAIL — cannot resolve `./commands`.

- [ ] **Step 3: Implement `src/console/commands.ts`**

```ts
export const COLORS = {
  ember: '#E8A33D',
  muted: '#B8AAA0',
  go: '#8FB877',
  warn: '#C0603A',
} as const;

export type CommandResult =
  | { kind: 'say'; text: string; color: string }
  | { kind: 'route'; chapterId: string; label: string }
  | { kind: 'clear' }
  | { kind: 'toggleSound' }
  | { kind: 'openResume' }
  | { kind: 'noop' };

const ROUTES: Record<string, { chapterId: string; label: string }> = {
  'top': { chapterId: 'ch0', label: 'arrival' },
  'open 00': { chapterId: 'ch0', label: 'arrival' },
  'profile': { chapterId: 'ch1', label: 'flight profile' },
  'open 01': { chapterId: 'ch1', label: 'flight profile' },
  'open 02': { chapterId: 'ch2', label: 'cbc school management' },
  'cbc': { chapterId: 'ch2', label: 'cbc school management' },
  'open cbc': { chapterId: 'ch2', label: 'cbc school management' },
  'open 03': { chapterId: 'ch3', label: 'waterwatch' },
  'water': { chapterId: 'ch3', label: 'waterwatch' },
  'waterwatch': { chapterId: 'ch3', label: 'waterwatch' },
  'open 04': { chapterId: 'ch4', label: 'smart ticketing' },
  'ticketing': { chapterId: 'ch4', label: 'smart ticketing' },
  'tickets': { chapterId: 'ch4', label: 'smart ticketing' },
  'checklist': { chapterId: 'ch5', label: 'checklist & incident' },
  'open 05': { chapterId: 'ch5', label: 'checklist & incident' },
  'incident': { chapterId: 'ch5', label: 'checklist & incident' },
  'hire': { chapterId: 'ch6', label: 'clearance' },
  'contact': { chapterId: 'ch6', label: 'clearance' },
  'open 06': { chapterId: 'ch6', label: 'clearance' },
};

const SAYS: Record<string, { text: string; color: string }> = {
  help: {
    text: 'ls · profile · open 02|03|04 · checklist · incident · hire · resume · sound · clear',
    color: COLORS.ember,
  },
  ls: {
    text: '00 arrival / 01 profile / 02 cbc / 03 waterwatch / 04 ticketing / 05 checklist+incident / 06 clearance',
    color: COLORS.muted,
  },
  whoami: {
    text: 'brian otieno — full-stack engineer, nairobi. 5 yr logged. aviation before software.',
    color: COLORS.muted,
  },
  stats: {
    text: '8 erp deployments · 99.5% uptime · 244+ institutions · 90% inside 24h sla',
    color: COLORS.muted,
  },
};

export function parseCommand(raw: string): CommandResult {
  const cmd = (raw || '').trim().toLowerCase();
  if (!cmd) return { kind: 'noop' };

  if (cmd === '?') return { kind: 'say', ...SAYS.help };
  if (cmd in SAYS) return { kind: 'say', ...SAYS[cmd] };
  if (cmd in ROUTES) return { kind: 'route', ...ROUTES[cmd] };
  if (cmd === 'clear') return { kind: 'clear' };
  if (cmd === 'sound') return { kind: 'toggleSound' };
  if (cmd === 'resume') return { kind: 'openResume' };

  return { kind: 'say', text: `unknown command: ${cmd} — try help`, color: COLORS.warn };
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/console/commands.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/console/commands.ts src/console/commands.test.ts
git commit -m "Add console command parser"
```

---

## Task 3: Console state reducer

The design keeps a rolling buffer of the last 6 lines (source lines 310–316, `.slice(-6)`).

**Files:**
- Create: `src/console/useConsole.ts`
- Test: `src/console/useConsole.test.ts`

**Interfaces:**
- Consumes: `parseCommand`, `CommandResult`, `COLORS` from Task 2
- Produces:
  ```ts
  export type ConsoleLine = { mark: '·' | '›'; text: string; color: string };
  export type ConsoleState = { lines: ConsoleLine[]; sound: boolean };
  export const MAX_LINES = 6;
  export function consoleReducer(state: ConsoleState, action: ConsoleAction): ConsoleState;
  export type ConsoleAction =
    | { type: 'echo'; text: string }
    | { type: 'say'; text: string; color: string }
    | { type: 'clear' }
    | { type: 'toggleSound' };
  ```

- [ ] **Step 1: Write the failing test**

Create `src/console/useConsole.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { consoleReducer, MAX_LINES, type ConsoleState } from './useConsole';

const empty: ConsoleState = { lines: [], sound: false };

describe('consoleReducer', () => {
  it('echoes user input with the › mark in bone', () => {
    const next = consoleReducer(empty, { type: 'echo', text: 'help' });
    expect(next.lines).toEqual([{ mark: '›', text: 'help', color: '#FBF7F1' }]);
  });

  it('adds system replies with the · mark and the given colour', () => {
    const next = consoleReducer(empty, { type: 'say', text: 'routing', color: '#8FB877' });
    expect(next.lines).toEqual([{ mark: '·', text: 'routing', color: '#8FB877' }]);
  });

  it(`keeps only the last ${MAX_LINES} lines`, () => {
    let state = empty;
    for (let i = 0; i < 10; i++) {
      state = consoleReducer(state, { type: 'echo', text: `cmd${i}` });
    }
    expect(state.lines).toHaveLength(MAX_LINES);
    expect(state.lines[0].text).toBe('cmd4');
    expect(state.lines[MAX_LINES - 1].text).toBe('cmd9');
  });

  it('clear empties the buffer but preserves the sound setting', () => {
    const seeded: ConsoleState = {
      lines: [{ mark: '·', text: 'x', color: '#fff' }],
      sound: true,
    };
    expect(consoleReducer(seeded, { type: 'clear' })).toEqual({ lines: [], sound: true });
  });

  it('toggleSound flips sound without touching the buffer', () => {
    const seeded: ConsoleState = {
      lines: [{ mark: '·', text: 'x', color: '#fff' }],
      sound: false,
    };
    const on = consoleReducer(seeded, { type: 'toggleSound' });
    expect(on.sound).toBe(true);
    expect(on.lines).toBe(seeded.lines);
    expect(consoleReducer(on, { type: 'toggleSound' }).sound).toBe(false);
  });

  it('does not mutate the previous state', () => {
    const next = consoleReducer(empty, { type: 'echo', text: 'a' });
    expect(empty.lines).toHaveLength(0);
    expect(next).not.toBe(empty);
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/console/useConsole.test.ts`
Expected: FAIL — cannot resolve `./useConsole`.

- [ ] **Step 3: Implement the reducer in `src/console/useConsole.ts`**

```ts
import { useCallback, useReducer } from 'react';
import { parseCommand } from './commands';

export const MAX_LINES = 6;

export type ConsoleLine = { mark: '·' | '›'; text: string; color: string };
export type ConsoleState = { lines: ConsoleLine[]; sound: boolean };

export type ConsoleAction =
  | { type: 'echo'; text: string }
  | { type: 'say'; text: string; color: string }
  | { type: 'clear' }
  | { type: 'toggleSound' };

const append = (state: ConsoleState, line: ConsoleLine): ConsoleState => ({
  ...state,
  lines: state.lines.concat(line).slice(-MAX_LINES),
});

export function consoleReducer(state: ConsoleState, action: ConsoleAction): ConsoleState {
  switch (action.type) {
    case 'echo':
      return append(state, { mark: '›', text: action.text, color: '#FBF7F1' });
    case 'say':
      return append(state, { mark: '·', text: action.text, color: action.color });
    case 'clear':
      return { ...state, lines: [] };
    case 'toggleSound':
      return { ...state, sound: !state.sound };
  }
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/console/useConsole.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Add the `useConsole` hook below the reducer in the same file**

`onRoute` is injected so the hook stays free of scroll concerns — Task 5 supplies the Lenis-backed implementation.

```ts
export function useConsole(onRoute: (chapterId: string) => void) {
  const [state, dispatch] = useReducer(consoleReducer, { lines: [], sound: false });

  const submit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      dispatch({ type: 'echo', text: trimmed.toLowerCase() });

      const result = parseCommand(trimmed);
      switch (result.kind) {
        case 'say':
          dispatch({ type: 'say', text: result.text, color: result.color });
          break;
        case 'route':
          onRoute(result.chapterId);
          dispatch({ type: 'say', text: `routing to ${result.label}`, color: '#8FB877' });
          break;
        case 'clear':
          dispatch({ type: 'clear' });
          break;
        case 'toggleSound':
          dispatch({ type: 'toggleSound' });
          dispatch({
            type: 'say',
            text: `sound ${!state.sound ? 'on' : 'off'}`,
            color: '#E8A33D',
          });
          break;
        case 'openResume':
          window.open('./resume.html', '_blank', 'noopener');
          dispatch({ type: 'say', text: 'opening résumé', color: '#8FB877' });
          break;
        case 'noop':
          break;
      }
    },
    [onRoute, state.sound],
  );

  return { ...state, submit };
}
```

- [ ] **Step 6: Run the whole suite, then commit**

```bash
npx vitest run
git add src/console/useConsole.ts src/console/useConsole.test.ts
git commit -m "Add console state reducer and useConsole hook"
```

---

## Task 4: Data modules

Content extracted verbatim from the design source. Chapter copy is at lines 73–283.

**Files:**
- Create: `src/data/chapters.ts`, `src/data/experience.ts`, `src/data/projects.ts`, `src/data/checklist.ts`, `src/data/contact.ts`
- Test: `src/data/data.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // chapters.ts
  export type Chapter = { id: string; hudLabel: string; screenLabel: string };
  export const CHAPTERS: readonly Chapter[];   // ch0..ch6, 7 entries
  export const CHAPTER_IDS: readonly string[]; // ['ch0',...,'ch6']

  // experience.ts
  export type Leg = {
    company: string; role: string; detail: string; sector: string;
    startCol: number; span: number; gradient: [string, string];
  };
  export const LEGS: readonly Leg[];           // 5 entries, most recent first
  export type Stat = { value: number; decimals?: number; suffix?: string; label: string };
  export const STATS: readonly Stat[];         // 4 entries

  // projects.ts
  export type Project = {
    id: 'ch2' | 'ch3' | 'ch4';
    leg: string; title: string; lede: string;
    points: readonly string[];                 // 3 items, rendered with ✓
    outcome: string;                           // rendered with →
    textSide: 'left' | 'right';
  };
  export const PROJECTS: readonly Project[];

  // checklist.ts
  export type ChecklistItem = { title: string; body: string };
  export const CHECKLIST: readonly ChecklistItem[];  // 6 entries
  export type ReportField = { n: number; label: string; placeholder: string };
  export const REPORT_FIELDS: readonly ReportField[]; // 4 entries
  export const REPORT_IS_PLACEHOLDER = true;

  // contact.ts
  export type ContactRow = { label: string; value: string; href: string };
  export const CONTACT: readonly ContactRow[];
  export const EDUCATION: readonly string[];
  export const CERTIFICATIONS: readonly string[];
  ```

- [ ] **Step 1: Write the failing test**

Create `src/data/data.test.ts`. These guard the invariants other tasks depend on — chapter ids matching the console's routes, and each project having exactly the three bullets the layout is designed around.

```ts
import { describe, it, expect } from 'vitest';
import { CHAPTERS, CHAPTER_IDS } from './chapters';
import { LEGS, STATS } from './experience';
import { PROJECTS } from './projects';
import { CHECKLIST, REPORT_FIELDS } from './checklist';
import { CONTACT } from './contact';

describe('chapters', () => {
  it('has seven chapters with unique sequential ids', () => {
    expect(CHAPTER_IDS).toEqual(['ch0', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6']);
    expect(CHAPTERS).toHaveLength(7);
    expect(new Set(CHAPTERS.map((c) => c.id)).size).toBe(7);
  });

  it('labels chapter 0 as arrival', () => {
    expect(CHAPTERS[0].hudLabel).toBe('00 · Arrival');
  });
});

describe('experience', () => {
  it('has five legs, each with a two-stop gradient', () => {
    expect(LEGS).toHaveLength(5);
    for (const leg of LEGS) {
      expect(leg.gradient).toHaveLength(2);
      expect(leg.span).toBeGreaterThan(0);
      expect(leg.startCol).toBeGreaterThanOrEqual(1);
      expect(leg.startCol + leg.span - 1).toBeLessThanOrEqual(9);
    }
  });

  it('has four stat tiles', () => {
    expect(STATS).toHaveLength(4);
    expect(STATS.map((s) => s.value)).toEqual([8, 99.5, 244, 90]);
  });
});

describe('projects', () => {
  it('covers chapters 2 through 4', () => {
    expect(PROJECTS.map((p) => p.id)).toEqual(['ch2', 'ch3', 'ch4']);
  });

  it('gives every project exactly three bullets and one outcome', () => {
    for (const p of PROJECTS) {
      expect(p.points).toHaveLength(3);
      expect(p.outcome.length).toBeGreaterThan(0);
    }
  });

  it('alternates the text side as the design does', () => {
    expect(PROJECTS.map((p) => p.textSide)).toEqual(['left', 'right', 'left']);
  });
});

describe('checklist', () => {
  it('has six checklist items and four report fields', () => {
    expect(CHECKLIST).toHaveLength(6);
    expect(REPORT_FIELDS).toHaveLength(4);
    expect(REPORT_FIELDS.map((f) => f.n)).toEqual([1, 2, 3, 4]);
  });
});

describe('contact', () => {
  it('exposes a mailto for the email row', () => {
    const email = CONTACT.find((row) => row.label === 'EMAIL');
    expect(email?.href).toBe('mailto:brianokola@gmail.com');
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/data/data.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/data/chapters.ts`**

```ts
export type Chapter = { id: string; hudLabel: string; screenLabel: string };

export const CHAPTERS: readonly Chapter[] = [
  { id: 'ch0', hudLabel: '00 · Arrival', screenLabel: '00' },
  { id: 'ch1', hudLabel: '01 · Flight profile', screenLabel: '01' },
  { id: 'ch2', hudLabel: '02 · CBC School Management', screenLabel: '02' },
  { id: 'ch3', hudLabel: '03 · WaterWatch', screenLabel: '03' },
  { id: 'ch4', hudLabel: '04 · Smart Ticketing', screenLabel: '04' },
  { id: 'ch5', hudLabel: '05 · Checklist & incident', screenLabel: '05' },
  { id: 'ch6', hudLabel: '06 · Clearance', screenLabel: '06' },
] as const;

export const CHAPTER_IDS = CHAPTERS.map((c) => c.id);
```

- [ ] **Step 4: Write `src/data/experience.ts`**

Values transcribed from design source lines 107–121. `startCol`/`span` are the CSS grid columns of the 9-column 2018–2026 timeline.

```ts
export type Leg = {
  company: string;
  role: string;
  detail: string;
  sector: string;
  startCol: number;
  span: number;
  gradient: [string, string];
};

export const LEGS: readonly Leg[] = [
  {
    company: 'Lloyd Constellations',
    role: 'Software Engineer',
    detail: 'ODOO 18 · 6 MODULES · 5 SERVERS',
    sector: 'ERP',
    startCol: 8, span: 2,
    gradient: ['#C0603A', '#E8A33D'],
  },
  {
    company: 'Integrated Spatial',
    role: 'GIS Developer & Data Eng.',
    detail: 'POSTGIS · 60+ MAPS · 4 APPS',
    sector: 'GIS',
    startCol: 6, span: 2,
    gradient: ['#3F6F5A', '#8FB877'],
  },
  {
    company: 'Bakpage Labs',
    role: 'Full-Stack Developer',
    detail: 'DJANGO + REACT · M-PESA',
    sector: 'Product',
    startCol: 4, span: 2,
    gradient: ['#4A5C7A', '#8A9FB8'],
  },
  {
    company: 'Eclectics International',
    role: 'Frontend Engineer Intern',
    detail: '244+ INSTITUTIONS',
    sector: 'Fintech',
    startCol: 3, span: 1,
    gradient: ['#5B4A6E', '#9A86B5'],
  },
  {
    company: 'Kenya Civil Aviation',
    role: 'Flight Operations Intern',
    detail: 'AOC FILES · MANUAL REVIEW',
    sector: 'Aviation',
    startCol: 1, span: 2,
    gradient: ['#6E6058', '#B8AAA0'],
  },
] as const;

export type Stat = { value: number; decimals?: number; suffix?: string; label: string };

export const STATS: readonly Stat[] = [
  { value: 8, label: 'ERP DEPLOYMENTS\nFLOWN END-TO-END' },
  { value: 99.5, decimals: 1, suffix: '%', label: 'UPTIME · 5 PRODUCTION\nSERVERS · 8 MONTHS' },
  { value: 244, suffix: '+', label: 'INSTITUTIONS REACHED\nBY SHIPPED UI' },
  { value: 90, suffix: '%', label: 'TICKETS CLOSED INSIDE\nA 24-HOUR SLA' },
] as const;
```

- [ ] **Step 5: Write `src/data/projects.ts`**

Copy transcribed verbatim from design source lines 123–239.

```ts
export type Project = {
  id: 'ch2' | 'ch3' | 'ch4';
  leg: string;
  title: string;
  lede: string;
  points: readonly string[];
  outcome: string;
  textSide: 'left' | 'right';
};

export const PROJECTS: readonly Project[] = [
  {
    id: 'ch2',
    leg: 'Leg 02 · education sector · in service',
    title: 'CBC School Management',
    lede: "Kenya moved to a competency-based curriculum and school software didn't follow. I built the platform around the new model instead of retrofitting grades onto it.",
    points: [
      'Formative competency assessment modelled directly — no percentage gradebook in a costume.',
      'Enrollment, timetabling and fees on one Django REST API with a React front end.',
      'Tuned for the low-end Android devices school staff actually carry.',
    ],
    outcome: 'In active daily use across multiple Kenyan institutions.',
    textSide: 'left',
  },
  {
    id: 'ch3',
    leg: 'Leg 03 · public infrastructure · in service',
    title: 'WaterWatch',
    lede: 'Fault reporting for community water points, built against UN SDG 6.1. The hard part was never the report — it was accountability after it.',
    points: [
      'Reporting usable by non-technical residents on any handset.',
      'Triage → claim → resolve, so no fault sits in nobody’s queue.',
      'Every status change stamped with actor and timestamp — the aviation habit, applied to water.',
    ],
    outcome: 'Nothing closes without a named owner and a full trail.',
    textSide: 'right',
  },
  {
    id: 'ch4',
    leg: 'Leg 04 · field operations · in service',
    title: 'Smart Ticketing',
    lede: 'Support work lives on phones, not desks. Tickets assigned, watched against SLA, and closed from wherever the agent is standing.',
    points: [
      'One Flutter client covering iOS and Android instead of two divergent codebases.',
      'Node/Express service owning lifecycle, assignment and notifications.',
      'SLA pressure visible in the UI before a breach, not after.',
    ],
    outcome: 'Real-time status across both platforms from one build.',
    textSide: 'left',
  },
] as const;
```

- [ ] **Step 6: Write `src/data/checklist.ts`**

Transcribe all six items from design source lines 240–266. The first three are shown here; read the file for items 4–6 and transcribe them the same way.

```ts
export type ChecklistItem = { title: string; body: string };

export const CHECKLIST: readonly ChecklistItem[] = [
  {
    title: 'Backups restored, not just taken',
    body: "Nightly PostgreSQL dumps mean nothing until you've rebuilt from one.",
  },
  {
    title: 'Migrations reversible',
    body: 'Eight concurrent client schemas taught me to write the way back first.',
  },
  {
    title: 'Audit trail on anything that matters',
    body: 'Actor and timestamp on every state change.',
  },
  // items 4–6: transcribe from design/portfolio-v5-flight-deck.dc.html lines 240–266
] as const;

export type ReportField = { n: number; label: string; placeholder: string };

/**
 * Chapter 05's occurrence report is unfilled: these placeholders are prompts
 * addressed to Brian, not finished copy. See spec §12.3. Swap `placeholder`
 * for real answers when supplied; the layout does not change.
 */
export const REPORT_IS_PLACEHOLDER = true;

export const REPORT_FIELDS: readonly ReportField[] = [
  { n: 1, label: 'WHAT HAPPENED', placeholder: 'Awaiting your account — the one production failure worth telling.' },
  { n: 2, label: 'HOW IT WAS DETECTED', placeholder: 'Alert, or a user telling you first? Both are honest answers.' },
  { n: 3, label: 'IMMEDIATE ACTION', placeholder: 'What you did in the first hour.' },
  { n: 4, label: 'WHAT CHANGED AFTER', placeholder: 'The line that turned into a checklist item above.' },
] as const;
```

- [ ] **Step 7: Write `src/data/contact.ts`**

From design source lines 267–283.

```ts
export type ContactRow = { label: string; value: string; href: string };

export const CONTACT: readonly ContactRow[] = [
  { label: 'EMAIL', value: 'brianokola@gmail.com', href: 'mailto:brianokola@gmail.com' },
  { label: 'GITHUB', value: 'default-007', href: 'https://github.com/default-007' },
  { label: 'LINKEDIN', value: 'brian-otieno', href: 'https://linkedin.com/in/brian-otieno' },
  { label: 'PHONE', value: '+254 708 681091', href: 'tel:+254708681091' },
  { label: 'DOCUMENT', value: 'Résumé →', href: './resume.html' },
] as const;

export const EDUCATION: readonly string[] = [
  'MSc Computing & Information Systems — Strathmore (in progress)',
  'Data Science & ML — MIT',
  'Software Development — Moringa',
  'BSc Civil Aviation — Moi',
] as const;

export const CERTIFICATIONS: readonly string[] = [
  'AWS Cloud Practitioner',
  'Cisco Junior Cyber Security Analyst (in progress)',
] as const;
```

- [ ] **Step 8: Run the test, verify it passes**

Run: `npx vitest run src/data/data.test.ts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/data
git commit -m "Add typed content data modules"
```

---

## Task 5: Lenis smooth scroll bridged to ScrollTrigger

**Files:**
- Create: `src/motion/useSmoothScroll.ts`
- Test: `src/motion/useSmoothScroll.test.ts`

**Interfaces:**
- Consumes: `prefersReducedMotion` from Task 1
- Produces:
  ```ts
  export function useSmoothScroll(): { scrollTo: (chapterId: string) => void };
  ```

- [ ] **Step 1: Write the failing test**

Lenis is mocked — this test verifies wiring, not scroll physics.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const lenisInstance = {
  on: vi.fn(),
  raf: vi.fn(),
  scrollTo: vi.fn(),
  destroy: vi.fn(),
};

vi.mock('lenis', () => ({ default: vi.fn(() => lenisInstance) }));

beforeEach(() => vi.clearAllMocks());

import { useSmoothScroll } from './useSmoothScroll';

describe('useSmoothScroll', () => {
  it('subscribes ScrollTrigger to Lenis scroll events', () => {
    renderHook(() => useSmoothScroll());
    expect(lenisInstance.on).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('destroys the instance on unmount', () => {
    const { unmount } = renderHook(() => useSmoothScroll());
    unmount();
    expect(lenisInstance.destroy).toHaveBeenCalled();
  });

  it('scrollTo targets the element by id selector', () => {
    const { result } = renderHook(() => useSmoothScroll());
    result.current.scrollTo('ch3');
    expect(lenisInstance.scrollTo).toHaveBeenCalledWith('#ch3', expect.any(Object));
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/motion/useSmoothScroll.test.ts`
Expected: FAIL — cannot resolve `./useSmoothScroll`.

- [ ] **Step 3: Implement `src/motion/useSmoothScroll.ts`**

One RAF loop: Lenis is driven by `gsap.ticker` rather than its own `requestAnimationFrame`, so scroll and tweens stay on the same clock.

```ts
import { useCallback, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../lib/env';

gsap.registerPlugin(ScrollTrigger);

export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((chapterId: string) => {
    const selector = `#${chapterId}`;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(selector, { offset: 0, duration: 1.2 });
      return;
    }
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return { scrollTo };
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/motion/useSmoothScroll.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/motion/useSmoothScroll.ts src/motion/useSmoothScroll.test.ts
git commit -m "Bridge Lenis smooth scroll to GSAP ScrollTrigger"
```

---

## Task 6: Reveal, split-text, counter and magnetic hooks

Ports the motion behaviours from design source lines 465–620, minus the canvas-host workarounds the spec drops (§7).

**Files:**
- Create: `src/motion/useReveal.ts`, `src/motion/useSplitText.ts`, `src/motion/useCounter.ts`, `src/motion/useMagnetic.ts`
- Test: `src/motion/useReveal.test.ts`

**Interfaces:**
- Consumes: `prefersReducedMotion`
- Produces:
  ```ts
  export function useReveal(scope: RefObject<HTMLElement | null>): void;
  export function useSplitText(ref: RefObject<HTMLElement | null>): void;
  export function useCounter(value: number, decimals?: number): RefObject<HTMLSpanElement>;
  export function useMagnetic(): RefObject<HTMLAnchorElement>;
  ```

- [ ] **Step 1: Write the failing test for reduced-motion gating**

This is the spec's §7 guarantee, so it gets a test.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { useRef } from 'react';

const fromTo = vi.fn();
vi.mock('gsap', () => ({
  gsap: {
    fromTo,
    set: vi.fn(),
    registerPlugin: vi.fn(),
    utils: { toArray: (sel: string) => Array.from(document.querySelectorAll(sel)) },
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { update: vi.fn() } }));
// useGSAP defers to a layout effect and owns cleanup; for this test we only
// care that the callback runs, so invoke it directly.
vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void) => { fn(); },
}));

import { useReveal } from './useReveal';

const Probe = () => {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  return <div ref={ref}><p data-anim="fade">hello</p></div>;
};

beforeEach(() => vi.clearAllMocks());

describe('useReveal', () => {
  it('registers no tweens when reduced motion is preferred', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    render(<Probe />);
    expect(fromTo).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('animates from a visible-safe fromTo when motion is allowed', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
    render(<Probe />);
    expect(fromTo).toHaveBeenCalled();
    const [, , to] = fromTo.mock.calls[0];
    expect(to.immediateRender).toBe(false);
    vi.unstubAllGlobals();
  });
});
```

Rename the test file to `useReveal.test.tsx` since it contains JSX.

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/motion/useReveal.test.tsx`
Expected: FAIL — cannot resolve `./useReveal`.

- [ ] **Step 3: Implement `src/motion/useReveal.ts`**

```ts
import { type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../lib/env';

export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>('[data-anim="fade"]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            immediateRender: false,
            overwrite: 'auto',
            scrollTrigger: { trigger: el, start: 'top 90%' },
          },
        );
      });
    },
    { scope },
  );
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/motion/useReveal.test.tsx`
Expected: PASS.

- [ ] **Step 5: Implement `useSplitText.ts`**

Port `split()` and `charTween()` from design source lines 465–500. Wraps each word in an `overflow: hidden` inline-block, each character in a `.deck-char` span, then tweens `yPercent: 108 → 0` with a 0.014s stagger and `expo.out`. The wrapper must set `aria-label` to the original text and `aria-hidden` on the split spans, so the headline stays one string to a screen reader.

- [ ] **Step 6: Implement `useCounter.ts`**

Counts to `value` over 1.4s with `power2.out`, honouring `decimals` (99.5 renders one decimal place, the rest render integers), triggered by ScrollTrigger at `top 90%`. Under reduced motion it writes the final value immediately.

- [ ] **Step 7: Implement `useMagnetic.ts`**

Port `ambient()`'s magnetic logic from design source lines 447–462: on `pointermove`, if the cursor is within `max(width, 170)` px, tween `x: dx * 0.22, y: dy * 0.3` with `power3.out`; otherwise return to origin with `elastic.out(1, 0.5)`. Skip entirely under reduced motion. Use one shared listener registered `{ passive: true }`.

- [ ] **Step 8: Run the suite and commit**

```bash
npx vitest run
git add src/motion
git commit -m "Add reveal, split-text, counter and magnetic motion hooks"
```

---

## Task 7: HUD chrome

Design source lines 36–52.

**Files:**
- Create: `src/components/hud/StatusStrip.tsx`, `src/components/hud/AltitudeLadder.tsx`, `src/components/hud/CornerBrackets.tsx`, `src/motion/useChapterTracking.ts`
- Test: `src/components/hud/StatusStrip.test.tsx`

**Interfaces:**
- Consumes: `CHAPTERS` from Task 4
- Produces:
  ```ts
  export function useChapterTracking(): { activeId: string; progress: number };
  ```

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { StatusStrip } from './StatusStrip';

afterEach(() => vi.useRealTimers());

describe('StatusStrip', () => {
  it('shows the availability notice and location', () => {
    render(<StatusStrip activeChapterLabel="00 · Arrival" />);
    expect(screen.getByText('Available for assignment')).toBeInTheDocument();
    expect(screen.getByText('NBO · UTC+3')).toBeInTheDocument();
  });

  it('shows the active chapter label', () => {
    render(<StatusStrip activeChapterLabel="03 · WaterWatch" />);
    expect(screen.getByText('03 · WaterWatch')).toBeInTheDocument();
  });

  it('ticks the clock every second in 24-hour format', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-04T14:30:05Z'));
    render(<StatusStrip activeChapterLabel="00 · Arrival" />);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByTestId('hud-clock').textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/components/hud/StatusStrip.test.tsx`
Expected: FAIL — cannot resolve `./StatusStrip`.

- [ ] **Step 3: Implement `StatusStrip.tsx`**

Port the markup from design source lines 37–41 into Tailwind utilities. Fixed strip, 38px tall, `z-50`, gradient background `linear-gradient(180deg, rgba(10,8,7,0.94), rgba(10,8,7,0.55))`, bottom border `rgba(239,230,218,0.12)`, mono 10px uppercase with `0.18em` tracking. Left: a `#8FB877` dot with `animation: deck-blink 2.4s infinite` plus "Available for assignment". Centre: the active chapter label in ember, truncating. Right: `<span data-testid="hud-clock">` driven by a 1s interval using `toLocaleTimeString('en-GB', { hour12: false })`, then "NBO · UTC+3".

The strip is decorative chrome duplicating information available in the page, so the wrapper keeps `aria-hidden="true"` as the design has it — except the clock, which is `aria-hidden` too. Nothing here is the only route to any content.

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/components/hud/StatusStrip.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Implement `useChapterTracking.ts`**

One ScrollTrigger per `section[data-chapter]` with `start: 'top 55%'`, `end: 'bottom 45%'`, setting `activeId` on toggle; plus one page-level trigger from `top top` to `bottom bottom` reporting `progress`. Ports design source lines 552–580.

- [ ] **Step 6: Implement `AltitudeLadder.tsx` and `CornerBrackets.tsx`**

Ladder: fixed left rail 56px wide starting below the strip, a 1px 52%-height track in `rgba(239,230,218,0.14)`, a 7px ember dot positioned at `top: ${progress * 100}%` with `box-shadow: 0 0 14px 3px rgba(232,163,61,0.5)`, and a 3-digit zero-padded percentage below it. Brackets: three 16px L-shapes in `rgba(232,163,61,0.4)` at the positions in design source lines 49–51.

- [ ] **Step 7: Commit**

```bash
git add src/components/hud src/motion/useChapterTracking.ts
git commit -m "Add HUD status strip, altitude ladder and corner brackets"
```

---

## Task 8: Console UI

Design source lines 53–72.

**Files:**
- Create: `src/console/Console.tsx`, `src/console/ConsoleLog.tsx`
- Test: `src/console/Console.test.tsx`

**Interfaces:**
- Consumes: `useConsole` (Task 3), `useSmoothScroll` (Task 5)
- Produces: `<Console onRoute={(id: string) => void} />`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Console } from './Console';

describe('Console', () => {
  it('echoes input and prints the reply', async () => {
    const user = userEvent.setup();
    render(<Console onRoute={vi.fn()} />);
    await user.type(screen.getByLabelText('Flight deck command line'), 'whoami{Enter}');
    expect(screen.getByText('whoami')).toBeInTheDocument();
    expect(screen.getByText(/full-stack engineer, nairobi/)).toBeInTheDocument();
  });

  it('routes on a navigation command', async () => {
    const user = userEvent.setup();
    const onRoute = vi.fn();
    render(<Console onRoute={onRoute} />);
    await user.type(screen.getByLabelText('Flight deck command line'), 'open 03{Enter}');
    expect(onRoute).toHaveBeenCalledWith('ch3');
  });

  it('clears the input after submit', async () => {
    const user = userEvent.setup();
    render(<Console onRoute={vi.fn()} />);
    const input = screen.getByLabelText('Flight deck command line') as HTMLInputElement;
    await user.type(input, 'help{Enter}');
    expect(input.value).toBe('');
  });

  it('runs the command on a quick-chip click', async () => {
    const user = userEvent.setup();
    const onRoute = vi.fn();
    render(<Console onRoute={onRoute} />);
    await user.click(screen.getByRole('button', { name: /hire/i }));
    expect(onRoute).toHaveBeenCalledWith('ch6');
  });

  it('focuses the input when / is pressed outside a field', async () => {
    const user = userEvent.setup();
    render(<Console onRoute={vi.fn()} />);
    await user.keyboard('/');
    expect(screen.getByLabelText('Flight deck command line')).toHaveFocus();
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/console/Console.test.tsx`
Expected: FAIL — cannot resolve `./Console`.

- [ ] **Step 3: Implement `ConsoleLog.tsx` then `Console.tsx`**

Fixed to the bottom, `z-[62]`, top border `rgba(239,230,218,0.14)`, background `linear-gradient(0deg, rgba(10,8,7,0.97), rgba(10,8,7,0.82))`. Log area `max-h-[150px]`, bottom-aligned, each line mono 11.5px with the mark in `#5F534B`. Form row: `DECK ›` prompt in rust, a bare input (`all: unset` equivalent — mono 13px, bone, ember caret) with `aria-label="Flight deck command line"` and placeholder `type help — or press / anywhere`, then the four chips (`help`, `profile`, `hire`, `snd on|off`).

Keyboard: a `keydown` listener that focuses the input on `/` when the target is not an input/textarea/contenteditable, and jumps chapters on `j`/`k` — `j` forward, `k` back, clamped to the ends of `CHAPTER_IDS`. Port from design source lines 361–375.

Optional WebAudio blips port from lines 317–327 and stay off by default.

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/console/Console.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/console/Console.tsx src/console/ConsoleLog.tsx src/console/Console.test.tsx
git commit -m "Add command console UI with keyboard navigation"
```

---

## Task 9: Atmosphere layers

**Files:**
- Create: `src/components/atmosphere/Grain.tsx`, `Vignette.tsx`, `Spotlight.tsx`

**Interfaces:**
- Consumes: `prefersReducedMotion`
- Produces: three prop-less components

- [ ] **Step 1: Implement the three components**

`Grain` and `Vignette` are single `aria-hidden` divs carrying `.deck-grain` / `.deck-vignette` from Task 1's CSS. `Spotlight` carries `.deck-spotlight` and, on `pointermove`, sets opacity to 1 and follows the cursor via `gsap.quickTo(el, 'left', { duration: 0.55, ease: 'power3' })` and the same for `'top'` — ported from design source lines 440–446. It returns `null` under reduced motion.

- [ ] **Step 2: Verify in the browser**

Run: `npm run dev`. Grain is visible as fine noise; the vignette darkens the edges; the spotlight follows the cursor. Toggle OS reduced-motion and confirm grain and spotlight disappear.

- [ ] **Step 3: Commit**

```bash
git add src/components/atmosphere
git commit -m "Add grain, vignette and cursor spotlight layers"
```

---

## Task 10: Chapter 00 — Arrival

Design source lines 73–101. Portrait already in the repo at `assets/brian-speaking.png` (506×627).

**Files:**
- Create: `src/components/chapters/Arrival.tsx`
- Create: `src/assets/brian-speaking.png` (move from `assets/`)
- Test: `src/components/chapters/Arrival.test.tsx`

**Interfaces:**
- Consumes: `useSplitText`, `useMagnetic`
- Produces: `<Arrival />`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Arrival } from './Arrival';

describe('Arrival', () => {
  it('renders the headline as one accessible string', () => {
    render(<Arrival />);
    expect(
      screen.getByRole('heading', { name: /Brian Otieno certifies systems for daily service\./i }),
    ).toBeInTheDocument();
  });

  it('states the aviation-to-software positioning', () => {
    render(<Arrival />);
    expect(screen.getByText(/procedure is not bureaucracy/)).toBeInTheDocument();
  });

  it('offers both calls to action', () => {
    render(<Arrival />);
    expect(screen.getByRole('link', { name: /Walk the deck/ })).toHaveAttribute('href', '#ch2');
    expect(screen.getByRole('link', { name: /Request contact/ })).toHaveAttribute(
      'href', 'mailto:brianokola@gmail.com',
    );
  });

  it('gives the portrait a real alt text', () => {
    render(<Arrival />);
    expect(screen.getByAltText('Brian Otieno')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/components/chapters/Arrival.test.tsx`
Expected: FAIL — cannot resolve `./Arrival`.

- [ ] **Step 3: Move the portrait and implement the component**

```bash
mkdir -p src/assets && git mv assets/brian-speaking.png src/assets/brian-speaking.png && rmdir assets
```

Port lines 73–101. Section is `min-h-screen`, `padding: 78px 40px 120px 76px`, an auto-fit grid with `minmax(min(100%, 380px), 1fr)` and 40px gap. Contents:

- Aura div carrying `.deck-aura` with the two layered radial gradients from line 74.
- Spec strip: three bordered mono cells — `Reg. 5Y—BOO`, `Full-stack engineer`, `5 yr + logged` (last in ember).
- `<h1 data-split="1">` at `clamp(44px, 7.6vw, 124px)`, Newsreader 200, `line-height: 0.9`, `letter-spacing: -0.04em`, with "certifies" in ember italic and its double text-shadow.
- Lede paragraph, Newsreader 19.5px, `max-width: 600px`, colour `--color-muted`.
- Two CTAs, both `data-magnetic`, plus the "or press / to fly it by keyboard" hint.
- Portrait panel: `max-width: 340px`, 1px border, `overflow: hidden`; image at `height: 108%`, `object-position: 52% 14%`, `filter: saturate(0.8) contrast(1.06) brightness(0.9)`; then the bottom gradient scrim, the `.deck-scanlines` overlay, the sweeping band (`deck-scan 7.5s linear infinite`), the 50px radar disc with its conic sweep and blinking centre, and the `PHOTO / OTIENO_B` / `NBO` caption row.

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/components/chapters/Arrival.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Compare against the design in the browser**

Run: `npm run dev`. Open `design/portfolio-v5-flight-deck.dc.html` side by side and check the headline scale, the portrait crop and the aura position match.

- [ ] **Step 6: Commit**

```bash
git add src/components/chapters/Arrival.tsx src/components/chapters/Arrival.test.tsx src/assets
git commit -m "Add chapter 00 Arrival"
```

---

## Task 11: Chapter 01 — Flight profile

Design source lines 103–122.

**Files:**
- Create: `src/components/chapters/FlightProfile.tsx`
- Test: `src/components/chapters/FlightProfile.test.tsx`

**Interfaces:**
- Consumes: `LEGS`, `STATS` (Task 4), `useCounter`, `useSplitText`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlightProfile } from './FlightProfile';
import { LEGS } from '../../data/experience';

describe('FlightProfile', () => {
  it('renders every career leg', () => {
    render(<FlightProfile />);
    for (const leg of LEGS) {
      expect(screen.getByText(leg.company)).toBeInTheDocument();
      expect(screen.getByText(leg.role)).toBeInTheDocument();
    }
  });

  it('renders the timeline year headers 18 through 26', () => {
    render(<FlightProfile />);
    for (const year of ['18', '19', '20', '21', '22', '23', '24', '25', '26']) {
      expect(screen.getByText(year)).toBeInTheDocument();
    }
  });

  it('renders the four stat labels', () => {
    render(<FlightProfile />);
    expect(screen.getByText(/ERP DEPLOYMENTS/)).toBeInTheDocument();
    expect(screen.getByText(/INSTITUTIONS REACHED/)).toBeInTheDocument();
  });

  it('shows stat values before any animation runs', () => {
    render(<FlightProfile />);
    expect(screen.getByText('244')).toBeInTheDocument();
  });
});
```

The last test enforces the Global Constraint that content is visible by default.

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/components/chapters/FlightProfile.test.tsx`
Expected: FAIL — cannot resolve `./FlightProfile`.

- [ ] **Step 3: Implement the component**

Background `--color-deck-raised`. A header row (`Flight profile · 2018 — 2026` in ember, `6 legs logged` right), a `data-split` h2 at `clamp(30px, 4.4vw, 64px)`, then the timeline: a 9-column year header followed by one row per `LEGS` entry using `grid-template-columns: 190px minmax(0,1fr) 96px`. Each bar is `grid-column: ${startCol} / span ${span}` with `linear-gradient(90deg, ...leg.gradient)` and `transform-origin: 0 50%`. Below, the four `STATS` tiles in a `repeat(auto-fit, minmax(190px, 1fr))` grid with a 1px gap over a `rgba(239,230,218,0.1)` background to draw the dividers.

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/components/chapters/FlightProfile.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/chapters/FlightProfile.tsx src/components/chapters/FlightProfile.test.tsx
git commit -m "Add chapter 01 Flight profile"
```

---

## Task 12: Case study shell

**Files:**
- Create: `src/components/chapters/CaseStudy.tsx`
- Test: `src/components/chapters/CaseStudy.test.tsx`

**Interfaces:**
- Consumes: `Project` (Task 4)
- Produces:
  ```tsx
  export function CaseStudy(props: { project: Project; children: ReactNode }): JSX.Element;
  ```
  `children` is the bespoke mockup. The component places text and mockup according to `project.textSide`.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CaseStudy } from './CaseStudy';
import { PROJECTS } from '../../data/projects';

const project = PROJECTS[0];

describe('CaseStudy', () => {
  it('renders leg label, title, lede, bullets and outcome', () => {
    render(<CaseStudy project={project}><div /></CaseStudy>);
    expect(screen.getByText(project.leg)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: project.title })).toBeInTheDocument();
    expect(screen.getByText(project.lede)).toBeInTheDocument();
    for (const point of project.points) {
      expect(screen.getByText(point)).toBeInTheDocument();
    }
    expect(screen.getByText(project.outcome)).toBeInTheDocument();
  });

  it('renders the mockup passed as children', () => {
    render(<CaseStudy project={project}><div data-testid="mockup" /></CaseStudy>);
    expect(screen.getByTestId('mockup')).toBeInTheDocument();
  });

  it('uses the project id as the section id so anchors resolve', () => {
    const { container } = render(<CaseStudy project={project}><div /></CaseStudy>);
    expect(container.querySelector('section')).toHaveAttribute('id', project.id);
  });

  it('puts the mockup first in DOM order when text sits on the right', () => {
    const rightText = { ...project, textSide: 'right' as const };
    const { container } = render(
      <CaseStudy project={rightText}><div data-testid="mockup" /></CaseStudy>,
    );
    const children = Array.from(container.querySelector('section')!.children);
    expect(children[0].querySelector('[data-testid="mockup"]')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/components/chapters/CaseStudy.test.tsx`
Expected: FAIL — cannot resolve `./CaseStudy`.

- [ ] **Step 3: Implement the component**

Section: `min-h-screen`, `padding: 78px 40px 120px 76px`, auto-fit grid `minmax(min(100%, 400px), 1fr)` with 48px gap, `align-items: center`, and `data-chapter` set from the matching `CHAPTERS` entry. Text side: leg label in mono uppercase dim, `data-split` h2, lede paragraph in `--color-muted`, then three `✓` bullets in `--color-go` and the `→` outcome line in ember.

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/components/chapters/CaseStudy.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/chapters/CaseStudy.tsx src/components/chapters/CaseStudy.test.tsx
git commit -m "Add shared case study shell"
```

---

## Task 13: Three project mockups

Each is a static visual, hand-ported. No shared abstraction — they share a vocabulary, not a data shape.

**Files:**
- Create: `src/components/chapters/mockups/CompetencySheet.tsx` (design lines 130–160)
- Create: `src/components/chapters/mockups/TriageQueue.tsx` (design lines 165–195)
- Create: `src/components/chapters/mockups/TicketQueuePhone.tsx` (design lines 208–238)
- Test: `src/components/chapters/mockups/mockups.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompetencySheet } from './CompetencySheet';
import { TriageQueue } from './TriageQueue';
import { TicketQueuePhone } from './TicketQueuePhone';

describe('CompetencySheet', () => {
  it('shows the competency levels rather than percentage grades', () => {
    render(<CompetencySheet />);
    expect(screen.getByText('EXCEEDING')).toBeInTheDocument();
    expect(screen.getByText('MEETING')).toBeInTheDocument();
    expect(screen.getByText('APPROACHING')).toBeInTheDocument();
  });

  it('shows the audit stamp', () => {
    render(<CompetencySheet />);
    expect(screen.getByText(/Audit: 4 changes stamped/)).toBeInTheDocument();
  });
});

describe('TriageQueue', () => {
  it('shows queue states including a breach', () => {
    render(<TriageQueue />);
    expect(screen.getByText('BREACHING')).toBeInTheDocument();
    expect(screen.getByText('CLAIMED')).toBeInTheDocument();
    expect(screen.getByText('CLOSED')).toBeInTheDocument();
  });

  it('states the audit rule', () => {
    render(<TriageQueue />);
    expect(screen.getByText(/every transition carries actor \+ timestamp/)).toBeInTheDocument();
  });
});

describe('TicketQueuePhone', () => {
  it('shows the agent queue with SLA pressure', () => {
    render(<TicketQueuePhone />);
    expect(screen.getByText(/My queue/)).toBeInTheDocument();
    expect(screen.getByText(/34m LEFT/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/components/chapters/mockups/mockups.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Port the three mockups**

Read each line range and translate inline styles to Tailwind, keeping exact colours and sizes. All three are decorative product illustrations: wrap each in `role="img"` with an `aria-label` describing it in one sentence (for example `aria-label="Mockup of a CBC competency assessment sheet"`), and mark the internal text `aria-hidden` so a screen reader is not read a table of invented learner names.

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/components/chapters/mockups/mockups.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 5: Wire the three case study chapters into `App.tsx` and check them in the browser**

- [ ] **Step 6: Commit**

```bash
git add src/components/chapters/mockups
git commit -m "Add the three project mockups"
```

---

## Task 14: Chapter 05 — Checklist and occurrence report

Design source lines 240–266. **The report copy is a placeholder — see spec §12.3. Do not invent an incident.**

**Files:**
- Create: `src/components/chapters/Checklist.tsx`
- Test: `src/components/chapters/Checklist.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Checklist } from './Checklist';
import { CHECKLIST, REPORT_FIELDS } from '../../data/checklist';

describe('Checklist', () => {
  it('renders all six checklist items', () => {
    render(<Checklist />);
    for (const item of CHECKLIST) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it('renders the four occurrence report fields', () => {
    render(<Checklist />);
    for (const field of REPORT_FIELDS) {
      expect(screen.getByText(field.label)).toBeInTheDocument();
    }
  });

  it('renders the report as static content, not an interactive form', () => {
    const { container } = render(<Checklist />);
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
  });
});
```

The third test matters: there is no backend, so the report must never look submittable.

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/components/chapters/Checklist.test.tsx`
Expected: FAIL — cannot resolve `./Checklist`.

- [ ] **Step 3: Implement the component**

Background `--color-deck-raised`. Left: `Leg 05 · standard procedure`, the `data-split` headline "Aviation gave me a checklist habit. I never shipped it away.", the KCAA paragraph, then the six `CHECKLIST` items as `data-anim="check"` rows — ember `✓`, bone title, dim body, `CHECKED` chip on the right. Right: the "Occurrence report / FORM 05—A" panel with the four numbered fields rendered as static text, and the closing line "Send me the four answers and I'll set this in type — no failure invented on your behalf."

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/components/chapters/Checklist.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/chapters/Checklist.tsx src/components/chapters/Checklist.test.tsx
git commit -m "Add chapter 05 Checklist and occurrence report

Report copy is the design's placeholder pending real incident content."
```

---

## Task 15: Chapter 06 — Clearance

Design source lines 267–283.

**Files:**
- Create: `src/components/chapters/Clearance.tsx`
- Test: `src/components/chapters/Clearance.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Clearance } from './Clearance';

describe('Clearance', () => {
  it('renders the closing headline', () => {
    render(<Clearance />);
    expect(screen.getByRole('heading', { name: /Cleared for departure\./ })).toBeInTheDocument();
  });

  it('links email, github, linkedin and phone', () => {
    render(<Clearance />);
    expect(screen.getByRole('link', { name: /brianokola@gmail\.com/ })).toHaveAttribute(
      'href', 'mailto:brianokola@gmail.com',
    );
    expect(screen.getByRole('link', { name: /default-007/ })).toHaveAttribute(
      'href', 'https://github.com/default-007',
    );
    expect(screen.getByRole('link', { name: /\+254 708 681091/ })).toHaveAttribute(
      'href', 'tel:+254708681091',
    );
  });

  it('opens external profiles safely', () => {
    render(<Clearance />);
    const github = screen.getByRole('link', { name: /default-007/ });
    expect(github).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('lists education and certifications', () => {
    render(<Clearance />);
    expect(screen.getByText(/Strathmore/)).toBeInTheDocument();
    expect(screen.getByText(/AWS Cloud Practitioner/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/components/chapters/Clearance.test.tsx`
Expected: FAIL — cannot resolve `./Clearance`.

- [ ] **Step 3: Implement the component**

Left: `Leg 06 · clearance to contact`, the `data-split` headline, the hiring paragraph, then `EDUCATION` and `CERTIFICATIONS` as a dim mono list. Right: the `CONTACT` rows as a bordered stack, label in dim mono, value as a link in ember. External links get `target="_blank" rel="noopener noreferrer"`.

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/components/chapters/Clearance.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/chapters/Clearance.tsx src/components/chapters/Clearance.test.tsx
git commit -m "Add chapter 06 Clearance"
```

---

## Task 16: Compose the app

**Files:**
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';
import { CHAPTER_IDS } from './data/chapters';

describe('App', () => {
  it('renders all seven chapters in order with the expected ids', () => {
    const { container } = render(<App />);
    const ids = Array.from(container.querySelectorAll('section[data-chapter]')).map((s) => s.id);
    expect(ids).toEqual([...CHAPTER_IDS]);
  });

  it('renders exactly one console', () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll('[aria-label="Flight deck command line"]')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL — chapters not composed.

- [ ] **Step 3: Implement `App.tsx`**

```tsx
import { useRef } from 'react';
import { Grain } from './components/atmosphere/Grain';
import { Vignette } from './components/atmosphere/Vignette';
import { Spotlight } from './components/atmosphere/Spotlight';
import { StatusStrip } from './components/hud/StatusStrip';
import { AltitudeLadder } from './components/hud/AltitudeLadder';
import { CornerBrackets } from './components/hud/CornerBrackets';
import { Console } from './console/Console';
import { Arrival } from './components/chapters/Arrival';
import { FlightProfile } from './components/chapters/FlightProfile';
import { CaseStudy } from './components/chapters/CaseStudy';
import { CompetencySheet } from './components/chapters/mockups/CompetencySheet';
import { TriageQueue } from './components/chapters/mockups/TriageQueue';
import { TicketQueuePhone } from './components/chapters/mockups/TicketQueuePhone';
import { Checklist } from './components/chapters/Checklist';
import { Clearance } from './components/chapters/Clearance';
import { useSmoothScroll } from './motion/useSmoothScroll';
import { useReveal } from './motion/useReveal';
import { useChapterTracking } from './motion/useChapterTracking';
import { PROJECTS } from './data/projects';
import { CHAPTERS } from './data/chapters';

const MOCKUPS = {
  ch2: CompetencySheet,
  ch3: TriageQueue,
  ch4: TicketQueuePhone,
} as const;

export default function App() {
  const scope = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();
  const { activeId, progress } = useChapterTracking();
  useReveal(scope);

  const activeLabel =
    CHAPTERS.find((c) => c.id === activeId)?.hudLabel ?? CHAPTERS[0].hudLabel;

  return (
    <div ref={scope} className="relative bg-deck text-body">
      <Grain />
      <Spotlight />
      <Vignette />
      <StatusStrip activeChapterLabel={activeLabel} />
      <AltitudeLadder progress={progress} />
      <CornerBrackets />

      <Arrival />
      <FlightProfile />
      {PROJECTS.map((project) => {
        const Mockup = MOCKUPS[project.id];
        return (
          <CaseStudy key={project.id} project={project}>
            <Mockup />
          </CaseStudy>
        );
      })}
      <Checklist />
      <Clearance />

      <Console onRoute={scrollTo} />
    </div>
  );
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Full-page check in the browser**

Run: `npm run dev`. Scroll the whole page: the HUD chapter readout changes at each section, the ladder tracks progress, headlines split and rise, career bars grow, stats count up, magnetic CTAs respond. Type `open 04` in the console and confirm it scrolls there. Press `j` and `k` and confirm chapter stepping.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "Compose chapters, HUD, atmosphere and console into the page"
```

---

## Task 17: EmberField WebGL hero effect

Spec §8 — the single three.js effect, lazily loaded, mounted only when supported.

**Files:**
- Create: `src/components/atmosphere/EmberField.tsx`
- Create: `src/components/atmosphere/HeroAtmosphere.tsx`
- Modify: `src/components/chapters/Arrival.tsx`
- Test: `src/components/atmosphere/HeroAtmosphere.test.tsx`

**Interfaces:**
- Consumes: `hasWebGL`, `prefersReducedMotion` (Task 1)
- Produces: `<HeroAtmosphere />` — renders the CSS aura fallback or lazily mounts `EmberField`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../lib/env', () => ({
  hasWebGL: vi.fn(),
  prefersReducedMotion: vi.fn(),
}));

import { hasWebGL, prefersReducedMotion } from '../../lib/env';
import { HeroAtmosphere } from './HeroAtmosphere';

afterEach(() => vi.clearAllMocks());

describe('HeroAtmosphere', () => {
  it('falls back to the CSS aura when WebGL is unavailable', () => {
    vi.mocked(hasWebGL).mockReturnValue(false);
    vi.mocked(prefersReducedMotion).mockReturnValue(false);
    render(<HeroAtmosphere />);
    expect(screen.getByTestId('css-aura')).toBeInTheDocument();
  });

  it('falls back to the CSS aura under reduced motion even with WebGL', () => {
    vi.mocked(hasWebGL).mockReturnValue(true);
    vi.mocked(prefersReducedMotion).mockReturnValue(true);
    render(<HeroAtmosphere />);
    expect(screen.getByTestId('css-aura')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run src/components/atmosphere/HeroAtmosphere.test.tsx`
Expected: FAIL — cannot resolve `./HeroAtmosphere`.

- [ ] **Step 3: Implement `HeroAtmosphere.tsx`**

```tsx
import { lazy, Suspense, useEffect, useState } from 'react';
import { hasWebGL, prefersReducedMotion } from '../../lib/env';

const EmberField = lazy(() =>
  import('./EmberField').then((m) => ({ default: m.EmberField })),
);

const AURA_BACKGROUND =
  'radial-gradient(45% 45% at 38% 44%, rgba(192,96,58,0.36) 0%, rgba(192,96,58,0) 70%), ' +
  'radial-gradient(38% 38% at 66% 62%, rgba(232,163,61,0.22) 0%, rgba(232,163,61,0) 72%)';

function CssAura() {
  return (
    <div
      data-testid="css-aura"
      data-anim="aura"
      aria-hidden="true"
      className="deck-aura pointer-events-none absolute -top-[24%] -left-[8%] h-[150%] w-[72%]"
      style={{ background: AURA_BACKGROUND }}
    />
  );
}

export function HeroAtmosphere() {
  // Capability checks run after mount so the first paint is always the CSS
  // fallback — the 3D layer is an upgrade, never a prerequisite.
  const [use3D, setUse3D] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1024px)').matches;
    setUse3D(wide && hasWebGL() && !prefersReducedMotion());
  }, []);

  if (!use3D) return <CssAura />;

  return (
    <Suspense fallback={<CssAura />}>
      <EmberField />
    </Suspense>
  );
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run src/components/atmosphere/HeroAtmosphere.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Implement `EmberField.tsx`**

A `<Canvas>` from `@react-three/fiber` positioned absolutely behind the hero content, `dpr={[1, 1.5]}` to cap cost on high-density screens, containing one fullscreen plane with a `shaderMaterial`. The fragment shader layers two domain-warped fbm noise fields in `#C0603A` and `#E8A33D` over transparent, advanced by `uTime` and nudged by `uPointer`. `useFrame` advances time and lerps the pointer. Match the CSS aura's placement and intensity so the fallback and the upgrade read as the same design.

- [ ] **Step 6: Use it in `Arrival.tsx`**

Replace the hand-written aura div from Task 10 with `<HeroAtmosphere />`. Re-run `npx vitest run src/components/chapters/Arrival.test.tsx` — still PASS.

- [ ] **Step 7: Verify the chunk split**

Run: `npm run build`. Confirm the output lists a separate `three` chunk and that `index.html` does not preload it.

- [ ] **Step 8: Commit**

```bash
git add src/components/atmosphere src/components/chapters/Arrival.tsx
git commit -m "Add lazy WebGL ember field with CSS aura fallback"
```

---

## Task 18: Résumé page

**Unblocked.** The résumé source was retrieved and is vendored at `design/brian-otieno-resume.dc.html` (186 lines). It is the authority for every word, date, bullet and colour on this page — copy is never invented, never paraphrased, never reordered.

The source is a Claude Design canvas document: a `<doc-page>` shell from `doc-page.js` with `margin="0.6in"`, wrapped in `<x-dc>`, using `<sc-if value="{{ ... }}">` conditional blocks and inline styles. It uses a **print palette entirely distinct from the flight deck's**: `#1f3a5f` navy for section rules and headings, `#141414` for titles, `#2b2b2b` body, `#4a4a4a` employer names, `#6b6b6b` dates, `#d8dde3` hairlines, white background. Fonts: `Newsreader, Georgia, serif` for the summary paragraph, `'IBM Plex Sans', sans-serif` everywhere else.

**Files:**
- Create: `public/resume.html` — a standalone, self-contained static HTML file (not a Vite entry point, not React). It ships verbatim through the build because Vite copies `public/` unmodified, so `./resume.html` resolves from the cPanel document root without any routing.

**Interfaces:**
- Consumes: nothing from earlier tasks. This page is deliberately standalone — it must print correctly with no JS and no bundled CSS.
- Produces: the file that the console's `resume` command and the Clearance chapter's `DOCUMENT` row both link to as `./resume.html`.

- [ ] **Step 1: Read the source.** Read `design/brian-otieno-resume.dc.html` end to end.

- [ ] **Step 2: Port it to plain HTML.** Produce `public/resume.html` as a complete document (`<!doctype html>`, `<html lang="en">`, `<head>` with `<meta charset>`, `<meta name="viewport">`, `<title>Brian Otieno — Résumé</title>`, and the Google Fonts links for Newsreader and IBM Plex Sans copied from the source's `<helmet>` block).

  Transform rules, applied mechanically:
  - `<x-dc>` and `<helmet>` wrappers: drop the wrappers, hoist the `<head>` contents.
  - `<doc-page margin="0.6in">`: replace with a plain `<main class="page">` plus CSS implementing the same page box — `@page { size: A4; margin: 0.6in; }` and, for screen, a centered `max-width: 8.27in` sheet with `padding: 0.6in`, white background, subtle shadow on a `#eceff3` screen backdrop.
  - `<sc-if value="{{ showSummary }}">` and any other `sc-if`: **render the contained block** (the placeholder hints show these default to `true`); delete only the `sc-if` tags themselves.
  - `<sc-for list="{{ ... }}" as="...">`: unroll to the literal repeated markup, using the source's own content for every iteration.
  - `{{ ... }}` interpolations: replace with the literal value the source's placeholder hint gives. If a hint gives no value, the surrounding literal text in the source is the value.
  - Inline `style="..."` attributes: keep them as-is. They are the design. Do not refactor them into classes, do not "clean them up", do not substitute Tailwind.
  - `style-hover="..."` attributes, if any: move to a `<style>` rule in the head using a generated class; the visual result must be identical.

- [ ] **Step 3: Add print rules.** In a `<style>` block: `@media print { body { background: #fff } .page { box-shadow: none; margin: 0; padding: 0; max-width: none } }`. Keep the source's existing `break-inside: avoid` on each experience entry. No `position: fixed`, no viewport units (`vh`/`vw`) anywhere in the file — both break paged output.

- [ ] **Step 4: Add a back link.** A single unobtrusive link at the top, `<a href="./index.html">&larr; Back to portfolio</a>`, styled in `#1f3a5f` IBM Plex Sans at 8.4pt, inside a wrapper carrying `class="no-print"` with `@media print { .no-print { display: none } }`. This is the one element not in the source, and it exists because a standalone page with no way back is a dead end.

- [ ] **Step 5: Verify the content matches.** Diff the rendered text against the source: every employer, title, date range, and bullet must appear once, in the source's order, with the source's wording. Confirm the six experience entries (Lloyd Cooper Consulting Group, Integrated Spatial Solutions, Bakpage Labs, Eclectics International, Cape Media/TV47, Kenya Civil Aviation Authority), the technical-skills grid, the three selected projects, the four education entries, and the two certifications are all present.

  Note for the record: spec §12.4 flags two résumé-vs-flight-deck discrepancies (employer name, Cisco certification). On **this** page the résumé's own wording is authoritative — do not import the flight deck's variants.

- [ ] **Step 6: Verify it builds and prints.** Run `npm run build`, confirm `dist/resume.html` exists byte-identical to the source file, and open `dist/index.html` and `dist/resume.html` from a static server to confirm the links resolve both ways.

```bash
npm run build
test -f dist/resume.html && diff public/resume.html dist/resume.html && echo "resume.html ships verbatim"
```

- [ ] **Step 7: Commit.**

```bash
git add public/resume.html design/brian-otieno-resume.dc.html
git commit -m "feat: add printable resume page"
```

**No PDF.** The plan previously called for `public/Brian_Otieno_Resume.pdf`. No PDF exists in the design project and none has been supplied, and a link to a file that 404s is worse than no link. The HTML page prints to PDF from any browser, which covers the need. Do not generate a PDF, and do not add a PDF link anywhere.

---

## Task 19: Production build and deployment

**Files:**
- Create: `public/.htaccess`, `DEPLOY.md`
- Modify: `src/components/chapters/Arrival.tsx` (responsive image sources)

- [ ] **Step 1: Write `public/.htaccess`**

```apache
# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json image/svg+xml
</IfModule>

# Hashed assets are immutable; the entry document must never be cached.
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/avif "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

<FilesMatch "\.(html)$">
  Header set Cache-Control "no-cache, must-revalidate"
</FilesMatch>

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

- [ ] **Step 2: Generate AVIF and WebP portrait variants**

```bash
npx @squoosh/cli --avif auto --webp auto -d src/assets src/assets/brian-speaking.png
```

Then serve them from a `<picture>` in `Arrival.tsx` with the PNG as the final `<img>` fallback. Note the source is 506×627, which is adequate at the design's 340px display width but only ~1.5× on a retina screen — if a higher-resolution original exists, use it.

- [ ] **Step 3: Build and verify the output is relocatable**

```bash
npm run build
grep -o 'src="[^"]*"' dist/index.html
```

Expected: every path starts with `./`. Then serve `dist/` from a subdirectory to prove it works when not at the domain root:

```bash
npx serve dist
```

- [ ] **Step 4: Write `DEPLOY.md`**

Document: run `npm run build`; open cPanel → File Manager → `public_html`; delete previous contents; upload the *contents* of `dist/` (not the folder itself); confirm `.htaccess` uploaded, since File Manager hides dotfiles until "Show Hidden Files" is enabled; hard-refresh to bypass the cached old `index.html`.

- [ ] **Step 5: Run the full suite and build one last time**

```bash
npx vitest run && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add public/.htaccess DEPLOY.md src/assets src/components/chapters/Arrival.tsx
git commit -m "Add deployment config, responsive portrait and deploy guide"
```

---

## Self-Review Notes

**Spec coverage:** §3 stack → Task 1. §4 tokens → Task 1 Step 9. §5 structure → Tasks 4, 12, 13. §6 styling → Tasks 1, 10–15. §7 motion → Tasks 5, 6, 7. §8 three.js → Task 17. §9 testing → Tasks 2, 3, 6 and per-component tests throughout. §10 deployment → Task 19. §11 removals → Task 1 Step 1. §12.1 résumé → Task 18 (blocked, marked). §12.2 portrait → resolved, asset in repo. §12.3 report placeholder → Task 14, guarded by a test that it renders no form. §12.4 discrepancies → carried into `experience.ts` and `contact.ts` as the design's wording, pending Brian's confirmation.

**Known gaps, deliberate:** Task 6 Steps 5–7 and Task 13 Step 3 describe ports from specific line ranges rather than reproducing the code — the vendored design file is the authority and copying it into the plan would duplicate the source of truth. Task 17 Step 5's shader is described, not written, because its parameters need tuning against the live page.
