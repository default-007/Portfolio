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
    expect(screen.getAllByText('EXCEEDING').length).toBeGreaterThan(0);
    expect(screen.getAllByText('MEETING').length).toBeGreaterThan(0);
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
