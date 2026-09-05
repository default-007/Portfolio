import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';
import { CHAPTER_IDS } from './data/chapters';

describe('App', () => {
  it('renders all seven chapters in order with the expected ids', () => {
    const { container } = render(<App />);
    const ids = Array.from(container.querySelectorAll('section[data-chapter]')).map((s) => s.id);
    expect(ids).toEqual([...CHAPTER_IDS]);
  });

  it('renders exactly one console', () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll('[aria-label="Flight deck command line"]')).toHaveLength(1);
  });
});
