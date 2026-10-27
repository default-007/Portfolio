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
    body: 'Actor and timestamp on every state change: money, grades, faults.',
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
