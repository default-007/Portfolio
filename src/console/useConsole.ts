import { useCallback, useReducer } from 'react';
import { parseCommand } from './commands';

export const MAX_LINES = 6;

export type ConsoleLine = { mark: '·' | '›'; text: string; color: string };
export type ConsoleState = { lines: ConsoleLine[]; sound: boolean };

export type ConsoleAction =
  | { type: 'echo'; text: string }
  | { type: 'say'; text: string; color: string }
  | { type: 'clear' }
  | { type: 'toggleSound' };

const append = (state: ConsoleState, line: ConsoleLine): ConsoleState => ({
  ...state,
  lines: state.lines.concat(line).slice(-MAX_LINES),
});

export function consoleReducer(state: ConsoleState, action: ConsoleAction): ConsoleState {
  switch (action.type) {
    case 'echo':
      return append(state, { mark: '›', text: action.text, color: '#FBF7F1' });
    case 'say':
      return append(state, { mark: '·', text: action.text, color: action.color });
    case 'clear':
      return { ...state, lines: [] };
    case 'toggleSound':
      return { ...state, sound: !state.sound };
  }
}

export function useConsole(onRoute: (chapterId: string) => void) {
  const [state, dispatch] = useReducer(consoleReducer, { lines: [], sound: false });

  const submit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      dispatch({ type: 'echo', text: trimmed.toLowerCase() });

      const result = parseCommand(trimmed);
      switch (result.kind) {
        case 'say':
          dispatch({ type: 'say', text: result.text, color: result.color });
          break;
        case 'route':
          onRoute(result.chapterId);
          dispatch({ type: 'say', text: `routing to ${result.label}`, color: '#8FB877' });
          break;
        case 'clear':
          dispatch({ type: 'clear' });
          break;
        case 'toggleSound':
          dispatch({ type: 'toggleSound' });
          dispatch({
            type: 'say',
            text: `sound ${!state.sound ? 'on' : 'off'}`,
            color: '#E8A33D',
          });
          break;
        case 'openResume':
          window.open('./resume.html', '_blank', 'noopener');
          dispatch({ type: 'say', text: 'opening résumé', color: '#8FB877' });
          break;
        case 'noop':
          break;
      }
    },
    [onRoute, state.sound],
  );

  return { ...state, submit };
}
