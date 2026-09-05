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

  // Sweeps every anchor rather than spot-checking one: the brief's original
  // test read only GitHub's `rel` and never asserted `target` at all, so it
  // passed whether or not the new-tab attributes were there, and said nothing
  // about LinkedIn or about mail/tel/document links wrongly getting a target.
  it('opens external profiles in a new tab and leaves mail, phone and the document link in place', () => {
    const { container } = render(<Clearance />);
    const links = Array.from(container.querySelectorAll('a'));
    const external = links.filter((a) => a.getAttribute('href')!.startsWith('http'));

    // Pins the split so the loop below cannot pass by matching nothing.
    expect(external.map((a) => a.getAttribute('href'))).toEqual([
      'https://github.com/default-007',
      'https://linkedin.com/in/brian-otieno',
    ]);

    for (const a of links) {
      if (a.getAttribute('href')!.startsWith('http')) {
        expect(a).toHaveAttribute('target', '_blank');
        expect(a).toHaveAttribute('rel', 'noopener noreferrer');
      } else {
        expect(a).not.toHaveAttribute('target');
        expect(a).not.toHaveAttribute('rel');
      }
    }
  });

  // These are the site owner's real credentials, one of which still carries an
  // open question. A /Strathmore/ presence check — which is what the brief
  // asked for — passes just as happily with an "(in progress)" marker dropped,
  // a degree renamed, or the ember span landing on the wrong words. So this
  // pins all three lines whole, against design line 273, and pins where the
  // two ember spans sit rather than only that two exist.
  it('renders the three credential lines exactly as the design has them', () => {
    const { container } = render(<Clearance />);
    // The two <br> separators appear only inside the credentials block.
    const block = container.querySelector('br')!.parentElement!;
    const lines = block.innerHTML.split('<br>');

    expect(lines.map((line) => line.replace(/<[^>]+>/g, ''))).toEqual([
      'MSc Computing &amp; Information Systems — Strathmore (in progress)',
      'Data Science &amp; ML — MIT · Software Development — Moringa · BSc Civil Aviation — Moi',
      'AWS Cloud Practitioner · Cisco Junior Cyber Security Analyst (in progress)',
    ]);

    expect(lines[0]).toMatch(/Strathmore <span class="text-ember">\(in progress\)<\/span>$/);
    expect(lines[1]).not.toContain('<span');
    expect(lines[2]).toMatch(/Analyst <span class="text-ember">\(in progress\)<\/span>$/);
  });
});
