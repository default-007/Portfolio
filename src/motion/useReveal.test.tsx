import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { useLayoutEffect, useRef } from 'react';

const { fromTo } = vi.hoisted(() => ({ fromTo: vi.fn() }));
vi.mock('gsap', () => ({
  gsap: {
    fromTo,
    set: vi.fn(),
    registerPlugin: vi.fn(),
    utils: { toArray: (sel: string) => Array.from(document.querySelectorAll(sel)) },
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { update: vi.fn() } }));
// The real useGSAP runs its callback in useIsomorphicLayoutEffect (a
// layout effect, scoping queries to committed DOM, and owning cleanup). We
// only care that the callback runs against a committed tree, so we mimic
// that timing with useLayoutEffect rather than invoking the callback
// mid-render, when the scope's children don't exist yet.
vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void) => { useLayoutEffect(fn); },
}));

import { useReveal } from './useReveal';

const Probe = () => {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  return <div ref={ref}><p data-anim="fade">hello</p></div>;
};

// Two separate parents, each with their own data-anim="check" rows — the
// design groups by parentElement (lines 628-640), so this must produce two
// independently-triggered groups rather than one group of three rows.
const CheckProbe = () => {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  return (
    <div ref={ref}>
      <div data-testid="group-a">
        <div data-anim="check">
          <span>✓</span>
          <p>a1</p>
        </div>
        <div data-anim="check">
          <span>✓</span>
          <p>a2</p>
        </div>
      </div>
      <div data-testid="group-b">
        <div data-anim="check">
          <span>→</span>
          <p>b1</p>
        </div>
      </div>
    </div>
  );
};


// One probe carrying every remaining data-anim family from spec §7, shaped
// like the real markup: the hero photo inside its section, auras as children
// of the element they drift against, bars, timeline rows, the occurrence
// report with its answer fields, two mockup screens with interior rows and
// vertical bars, and the stat tiles.
const FamiliesProbe = () => {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  return (
    <div ref={ref}>
      <section data-testid="hero-section">
        <div data-testid="aura-hero" data-anim="aura" />
        <div data-anim="hero-photo" data-testid="hero-photo">
          <img data-testid="hero-img" src="p.png" alt="portrait" />
        </div>
      </section>

      <section data-testid="profile-section">
        <div data-anim="leg" data-testid="leg-0">
          <span data-bar="1" data-testid="bar-0" />
        </div>
        <div data-anim="leg" data-testid="leg-1">
          <span data-bar="1" data-testid="bar-1" />
        </div>
        <div data-anim="stat" data-testid="stat-0">
          <div data-testid="stat-value-0">1</div>
          <div>label</div>
        </div>
        <div data-anim="stat" data-testid="stat-1">
          <div data-testid="stat-value-1">2</div>
          <div>label</div>
        </div>
      </section>

      <section>
        <div data-anim="report" data-testid="report">
          <div data-field="1" data-testid="field-0">a</div>
          <div data-field="1" data-testid="field-1">b</div>
        </div>
      </section>

      <section>
        <div data-anim="screen" data-testid="screen-0">
          <div data-row="1" data-testid="row-0" />
          <div data-row="1" data-testid="row-1" />
        </div>
        <div data-anim="screen" data-testid="screen-1">
          <div data-bar-v="1" data-testid="vbar-0" />
          <div data-bar-v="1" data-testid="vbar-1" />
        </div>
      </section>
    </div>
  );
};

const allowMotion = () =>
  vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);

