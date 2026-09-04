import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Arrival } from './Arrival';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Arrival', () => {
  it('renders the headline as one accessible string', () => {
    render(<Arrival />);
    expect(
      screen.getByRole('heading', { name: /Brian Otieno certifies systems for daily service\./i }),
    ).toBeInTheDocument();
  });

  it('states the aviation-to-software positioning', () => {
    render(<Arrival />);
    expect(screen.getByText(/procedure is not bureaucracy/)).toBeInTheDocument();
  });

  it('offers both calls to action', () => {
    render(<Arrival />);
    expect(screen.getByRole('link', { name: /Walk the deck/ })).toHaveAttribute('href', '#ch2');
    expect(screen.getByRole('link', { name: /Request contact/ })).toHaveAttribute(
      'href', 'mailto:brianokola@gmail.com',
    );
  });

  it('gives the portrait a real alt text', () => {
    render(<Arrival />);
    expect(screen.getByAltText('Brian Otieno')).toBeInTheDocument();
  });

  it('keeps the headline fully present and readable under reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    render(<Arrival />);
    expect(
      screen.getByRole('heading', { name: /Brian Otieno certifies systems for daily service\./i }),
    ).toBeInTheDocument();
  });
});
