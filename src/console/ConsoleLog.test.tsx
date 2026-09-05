import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ConsoleLog } from './ConsoleLog';
import { MAX_LINES, type ConsoleLine } from './useConsole';

const line = (id: number): ConsoleLine => ({
  id,
  mark: '·',
  text: `line ${id}`,
  color: '#FBF7F1',
});

describe('ConsoleLog', () => {
  it('renders each line with its mark, text and colour', () => {
    const { container } = render(<ConsoleLog lines={[line(0), line(1)]} />);
    const rows = container.querySelectorAll('[aria-live="polite"] > div');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toBe('·line 0');
  });

  // The scrollback is an aria-live="polite" region, so what a screen reader
  // announces is whatever React changes in it. Keyed by array index, an
  // append past the cap shifts every line into the previous slot: React keeps
  // the six DOM nodes but rewrites the text of all six, and the reader hears
  // the entire scrollback again instead of the one new reply. Keyed by the
  // line's own id, the five surviving nodes are untouched and only the new
  // row is announced. Node identity alone cannot tell those apart — React
  // reuses the nodes either way — so this asserts that each surviving node
  // still carries the *same text* it did before the append.
  it('leaves the surviving lines\' DOM nodes untouched when the buffer scrolls', () => {
    const before = Array.from({ length: MAX_LINES }, (_, i) => line(i));
    const { container, rerender } = render(<ConsoleLog lines={before} />);
    const rowsOf = () =>
      Array.from(container.querySelectorAll<HTMLElement>('[aria-live="polite"] > div'));

    const original = rowsOf().map((node) => ({ node, text: node.textContent }));

    // One append past the cap: the oldest line drops, a new one arrives.
    rerender(<ConsoleLog lines={[...before.slice(1), line(MAX_LINES)]} />);

    const after = rowsOf();
    expect(after).toHaveLength(MAX_LINES);
    for (const { node, text } of original.slice(1)) {
      expect(after).toContain(node);
      expect(node.textContent).toBe(text);
    }
    expect(after[MAX_LINES - 1].textContent).toBe(`·line ${MAX_LINES}`);
  });
});
