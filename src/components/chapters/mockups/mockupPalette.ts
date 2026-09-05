import type { CSSProperties } from 'react';

// Illustration palette for the three case-study mockups (design source
// portfolio-v5-flight-deck.dc.html lines 135-238: CompetencySheet, TriageQueue,
// TicketQueuePhone). These hexes are specific to the mockup screens — they
// don't recur anywhere else on the site — so a @theme token per value would
// bloat the global palette with ~20 entries used exactly once. Scattering the
// raw hex through each component's JSX instead would violate the project's
// colour rule the other way. The middle ground: name them once here as CSS
// custom-property maps, spread onto each mockup's root `style`, and read
// back in JSX via `bg-[var(--mock-x)]` / `text-[var(--mock-x)]` — so a
// className string never carries a bare hex literal, and the values live in
// exactly one place.
//
// Colours that already match an existing @theme token (rust, ember, go,
// bone, body, dim-1, dim-3, dim-4 — see src/styles/index.css) are used via
// that token directly in each component instead of being redefined here.
// `--mock-deep-green` (#3F6F5A) is the one hex shared between two mockups
// (CompetencySheet's "EE" cells and TicketQueuePhone's dispatch bars) and is
// repeated verbatim rather than factored, since the two screens are
// otherwise independent illustrations with no shared abstraction.

export const competencySheetVars = {
  '--mock-paper': '#F7F3EC',
  '--mock-paper-header': '#E9E1D4',
  '--mock-paper-header-border': '#D6CBBA',
  '--mock-sidebar': '#F0EAE0',
  '--mock-sidebar-border': '#DFD5C6',
  '--mock-sidebar-ink': '#6B6259',
  '--mock-clay': '#A0725C',
  '--mock-ink': '#241E19',
  '--mock-row-ink': '#4E453D',
  '--mock-row-divider': '#EDE6DA',
  '--mock-deep-green': '#3F6F5A',
  '--mock-badge-green-bg': '#DCEAD2',
  '--mock-badge-tan-bg': '#F3E4D2',
  '--mock-badge-peach-bg': '#F6DED2',
} as CSSProperties;

export const triageQueueVars = {
  '--mock-dark-bg': '#0F1512',
  '--mock-header-bg': '#141C18',
  '--mock-panel-bg': '#0B100D',
  '--mock-badge-ink': '#0E1710',
  '--mock-muted-green-gray': '#7E8A78',
  '--mock-dim-green-gray': '#5F6B5C',
} as CSSProperties;

export const ticketQueuePhoneVars = {
  '--mock-phone-case': '#12100E',
  '--mock-phone-screen': '#1A1613',
  '--mock-dispatch-bg': '#0E0C0A',
  '--mock-deep-green': '#3F6F5A',
} as CSSProperties;
