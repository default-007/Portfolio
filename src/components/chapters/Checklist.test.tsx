import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Checklist } from './Checklist';
import { CHECKLIST, REPORT_FIELDS } from '../../data/checklist';

describe('Checklist', () => {
  it('renders all six checklist items', () => {
    render(<Checklist />);
    for (const item of CHECKLIST) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it('renders the four occurrence report fields', () => {
    render(<Checklist />);
    for (const field of REPORT_FIELDS) {
      expect(screen.getByText(field.label)).toBeInTheDocument();
    }
  });

  it('renders the report as static content, not an interactive form', () => {
    const { container } = render(<Checklist />);
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
  });
});
