import { describe, it, expect } from 'vitest';
import { consoleReducer, MAX_LINES, type ConsoleState } from './useConsole';

const empty: ConsoleState = { lines: [], sound: false };

describe('consoleReducer', () => {
  it('echoes user input with the › mark in bone', () => {
    const next = consoleReducer(empty, { type: 'echo', text: 'help' });
    expect(next.lines).toEqual([{ mark: '›', text: 'help', color: '#FBF7F1' }]);
  });

  it('adds system replies with the · mark and the given colour', () => {
    const next = consoleReducer(empty, { type: 'say', text: 'routing', color: '#8FB877' });
    expect(next.lines).toEqual([{ mark: '·', text: 'routing', color: '#8FB877' }]);
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
      lines: [{ mark: '·', text: 'x', color: '#fff' }],
      sound: true,
    };
    expect(consoleReducer(seeded, { type: 'clear' })).toEqual({ lines: [], sound: true });
  });

  it('toggleSound flips sound without touching the buffer', () => {
    const seeded: ConsoleState = {
      lines: [{ mark: '·', text: 'x', color: '#fff' }],
      sound: false,
    };
    const on = consoleReducer(seeded, { type: 'toggleSound' });
    expect(on.sound).toBe(true);
    expect(on.lines).toBe(seeded.lines);
    expect(consoleReducer(on, { type: 'toggleSound' }).sound).toBe(false);
  });

  it('does not mutate the previous state', () => {
    const next = consoleReducer(empty, { type: 'echo', text: 'a' });
    expect(empty.lines).toHaveLength(0);
    expect(next).not.toBe(empty);
  });
});
