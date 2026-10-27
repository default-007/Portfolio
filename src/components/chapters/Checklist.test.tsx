import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Checklist } from './Checklist';
import { CHECKLIST } from '../../data/checklist';

describe('Checklist', () => {
  it('renders all six checklist items', () => {
    render(<Checklist />);
    for (const item of CHECKLIST) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it('renders no occurrence-report panel', () => {
    // The design's report shipped unfilled, so its placeholder prompts were
    // rendering as body copy. Asserted here so it cannot return by accident
    // without a real incident account to put in it.
    const { container } = render(<Checklist />);
    expect(container.querySelector('[data-anim="report"]')).toBeNull();
    expect(screen.queryByText(/Awaiting your account/i)).toBeNull();
  });
});
