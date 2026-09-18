import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { StatusStrip } from './StatusStrip';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('StatusStrip', () => {
  it('shows the availability notice and location', () => {
    render(<StatusStrip activeChapterLabel="00 · Arrival" />);
    expect(screen.getByText('Available for assignment')).toBeInTheDocument();
    expect(screen.getByText('NBO · UTC+3')).toBeInTheDocument();
  });

  it('shows the active chapter label', () => {
    render(<StatusStrip activeChapterLabel="03 · WaterWatch" />);
    expect(screen.getByText('03 · WaterWatch')).toBeInTheDocument();
  });

  it('ticks the clock every second in 24-hour format', () => {
    const toLocaleTimeStringSpy = vi.spyOn(Date.prototype, 'toLocaleTimeString');
    try {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-09-04T14:30:05Z'));
      render(<StatusStrip activeChapterLabel="00 · Arrival" />);
      act(() => { vi.advanceTimersByTime(1000); });
      expect(screen.getByTestId('hud-clock').textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(toLocaleTimeStringSpy).toHaveBeenCalledWith('en-GB', { hour12: false });
    } finally {
      toLocaleTimeStringSpy.mockRestore();
    }
  });

  it('suppresses the status dot animation under reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    render(<StatusStrip activeChapterLabel="00 · Arrival" />);
    const dot = screen.getByText('Available for assignment').parentElement?.querySelector('span:first-child > span');
    expect(dot).not.toBeNull();
    expect(dot?.className).not.toContain('deck-blink');
  });
});
