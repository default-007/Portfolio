import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CaseStudy } from './CaseStudy';
import { PROJECTS } from '../../data/projects';

const project = PROJECTS[0];

describe('CaseStudy', () => {
  it('renders leg label, title, lede, bullets and outcome', () => {
    render(<CaseStudy project={project}><div /></CaseStudy>);
    expect(screen.getByText(project.leg)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: project.title })).toBeInTheDocument();
    expect(screen.getByText(project.lede)).toBeInTheDocument();
    for (const point of project.points) {
      expect(screen.getByText(point)).toBeInTheDocument();
    }
    expect(screen.getByText(project.outcome)).toBeInTheDocument();
  });

  it('renders the mockup passed as children', () => {
    render(<CaseStudy project={project}><div data-testid="mockup" /></CaseStudy>);
    expect(screen.getByTestId('mockup')).toBeInTheDocument();
  });

  it('uses the project id as the section id so anchors resolve', () => {
    const { container } = render(<CaseStudy project={project}><div /></CaseStudy>);
    expect(container.querySelector('section')).toHaveAttribute('id', project.id);
  });

  it('puts the mockup first in DOM order when text sits on the right', () => {
    const rightText = { ...project, textSide: 'right' as const };
    const { container } = render(
      <CaseStudy project={rightText}><div data-testid="mockup" /></CaseStudy>,
    );
    const children = Array.from(container.querySelector('section')!.children);
    expect(children[0].querySelector('[data-testid="mockup"]')).toBeTruthy();
  });
  // The design gives each case study its own leg-label accent and its own
  // lede measure (520px for ch2, 500px for ch3/ch4). Pinning both per
  // chapter: a single averaged constant would silently redesign two of the
  // three sections and nothing else in the suite would notice.
  it.each([
    ['ch2', 'text-rust', 'max-w-[520px]'],
    ['ch3', 'text-go', 'max-w-[500px]'],
    ['ch4', 'text-horizon', 'max-w-[500px]'],
  ])('gives %s its own accent and lede measure', (id, accent, measure) => {
    const p = PROJECTS.find((x) => x.id === id)!;
    render(<CaseStudy project={p}><div /></CaseStudy>);
    expect(screen.getByText(p.leg).className).toContain(accent);
    expect(screen.getByText(p.lede).className).toContain(measure);
  });
  // The design darkens alternate chapters page-wide (ch1/ch3/ch5), so among
  // the case studies only ch3 is raised. Pinned because the derivation is a
  // one-line parity check that would go wrong silently.
  it.each([
    ['ch2', false],
    ['ch3', true],
    ['ch4', false],
  ])('raises the background for %s only when the design darkens it', (id, raised) => {
    const p = PROJECTS.find((x) => x.id === id)!;
    const { container } = render(<CaseStudy project={p}><div /></CaseStudy>);
    const cls = container.querySelector('section')!.className;
    expect(cls.includes('bg-deck-raised')).toBe(raised);
  });
});
