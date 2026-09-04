import { describe, it, expect } from 'vitest';
import { parseCommand } from './commands';

describe('parseCommand', () => {
  it('ignores empty and whitespace-only input', () => {
    expect(parseCommand('')).toEqual({ kind: 'noop' });
    expect(parseCommand('   ')).toEqual({ kind: 'noop' });
  });

  it('is case- and whitespace-insensitive', () => {
    expect(parseCommand('  HELP  ')).toEqual(parseCommand('help'));
  });

  it('lists commands for help and ?', () => {
    const result = parseCommand('help');
    expect(result.kind).toBe('say');
    expect(parseCommand('?')).toEqual(result);
  });

  it('routes profile and open 01 to ch1', () => {
    expect(parseCommand('profile')).toEqual({
      kind: 'route', chapterId: 'ch1', label: 'flight profile',
    });
    expect(parseCommand('open 01')).toEqual(parseCommand('profile'));
  });

  it.each([
    ['open 02', 'ch2', 'cbc school management'],
    ['cbc', 'ch2', 'cbc school management'],
    ['open cbc', 'ch2', 'cbc school management'],
    ['open 03', 'ch3', 'waterwatch'],
    ['water', 'ch3', 'waterwatch'],
    ['waterwatch', 'ch3', 'waterwatch'],
    ['open 04', 'ch4', 'smart ticketing'],
    ['ticketing', 'ch4', 'smart ticketing'],
    ['tickets', 'ch4', 'smart ticketing'],
    ['checklist', 'ch5', 'checklist & incident'],
    ['open 05', 'ch5', 'checklist & incident'],
    ['incident', 'ch5', 'checklist & incident'],
    ['hire', 'ch6', 'clearance'],
    ['contact', 'ch6', 'clearance'],
    ['open 06', 'ch6', 'clearance'],
    ['top', 'ch0', 'arrival'],
    ['open 00', 'ch0', 'arrival'],
  ])('routes %s to %s', (input, chapterId, label) => {
    expect(parseCommand(input)).toEqual({ kind: 'route', chapterId, label });
  });

  it('answers whoami, ls and stats with prose', () => {
    for (const cmd of ['whoami', 'ls', 'stats']) {
      expect(parseCommand(cmd).kind).toBe('say');
    }
  });

  it('recognises the side-effect commands', () => {
    expect(parseCommand('clear')).toEqual({ kind: 'clear' });
    expect(parseCommand('sound')).toEqual({ kind: 'toggleSound' });
    expect(parseCommand('resume')).toEqual({ kind: 'openResume' });
  });

  it('reports unknown commands in the warning colour', () => {
    const result = parseCommand('launch');
    expect(result).toEqual({
      kind: 'say',
      text: 'unknown command: launch — try help',
      color: '#C0603A',
    });
  });
});
