import { describe, it, expect } from 'vitest';
import { CHAPTERS, CHAPTER_IDS } from './chapters';
import { LEGS, STATS } from './experience';
import { PROJECTS } from './projects';
import { CHECKLIST, REPORT_FIELDS } from './checklist';
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
      'Lloyd Constellations',
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
});

describe('contact', () => {
  it('exposes a mailto for the email row', () => {
    const email = CONTACT.find((row) => row.label === 'EMAIL');
    expect(email?.href).toBe('mailto:brianokola@gmail.com');
  });

  it('pins education and certification copy verbatim', () => {
    expect(EDUCATION).toHaveLength(4);
    expect(EDUCATION[0]).toBe('MSc Computing & Information Systems — Strathmore (in progress)');
    expect(CERTIFICATIONS).toHaveLength(2);
    expect(CERTIFICATIONS[0]).toBe('AWS Cloud Practitioner');
  });
});
