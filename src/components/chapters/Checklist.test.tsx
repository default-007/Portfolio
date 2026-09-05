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
  // Asserts the marker's DOM position, not merely its count: the design puts
  // data-field on the answer text alone so only that slides in while the
  // numbered label stays put. A count-only check passes just as happily with
  // the marker on the wrapper, which would animate the whole block.
  it('marks each answer text node with data-field, not the field wrapper', () => {
    const { container } = render(<Checklist />);
    const marked = Array.from(container.querySelectorAll('[data-field="1"]'));
    expect(marked.map((el) => el.textContent)).toEqual(
      REPORT_FIELDS.map((f) => f.placeholder),
    );
  });
});
