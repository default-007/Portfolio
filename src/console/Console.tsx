import { useCallback, useEffect, useRef, type FormEvent } from 'react';
import { useConsole } from './useConsole';
import { ConsoleLog } from './ConsoleLog';
import { CHAPTER_IDS } from '../data/chapters';

type WebkitWindow = typeof window & { webkitAudioContext?: typeof AudioContext };

const CHIP_CLASS =
  'appearance-none whitespace-nowrap border border-body/16 bg-transparent px-[10px] py-[6px] font-mono text-[10px] uppercase tracking-[0.12em] text-dim-1 hover:border-ember/50 hover:text-ember';

// Ported from design source (portfolio-v5-flight-deck.dc.html lines 53-72):
// a command line fixed to the bottom of every screen, above the HUD chrome
// (z-[62] to the HUD's z-[60]). Scrollback sits above one input row — a
// rust "DECK ›" prompt, a bare mono input, and four quick-run chips.
// Unlike the HUD this is a real control, so it is never aria-hidden.
//
// Keyboard handling (lines 361-375): "/" focuses the input from anywhere
// that isn't already a text field, and j/k jump CHAPTER_IDS forward/back,
// clamped at both ends. The optional WebAudio blips (lines 317-327) build
// no AudioContext until sound is switched on.
//
// This component does not call useSmoothScroll itself — it only ever
// invokes the `onRoute` prop, which the page composing Console is expected
// to wire to useSmoothScroll's `scrollTo`. That keeps Console mountable in
// isolation (as the brief's own tests do) without constructing a real
// Lenis instance per test.
export function Console({ onRoute }: { onRoute: (chapterId: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeIndexRef = useRef(0);
  const soundRef = useRef(false);

  const handleRoute = useCallback(
    (id: string) => {
      const idx = CHAPTER_IDS.indexOf(id);
      if (idx !== -1) activeIndexRef.current = idx;
      onRoute(id);
    },
    [onRoute],
  );

  const { lines, sound, submit } = useConsole(handleRoute);

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  const blip = useCallback((freq: number) => {
    if (!soundRef.current) return;
    try {
      const Ctx = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      const ac = audioCtxRef.current;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.05, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.13);
      o.connect(g).connect(ac.destination);
      o.start();
      o.stop(ac.currentTime + 0.14);
    } catch {
      /* audio blocked */
    }
  }, []);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if (typing) return;
      if (e.key === 'j' || e.key === 'k') {
        const cur = activeIndexRef.current;
        const next = Math.min(
          CHAPTER_IDS.length - 1,
          Math.max(0, cur + (e.key === 'j' ? 1 : -1)),
        );
        activeIndexRef.current = next;
        handleRoute(CHAPTER_IDS[next]);
        blip(e.key === 'j' ? 560 : 700);
      }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleRoute, blip]);

  const runChip = (cmd: string) => {
    submit(cmd);
    blip(720);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = inputRef.current?.value ?? '';
    if (inputRef.current) inputRef.current.value = '';
    submit(value);
    blip(720);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[62] border-t border-body/14"
      style={{ background: 'linear-gradient(0deg, rgba(10,8,7,0.97), rgba(10,8,7,0.82))' }}
    >
      <ConsoleLog lines={lines} />
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-[11px] border-t border-body/7 px-[18px] pb-[13px] pt-[12px]"
      >
        <span className="flex-none font-mono text-[12px] text-rust">DECK ›</span>
        <input
          ref={inputRef}
          aria-label="Flight deck command line"
          placeholder="type help — or press / anywhere"
          className="min-w-[60px] flex-1 appearance-none border-none bg-transparent p-0 font-mono text-[13px] text-bone caret-ember outline-none"
        />
        <div className="flex flex-none flex-nowrap gap-[6px] overflow-hidden">
          <button type="button" onClick={() => runChip('help')} className={CHIP_CLASS}>
            help
          </button>
          <button type="button" onClick={() => runChip('profile')} className={CHIP_CLASS}>
            profile
          </button>
          <button type="button" onClick={() => runChip('hire')} className={CHIP_CLASS}>
            hire
          </button>
          <button type="button" onClick={() => submit('sound')} className={CHIP_CLASS}>
            snd {sound ? 'on' : 'off'}
          </button>
        </div>
      </form>
    </div>
  );
}
