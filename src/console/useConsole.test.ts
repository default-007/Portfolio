import { describe, it, expect } from 'vitest';
import { consoleReducer, MAX_LINES, type ConsoleState } from './useConsole';

const empty: ConsoleState = { lines: [], sound: false };

describe('consoleReducer', () => {
  it('echoes user input with the › mark in bone', () => {
    const next = consoleReducer(empty, { type: 'echo', text: 'help' });
    expect(next.lines).toEqual([
      { id: expect.any(Number), mark: '›', text: 'help', color: '#FBF7F1' },
    ]);
  });

  it('adds system replies with the · mark and the given colour', () => {
    const next = consoleReducer(empty, { type: 'say', text: 'routing', color: '#8FB877' });
    expect(next.lines).toEqual([
      { id: expect.any(Number), mark: '·', text: 'routing', color: '#8FB877' },
    ]);
  });

  it(`keeps only the last ${MAX_LINES} lines`, () => {
    let state = empty;
    for (let i = 0; i < 10; i++) {
      state = consoleReducer(state, { type: 'echo', text: `cmd${i}` });
    }
    expect(state.lines).toHaveLength(MAX_LINES);
    expect(state.lines[0].text).toBe('cmd4');
    expect(state.lines[MAX_LINES - 1].text).toBe('cmd9');
  });

  it('clear empties the buffer but preserves the sound setting', () => {
    const seeded: ConsoleState = {
      lines: [{ id: 0, mark: '·', text: 'x', color: '#fff' }],
      sound: true,
    };
    expect(consoleReducer(seeded, { type: 'clear' })).toEqual({ lines: [], sound: true });
  });

  it('toggleSound flips sound without touching the buffer', () => {
    const seeded: ConsoleState = {
      lines: [{ id: 0, mark: '·', text: 'x', color: '#fff' }],
      sound: false,
    };
    const on = consoleReducer(seeded, { type: 'toggleSound' });
    expect(on.sound).toBe(true);
    expect(on.lines).toBe(seeded.lines);
    expect(consoleReducer(on, { type: 'toggleSound' }).sound).toBe(false);
  });

  // ConsoleLog keys its rendered rows on line.id. If ids were assigned per
  // render position rather than at creation, every append past the cap would
  // renumber the surviving lines and React would rewrite all six nodes inside
  // the aria-live region.
  it('gives every appended line an id that stays with it as the buffer scrolls', () => {
    let state = empty;
    for (let i = 0; i < 10; i++) {
      state = consoleReducer(state, { type: 'echo', text: `cmd${i}` });
    }
    const ids = state.lines.map((l) => l.id);
    expect(new Set(ids).size).toBe(MAX_LINES);

    const after = consoleReducer(state, { type: 'echo', text: 'cmd10' });
    // The five lines that survive the cap keep the exact ids they had, so
    // React reuses their DOM nodes instead of rewriting them.
    expect(after.lines.slice(0, MAX_LINES - 1).map((l) => l.id)).toEqual(ids.slice(1));
    expect(ids).not.toContain(after.lines[MAX_LINES - 1].id);
  });

  it('does not mutate the previous state', () => {
    const next = consoleReducer(empty, { type: 'echo', text: 'a' });
    expect(empty.lines).toHaveLength(0);
    expect(next).not.toBe(empty);
  });
});
