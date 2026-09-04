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

export const CHAPTER_IDS: readonly string[] = CHAPTERS.map((c) => c.id);
