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
});
