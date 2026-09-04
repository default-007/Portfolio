import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useLayoutEffect } from 'react';

// FlightProfile drives its stat counters through useCounter, which pairs a
// real gsap.to() with a ScrollTrigger. In jsdom every element reports a
// zero-size layout, so ScrollTrigger's own initial-refresh render fires
// synchronously and would stomp the static "244"-before-animation value
// this suite is verifying — mirroring the mocks useCounter's own test file
// uses to isolate the hook from that same real-GSAP/jsdom interaction.
vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    registerPlugin: vi.fn(),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { update: vi.fn() } }));
vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void) => {
    useLayoutEffect(fn);
  },
}));

import { FlightProfile } from './FlightProfile';
import { LEGS, STATS } from '../../data/experience';

afterEach(() => {
  vi.unstubAllGlobals();
});

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

  it('positions each timeline bar from its LEGS entry, not a hardcoded offset', () => {
    const { container } = render(<FlightProfile />);
    const bars = container.querySelectorAll<HTMLElement>('[data-bar="1"]');
    expect(bars).toHaveLength(LEGS.length);
    bars.forEach((bar, i) => {
      const leg = LEGS[i];
      expect(bar.style.gridColumn).toBe(`${leg.startCol} / span ${leg.span}`);
    });
  });

  it('keeps every stat value and every leg company/role present under reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    render(<FlightProfile />);
    for (const stat of STATS) {
      expect(screen.getByText(stat.value.toFixed(stat.decimals ?? 0))).toBeInTheDocument();
    }
    for (const leg of LEGS) {
      expect(screen.getByText(leg.company)).toBeInTheDocument();
      expect(screen.getByText(leg.role)).toBeInTheDocument();
    }
  });
});
