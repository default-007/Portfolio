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
    body: 'Actor and timestamp on every state change — money, grades, faults.',
  },
  {
    title: 'Monitoring before incidents, not after',
    body: 'Proactive patching and alerting is how five servers held 99.5%.',
  },
  {
    title: 'Tested on the worst device in the room',
    body: "If it isn't usable on a low-end Android, it isn't shipped.",
  },
  {
    title: 'Handover documented',
    body: 'Architecture and deployment written down so the bus factor stays above one.',
  },
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

export const REPORT_CLOSING_NOTE: string =
  "Send me the four answers and I'll set this in type — no failure invented on your behalf.";
