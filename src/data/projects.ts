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
      "Triage → claim → resolve, so no fault sits in nobody's queue.",
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
