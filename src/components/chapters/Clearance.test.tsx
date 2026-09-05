import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Clearance } from './Clearance';

describe('Clearance', () => {
  it('renders the closing headline', () => {
    render(<Clearance />);
    expect(screen.getByRole('heading', { name: /Cleared for departure\./ })).toBeInTheDocument();
  });

  it('links email, github, linkedin and phone', () => {
    render(<Clearance />);
    expect(screen.getByRole('link', { name: /brianokola@gmail\.com/ })).toHaveAttribute(
      'href', 'mailto:brianokola@gmail.com',
    );
    expect(screen.getByRole('link', { name: /default-007/ })).toHaveAttribute(
      'href', 'https://github.com/default-007',
    );
    expect(screen.getByRole('link', { name: /\+254 708 681091/ })).toHaveAttribute(
      'href', 'tel:+254708681091',
    );
  });

  it('opens external profiles safely', () => {
    render(<Clearance />);
    const github = screen.getByRole('link', { name: /default-007/ });
    expect(github).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('lists education and certifications', () => {
    render(<Clearance />);
    expect(screen.getByText(/Strathmore/)).toBeInTheDocument();
    expect(screen.getByText(/AWS Cloud Practitioner/)).toBeInTheDocument();
  });
});