// Every call whose target is exactly `target` (an element) or exactly the
// array `target` (order-sensitive, as the tweens build it).
const callsFor = (target: unknown) =>
  fromTo.mock.calls.filter(([t]) =>
    Array.isArray(target) && Array.isArray(t)
      ? t.length === target.length && t.every((el, i) => el === target[i])
      : t === target,
  );

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('useReveal', () => {
  it('registers no tweens when reduced motion is preferred', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
    render(<Probe />);
    expect(fromTo).not.toHaveBeenCalled();
  });

  it('animates from a visible-safe fromTo when motion is allowed', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
    render(<Probe />);
    expect(fromTo).toHaveBeenCalled();
    const [, , to] = fromTo.mock.calls[0];
    expect(to.immediateRender).toBe(false);
  });

  describe('data-anim="check" rows', () => {
    it('groups check rows by parentElement into separate tweens', () => {
      vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
      const { getByTestId } = render(<CheckProbe />);
      const groupA = getByTestId('group-a');
      const groupB = getByTestId('group-b');
      const rowsOf = (el: HTMLElement) => Array.from(el.querySelectorAll('[data-anim="check"]'));

      // One call whose target array is exactly group A's two rows, and a
      // separate call whose target array is exactly group B's one row —
      // never a single call mixing rows from both parents.
      const rowTweenTargets = fromTo.mock.calls
        .map(([target]) => target)
        .filter((target) => Array.isArray(target) && target[0]?.getAttribute?.('data-anim') === 'check');

      expect(rowTweenTargets).toContainEqual(rowsOf(groupA));
      expect(rowTweenTargets).toContainEqual(rowsOf(groupB));
      expect(rowTweenTargets).not.toContainEqual([...rowsOf(groupA), ...rowsOf(groupB)]);
    });

    it('pops each row\'s first child (the glyph) with its own fromTo, immediateRender false', () => {
      vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
      const { getByTestId } = render(<CheckProbe />);
      const groupA = getByTestId('group-a');
      const glyphsA = Array.from(groupA.querySelectorAll('[data-anim="check"]')).map(
        (row) => row.firstElementChild,
      );

      const glyphCall = fromTo.mock.calls.find(
        ([target]) => Array.isArray(target) && target[0] === glyphsA[0],
      );
      expect(glyphCall).toBeDefined();
      const [, from, to] = glyphCall!;
      expect(from).toMatchObject({ scale: 0.2, opacity: 0 });
      expect(to.immediateRender).toBe(false);
    });

    // The bug this guards against shipped once: omitting `trigger` looks like
    // it defers to the tween's first target, but GSAP resolves it to null and
    // ScrollTrigger's position math then substitutes document.body, whose top
    // never moves — so `top 92%` fires at scroll position 0 and the rows are
    // already revealed before the reader reaches them. Every assertion above
    // passes either way, because none of them read scrollTrigger.
    it('triggers each group on its own first row, never on an implicit default', () => {
      vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
      const { getByTestId } = render(<CheckProbe />);
      const rowsOf = (el: HTMLElement) =>
        Array.from(el.querySelectorAll('[data-anim="check"]'));

      for (const id of ['group-a', 'group-b']) {
        const rows = rowsOf(getByTestId(id));
        const calls = fromTo.mock.calls.filter(
          ([target]) => Array.isArray(target) && (target[0] === rows[0] || target[0] === rows[0].firstElementChild),
        );
        // Both the row tween and the glyph tween for this group.
        expect(calls).toHaveLength(2);
        for (const [, , to] of calls) {
          expect(to.scrollTrigger.trigger).toBe(rows[0]);
          expect(to.scrollTrigger.start).toBe('top 92%');
        }
      }
    });

    it('registers no check tweens when reduced motion is preferred', () => {
      vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
      render(<CheckProbe />);
      expect(fromTo).not.toHaveBeenCalled();
    });
  });
  // Spec §7's effects inventory. Each family was marked in the markup and
  // wired to nothing; the assertions below name the design's own values, and
  // in particular assert scrollTrigger.trigger and start explicitly — an
  // omitted trigger resolves to null, ScrollTrigger substitutes document.body
  // whose top never moves, and the reveal fires at scroll position 0. jsdom
  // reports an all-zero getBoundingClientRect, so nothing else in a test
  // environment can tell those apart.
  describe('spec §7 effect families', () => {
    it('registers none of them when reduced motion is preferred', () => {
      vi.stubGlobal('matchMedia', () => ({ matches: true }) as MediaQueryList);
      render(<FamiliesProbe />);
      expect(fromTo).not.toHaveBeenCalled();
    });

    it('scales the hero photo in, and parallaxes its img against its own section', () => {
      allowMotion();
      const { getByTestId } = render(<FamiliesProbe />);

      const [, introFrom, introTo] = callsFor(getByTestId('hero-photo'))[0]!;
      expect(introFrom).toMatchObject({ opacity: 0, scale: 1.06 });
      expect(introTo).toMatchObject({ opacity: 1, scale: 1, duration: 1.5, ease: 'power2.out' });
      expect(introTo.immediateRender).toBe(false);
      // The intro is not scroll-driven in the design — it plays on load.
      expect(introTo.scrollTrigger).toBeUndefined();

      const [, , imgTo] = callsFor(getByTestId('hero-img'))[0]!;
      expect(imgTo).toMatchObject({ yPercent: -8, ease: 'none', immediateRender: false });
      expect(imgTo.scrollTrigger.trigger).toBe(getByTestId('hero-section'));
      expect(imgTo.scrollTrigger.start).toBe('top top');
      expect(imgTo.scrollTrigger.end).toBe('bottom top');
      expect(imgTo.scrollTrigger.scrub).toBe(true);
    });

    it('scrubs each aura against its parent chapter, not against the aura', () => {
      allowMotion();
      const { getByTestId } = render(<FamiliesProbe />);
      const aura = getByTestId('aura-hero');

      const [, , to] = callsFor(aura)[0]!;
      expect(to).toMatchObject({ yPercent: 16, opacity: 0.45, ease: 'none' });
      expect(to.immediateRender).toBe(false);
      expect(to.scrollTrigger.trigger).toBe(getByTestId('hero-section'));
      expect(to.scrollTrigger.start).toBe('top top');
      expect(to.scrollTrigger.end).toBe('bottom top');
      expect(to.scrollTrigger.scrub).toBe(0.6);
    });

    it('deploys the Gantt bars left to right in one staggered tween', () => {
      allowMotion();
      const { getByTestId } = render(<FamiliesProbe />);
      const bars = [getByTestId('bar-0'), getByTestId('bar-1')];

      const [, from, to] = callsFor(bars)[0]!;
      expect(from).toMatchObject({ scaleX: 0 });
      expect(to).toMatchObject({ scaleX: 1, duration: 0.9, stagger: 0.09, ease: 'expo.out' });
      expect(to.immediateRender).toBe(false);
      expect(to.scrollTrigger.trigger).toBe(bars[0]);
      expect(to.scrollTrigger.start).toBe('top 85%');
    });

    it('reveals each timeline leg on its own row', () => {
      allowMotion();
      const { getByTestId } = render(<FamiliesProbe />);

      for (const id of ['leg-0', 'leg-1']) {
        const leg = getByTestId(id);
        const calls = callsFor(leg);
        expect(calls).toHaveLength(1);
        const [, from, to] = calls[0]!;
        expect(from).toMatchObject({ opacity: 0, x: -14 });
        expect(to).toMatchObject({ opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' });
        expect(to.immediateRender).toBe(false);
        expect(to.scrollTrigger.trigger).toBe(leg);
        expect(to.scrollTrigger.start).toBe('top 92%');
      }
    });

    it('grows the dispatch chart bars from their bottom origin', () => {
      allowMotion();
      const { getByTestId } = render(<FamiliesProbe />);
      const vbars = [getByTestId('vbar-0'), getByTestId('vbar-1')];

      const [, from, to] = callsFor(vbars)[0]!;
      expect(from).toMatchObject({ scaleY: 0 });
      expect(to).toMatchObject({ scaleY: 1, duration: 0.7, stagger: 0.04, ease: 'expo.out' });
      expect(to.immediateRender).toBe(false);
      expect(to.scrollTrigger.trigger).toBe(vbars[0]);
      expect(to.scrollTrigger.start).toBe('top 88%');
    });

    it('reveals the occurrence report, then staggers its answer fields on the report', () => {
      allowMotion();
      const { getByTestId } = render(<FamiliesProbe />);
      const report = getByTestId('report');
      const fields = [getByTestId('field-0'), getByTestId('field-1')];

      const [, reportFrom, reportTo] = callsFor(report)[0]!;
      expect(reportFrom).toMatchObject({ opacity: 0, y: 26 });
      expect(reportTo).toMatchObject({ opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' });
      expect(reportTo.immediateRender).toBe(false);
      expect(reportTo.scrollTrigger.trigger).toBe(report);
      expect(reportTo.scrollTrigger.start).toBe('top 88%');

      const [, fieldFrom, fieldTo] = callsFor(fields)[0]!;
      expect(fieldFrom).toMatchObject({ opacity: 0, x: 12 });
      expect(fieldTo).toMatchObject({ opacity: 1, x: 0, duration: 0.5, stagger: 0.09 });
      expect(fieldTo.immediateRender).toBe(false);
      // The fields ride the report's trigger, not their own boxes.
      expect(fieldTo.scrollTrigger.trigger).toBe(report);
      expect(fieldTo.scrollTrigger.start).toBe('top 84%');
    });

    it('lands each mockup screen with perspective, drifts it on scrub, and stages its rows', () => {
      allowMotion();
      const { getByTestId } = render(<FamiliesProbe />);
      const screen = getByTestId('screen-0');
      const calls = callsFor(screen);
      expect(calls).toHaveLength(2);

      const [, arrivalFrom, arrivalTo] = calls.find(([, , to]) => !to.scrollTrigger.scrub)!;
      expect(arrivalFrom).toMatchObject({
        opacity: 0,
        y: 46,
        rotateX: 7,
        scale: 0.97,
        transformPerspective: 1400,
      });
      expect(arrivalTo).toMatchObject({ opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1.1 });
      expect(arrivalTo.immediateRender).toBe(false);
      expect(arrivalTo.scrollTrigger.trigger).toBe(screen);
      expect(arrivalTo.scrollTrigger.start).toBe('top 86%');

      const [, driftFrom, driftTo] = calls.find(([, , to]) => to.scrollTrigger.scrub)!;
      expect(driftFrom).toMatchObject({ yPercent: 3 });
      expect(driftTo).toMatchObject({ yPercent: -3, ease: 'none', immediateRender: false });
      expect(driftTo.scrollTrigger.trigger).toBe(screen);
      expect(driftTo.scrollTrigger.start).toBe('top bottom');
      expect(driftTo.scrollTrigger.end).toBe('bottom top');
      expect(driftTo.scrollTrigger.scrub).toBe(0.8);
      // The drift shares its target with the arrival tween, so it must not
      // carry overwrite:'auto' — that would kill the arrival on creation.
      expect(driftTo.overwrite).toBeUndefined();

      const rows = [getByTestId('row-0'), getByTestId('row-1')];
      const [, rowFrom, rowTo] = callsFor(rows)[0]!;
      expect(rowFrom).toMatchObject({ opacity: 0, x: 16 });
      expect(rowTo).toMatchObject({ opacity: 1, x: 0, duration: 0.5, stagger: 0.07 });
      expect(rowTo.immediateRender).toBe(false);
      expect(rowTo.scrollTrigger.trigger).toBe(screen);
      expect(rowTo.scrollTrigger.start).toBe('top 80%');
    });

    it('rolls the stat values up, triggered on the first tile', () => {
      allowMotion();
      const { getByTestId } = render(<FamiliesProbe />);
      const values = [getByTestId('stat-value-0'), getByTestId('stat-value-1')];

      const [, from, to] = callsFor(values)[0]!;
      expect(from).toMatchObject({ yPercent: 40, opacity: 0 });
      expect(to).toMatchObject({ yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.08 });
      expect(to.immediateRender).toBe(false);
      expect(to.scrollTrigger.trigger).toBe(getByTestId('stat-0'));
      expect(to.scrollTrigger.start).toBe('top 88%');
    });
  });
});
