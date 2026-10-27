import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusStrip } from './StatusStrip';

describe('StatusStrip', () => {
  it('shows the availability notice and location', () => {
    render(<StatusStrip activeChapterLabel="00 · Arrival" />);
    expect(screen.getByText('Available for assignment')).toBeInTheDocument();
    expect(screen.getByText('Nairobi · UTC+3')).toBeInTheDocument();
  });

  it('shows the active chapter label', () => {
    render(<StatusStrip activeChapterLabel="03 · WaterWatch" />);
    expect(screen.getByText('03 · WaterWatch')).toBeInTheDocument();
  });

  // The design's ticking clock and blinking availability lamp are both gone
  // on purpose (see StatusStrip.tsx). Asserted rather than merely deleted:
  // a per-second interval in a component this high in the tree is the kind
  // of thing that gets re-added as "atmosphere" without anyone noticing the
  // re-render cost.
  it('renders no clock and holds no interval', () => {
    const { container, unmount } = render(<StatusStrip activeChapterLabel="00 · Arrival" />);
    expect(screen.queryByTestId('hud-clock')).toBeNull();
    expect(container.textContent).not.toMatch(/\d{2}:\d{2}:\d{2}/);
    unmount();
  });

  it('lights the availability lamp without animating it', () => {
    render(<StatusStrip activeChapterLabel="00 · Arrival" />);
    const dot = screen.getByText('Available for assignment').querySelector('span');
    expect(dot).not.toBeNull();
    expect(dot?.className).toContain('bg-go');
    expect(dot?.className).not.toContain('deck-blink');
  });
});
