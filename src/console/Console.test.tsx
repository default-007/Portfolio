import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Console } from './Console';
import { CHAPTER_IDS } from '../data/chapters';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Console', () => {
  it('echoes input and prints the reply', async () => {
    const user = userEvent.setup();
    render(<Console onRoute={vi.fn()} />);
    await user.type(screen.getByLabelText('Flight deck command line'), 'whoami{Enter}');
    expect(screen.getByText('whoami')).toBeInTheDocument();
    expect(screen.getByText(/full-stack engineer, nairobi/)).toBeInTheDocument();
  });

  it('routes on a navigation command', async () => {
    const user = userEvent.setup();
    const onRoute = vi.fn();
    render(<Console onRoute={onRoute} />);
    await user.type(screen.getByLabelText('Flight deck command line'), 'open 03{Enter}');
    expect(onRoute).toHaveBeenCalledWith('ch3');
  });

  it('clears the input after submit', async () => {
    const user = userEvent.setup();
    render(<Console onRoute={vi.fn()} />);
    const input = screen.getByLabelText('Flight deck command line') as HTMLInputElement;
    await user.type(input, 'help{Enter}');
    expect(input.value).toBe('');
  });

  it('runs the command on a quick-chip click', async () => {
    const user = userEvent.setup();
    const onRoute = vi.fn();
    render(<Console onRoute={onRoute} />);
    await user.click(screen.getByRole('button', { name: /hire/i }));
    expect(onRoute).toHaveBeenCalledWith('ch6');
  });

  it('focuses the input when / is pressed outside a field', async () => {
    const user = userEvent.setup();
    render(<Console onRoute={vi.fn()} />);
    await user.keyboard('/');
    expect(screen.getByLabelText('Flight deck command line')).toHaveFocus();
  });

  // --- Beyond the brief -----------------------------------------------

  describe('hook-composed copy (untested since Task 3)', () => {
    it('prints the routing line composed by useConsole, not the parser', async () => {
      const user = userEvent.setup();
      render(<Console onRoute={vi.fn()} />);
      await user.type(screen.getByLabelText('Flight deck command line'), 'hire{Enter}');
      expect(screen.getByText('routing to clearance')).toBeInTheDocument();
    });

    it('prints the sound-on then sound-off lines composed by useConsole', async () => {
      const user = userEvent.setup();
      render(<Console onRoute={vi.fn()} />);
      const input = screen.getByLabelText('Flight deck command line');
      await user.type(input, 'sound{Enter}');
      expect(screen.getByText('sound on')).toBeInTheDocument();
      await user.type(input, 'sound{Enter}');
      expect(screen.getByText('sound off')).toBeInTheDocument();
    });

    it('prints the résumé line composed by useConsole', async () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      const user = userEvent.setup();
      render(<Console onRoute={vi.fn()} />);
      await user.type(screen.getByLabelText('Flight deck command line'), 'resume{Enter}');
      expect(screen.getByText('opening résumé')).toBeInTheDocument();
      expect(openSpy).toHaveBeenCalledWith('./resume.html', '_blank', 'noopener');
    });
  });

  describe('j/k chapter jumping', () => {
    it('j moves forward through CHAPTER_IDS and clamps at the last chapter', async () => {
      const user = userEvent.setup();
      const onRoute = vi.fn();
      render(<Console onRoute={onRoute} />);

      const last = CHAPTER_IDS[CHAPTER_IDS.length - 1];
      for (let i = 1; i < CHAPTER_IDS.length; i++) {
        await user.keyboard('j');
        expect(onRoute).toHaveBeenNthCalledWith(i, CHAPTER_IDS[i]);
      }
      expect(onRoute).toHaveBeenLastCalledWith(last);

      onRoute.mockClear();
      // One more j at the last chapter must not go past the end or wrap.
      await user.keyboard('j');
      expect(onRoute).toHaveBeenCalledTimes(1);
      expect(onRoute).toHaveBeenCalledWith(last);
    });

    it('k at the first chapter clamps to ch0 and never wraps or routes past it', async () => {
      const user = userEvent.setup();
      const onRoute = vi.fn();
      render(<Console onRoute={onRoute} />);

      await user.keyboard('k');
      expect(onRoute).toHaveBeenCalledTimes(1);
      expect(onRoute).toHaveBeenCalledWith(CHAPTER_IDS[0]);

      onRoute.mockClear();
      await user.keyboard('k');
      expect(onRoute).toHaveBeenCalledTimes(1);
      expect(onRoute).toHaveBeenCalledWith(CHAPTER_IDS[0]);
    });
  });

  it('does not hijack / when a text field already has focus', async () => {
    const user = userEvent.setup();
    render(<Console onRoute={vi.fn()} />);
    const input = screen.getByLabelText('Flight deck command line') as HTMLInputElement;
    await user.click(input);
    await user.keyboard('/');
    expect(input.value).toBe('/');
  });

  describe('optional WebAudio blips', () => {
    it('constructs no AudioContext until sound is switched on', async () => {
      const oscillator = { type: '', frequency: { value: 0 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
      const gainNode = {
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      };
      oscillator.connect.mockReturnValue(gainNode);
      const audioCtxInstance = {
        currentTime: 0,
        destination: {},
        createOscillator: vi.fn(() => oscillator),
        createGain: vi.fn(() => gainNode),
      };
      const AudioContextMock = vi.fn(() => audioCtxInstance);
      vi.stubGlobal('AudioContext', AudioContextMock);

      const user = userEvent.setup();
      render(<Console onRoute={vi.fn()} />);
      expect(AudioContextMock).not.toHaveBeenCalled();

      // Running a command with sound still off must not build an AudioContext.
      await user.type(screen.getByLabelText('Flight deck command line'), 'help{Enter}');
      expect(AudioContextMock).not.toHaveBeenCalled();

      // Switching sound on, then running a command, does build one.
      await user.click(screen.getByRole('button', { name: /snd off/i }));
      await user.type(screen.getByLabelText('Flight deck command line'), 'help{Enter}');
      expect(AudioContextMock).toHaveBeenCalledTimes(1);
    });
  });

  it('removes the keydown listener it added on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<Console onRoute={vi.fn()} />);

    const added = addSpy.mock.calls.find((call) => call[0] === 'keydown');
    expect(added).toBeDefined();
    const handler = added?.[1];

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', handler);
  });
});
