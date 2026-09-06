import { describe, it, expect } from 'vitest';
import { CHAPTERS, CHAPTER_IDS } from './chapters';
import { LEGS, STATS } from './experience';
import { PROJECTS } from './projects';
import { CHECKLIST, REPORT_FIELDS, REPORT_CLOSING_NOTE } from './checklist';
import { CONTACT, EDUCATION, CERTIFICATIONS } from './contact';

describe('chapters', () => {
  it('has seven chapters with unique sequential ids', () => {
    expect(CHAPTER_IDS).toEqual(['ch0', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6']);
    expect(CHAPTERS).toHaveLength(7);
    expect(new Set(CHAPTERS.map((c) => c.id)).size).toBe(7);
  });

  it('labels chapter 0 as arrival', () => {
    expect(CHAPTERS[0].hudLabel).toBe('00 · Arrival');
  });

  it('pins the remaining chapter hud labels verbatim', () => {
    expect(CHAPTERS.map((c) => c.hudLabel)).toEqual([
      '00 · Arrival',
      '01 · Flight profile',
      '02 · CBC School Management',
      '03 · WaterWatch',
      '04 · Smart Ticketing',
      '05 · Checklist & incident',
      '06 · Clearance',
    ]);
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

  it('lists legs most recent first, pinning company and role text', () => {
    expect(LEGS.map((l) => l.company)).toEqual([
      'Lloyd Cooper',
      'Integrated Spatial',
      'Bakpage Labs',
      'Eclectics International',
      'Kenya Civil Aviation',
    ]);
    expect(LEGS[0].role).toBe('Software Engineer');
    expect(LEGS[0].detail).toBe('ODOO 18 · 6 MODULES · 5 SERVERS');
    expect(LEGS[4].sector).toBe('Aviation');
  });

  it('has four stat tiles', () => {
    expect(STATS).toHaveLength(4);
    expect(STATS.map((s) => s.value)).toEqual([8, 99.5, 244, 90]);
  });

  it('pins stat labels and suffixes verbatim', () => {
    expect(STATS[0].label).toBe('ERP DEPLOYMENTS\nFLOWN END-TO-END');
    expect(STATS[1]).toMatchObject({ decimals: 1, suffix: '%' });
    expect(STATS[2].suffix).toBe('+');
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

  it('pins project titles and outcomes verbatim', () => {
    expect(PROJECTS.map((p) => p.title)).toEqual([
      'CBC School Management',
      'WaterWatch',
      'Smart Ticketing',
    ]);
    expect(PROJECTS[0].outcome).toBe('In active daily use across multiple Kenyan institutions.');
    expect(PROJECTS[1].outcome).toBe('Nothing closes without a named owner and a full trail.');
    expect(PROJECTS[2].outcome).toBe('Real-time status across both platforms from one build.');
  });

  it('pins every project lede verbatim', () => {
    expect(PROJECTS.map((p) => p.lede)).toEqual([
      "Kenya moved to a competency-based curriculum and school software didn't follow. I built the platform around the new model instead of retrofitting grades onto it.",
      'Fault reporting for community water points, built against UN SDG 6.1. The hard part was never the report — it was accountability after it.',
      'Support work lives on phones, not desks. Tickets assigned, watched against SLA, and closed from wherever the agent is standing.',
    ]);
  });

  it('pins every project bullet point verbatim', () => {
    expect(PROJECTS.map((p) => [...p.points])).toEqual([
      [
        'Formative competency assessment modelled directly — no percentage gradebook in a costume.',
        'Enrollment, timetabling and fees on one Django REST API with a React front end.',
        'Tuned for the low-end Android devices school staff actually carry.',
      ],
      [
        'Reporting usable by non-technical residents on any handset.',
        "Triage → claim → resolve, so no fault sits in nobody's queue.",
        'Every status change stamped with actor and timestamp — the aviation habit, applied to water.',
      ],
      [
        'One Flutter client covering iOS and Android instead of two divergent codebases.',
        'Node/Express service owning lifecycle, assignment and notifications.',
        'SLA pressure visible in the UI before a breach, not after.',
      ],
    ]);
  });
});

describe('checklist', () => {
  it('has six checklist items and four report fields', () => {
    expect(CHECKLIST).toHaveLength(6);
    expect(REPORT_FIELDS).toHaveLength(4);
    expect(REPORT_FIELDS.map((f) => f.n)).toEqual([1, 2, 3, 4]);
  });

  it('pins checklist titles verbatim', () => {
    expect(CHECKLIST.map((c) => c.title)).toEqual([
      'Backups restored, not just taken',
      'Migrations reversible',
      'Audit trail on anything that matters',
      'Monitoring before incidents, not after',
      'Tested on the worst device in the room',
      'Handover documented',
    ]);
  });

  it('pins every checklist body verbatim, including item 3\'s trailing clause', () => {
    expect(CHECKLIST.map((c) => c.body)).toEqual([
      "Nightly PostgreSQL dumps mean nothing until you've rebuilt from one.",
      'Eight concurrent client schemas taught me to write the way back first.',
      'Actor and timestamp on every state change — money, grades, faults.',
      'Proactive patching and alerting is how five servers held 99.5%.',
      "If it isn't usable on a low-end Android, it isn't shipped.",
      'Architecture and deployment written down so the bus factor stays above one.',
    ]);
  });

  it('pins every occurrence-report field label and placeholder verbatim', () => {
    expect(REPORT_FIELDS).toEqual([
      { n: 1, label: 'WHAT HAPPENED', placeholder: 'Awaiting your account — the one production failure worth telling.' },
      { n: 2, label: 'HOW IT WAS DETECTED', placeholder: 'Alert, or a user telling you first? Both are honest answers.' },
      { n: 3, label: 'IMMEDIATE ACTION', placeholder: 'What you did in the first hour.' },
      { n: 4, label: 'WHAT CHANGED AFTER', placeholder: 'The line that turned into a checklist item above.' },
    ]);
  });

  it('pins the occurrence-report closing note verbatim', () => {
    expect(REPORT_CLOSING_NOTE).toBe(
      "Send me the four answers and I'll set this in type — no failure invented on your behalf.",
    );
  });
});

describe('contact', () => {
  it('exposes a mailto for the email row', () => {
    const email = CONTACT.find((row) => row.label === 'EMAIL');
    expect(email?.href).toBe('mailto:brianokola@gmail.com');
  });

  it('points the DOCUMENT row at the deployed resume, not the design canvas path', () => {
    const document = CONTACT.find((row) => row.label === 'DOCUMENT');
    expect(document?.value).toBe('Résumé →');
    expect(document?.href).toBe('./resume.html');
  });

  it('pins education and certification copy verbatim', () => {
    expect(EDUCATION).toEqual([
      'MSc Computing & Information Systems — Strathmore (in progress)',
      'Data Science & ML — MIT',
      'Software Development — Moringa',
      'BSc Civil Aviation — Moi',
    ]);
    expect(CERTIFICATIONS).toEqual([
      'AWS Cloud Practitioner',
      'Cisco CCNA (in progress)',
    ]);
  });
});
