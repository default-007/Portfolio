import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompetencySheet } from './CompetencySheet';
import { TriageQueue } from './TriageQueue';
import { TicketQueuePhone } from './TicketQueuePhone';

describe('CompetencySheet', () => {
  it('shows the competency levels rather than percentage grades', () => {
    render(<CompetencySheet />);
    // The design (lines 151-155) marks two learners EXCEEDING (Achieng,
    // Omondi) and two MEETING (Barasa, Chebet), so getByText's single-match
    // assertion — the brief's original form — throws on these two; only
    // APPROACHING (Kimani, alone) is unique. getAllByText preserves the
    // brief's intent (the label is present) without altering the ported,
    // byte-verified design copy to make it artificially unique.
    // Pinned to the design's real counts rather than toBeGreaterThan(0):
    // an existence check would still pass if a regression dropped one of
    // the two rows, which is the mistake most likely to happen here.
    expect(screen.getAllByText('EXCEEDING')).toHaveLength(2);
    expect(screen.getAllByText('MEETING')).toHaveLength(2);
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

// The three mockups are decorative illustrations full of invented learner
// names, ticket ids and map pins. The role="img" + aria-label + aria-hidden
// contract is what stops a screen reader reading that fiction aloud as if it
// were data, and nothing else in the suite would notice if an edit dropped it.
describe.each([
  [CompetencySheet, /competency/i],
  [TriageQueue, /triage|queue|water/i],
  [TicketQueuePhone, /ticket/i],
])('accessibility contract', (Mockup, labelPattern) => {
  it(`exposes ${Mockup.name} as a single labelled image with its text hidden`, () => {
    const { container } = render(<Mockup />);
    const img = screen.getByRole('img');
    expect(img).toBe(container.firstElementChild);
    expect(img.getAttribute('aria-label')).toMatch(labelPattern);
    // Every text-bearing descendant sits inside an aria-hidden subtree.
    const exposed = Array.from(img.querySelectorAll('*')).filter(
      (el) =>
        el.textContent?.trim() &&
        !el.closest('[aria-hidden="true"]'),
    );
    expect(exposed).toEqual([]);
  });
});
