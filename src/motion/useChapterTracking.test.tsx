import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';

type TriggerConfig = {
  trigger: unknown;
  start: string;
  end: string;
  onUpdate?: (self: { progress: number }) => void;
  onToggle?: (self: { isActive: boolean }) => void;
};

type TriggerInstance = { kill: ReturnType<typeof vi.fn>; config: TriggerConfig };

const { created, createMock } = vi.hoisted(() => {
  const created: TriggerInstance[] = [];
  const createMock = vi.fn((config: TriggerConfig): TriggerInstance => {
    const instance: TriggerInstance = { kill: vi.fn(), config };
    created.push(instance);
    return instance;
  });
  return { created, createMock };
});

vi.mock('gsap', () => ({ gsap: { registerPlugin: vi.fn() } }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { create: createMock } }));

import { useChapterTracking } from './useChapterTracking';
import { CHAPTER_IDS } from '../data/chapters';

// Two chapter sections in the DOM alongside the hook, so the hook's
// `document.querySelectorAll('section[data-chapter]')` has something to find.
function Wrapper({ children }: { children: ReactNode }) {
  return (
    <div>
      <section id={CHAPTER_IDS[0]} data-chapter="00 · Arrival" />
      <section id={CHAPTER_IDS[1]} data-chapter="01 · Flight profile" />
      {children}
    </div>
  );
}

beforeEach(() => {
  created.length = 0;
  createMock.mockClear();
});

describe('useChapterTracking', () => {
  it('starts with the first chapter active and zero progress before any scroll', () => {
    const { result } = renderHook(() => useChapterTracking(), { wrapper: Wrapper });
    expect(result.current.activeId).toBe(CHAPTER_IDS[0]);
    expect(result.current.progress).toBe(0);
  });

  it('creates one trigger per section[data-chapter] plus one page-level progress trigger', () => {
    renderHook(() => useChapterTracking(), { wrapper: Wrapper });
    // Wrapper renders 2 chapter sections, so we expect 2 + 1 page trigger.
    expect(created).toHaveLength(3);
    expect(created.filter((t) => t.config.start === 'top 55%')).toHaveLength(2);
    expect(created.filter((t) => t.config.start === 'top top')).toHaveLength(1);
  });

  it('kills every ScrollTrigger it created, and only those, on unmount', () => {
    const { unmount } = renderHook(() => useChapterTracking(), { wrapper: Wrapper });
    const createdForThisRender = [...created];
    expect(createdForThisRender.length).toBeGreaterThan(0);

    unmount();

    createdForThisRender.forEach((trigger) => {
      expect(trigger.kill).toHaveBeenCalledTimes(1);
    });
  });

  it('sets progress from the page-level trigger onUpdate', () => {
    const { result } = renderHook(() => useChapterTracking(), { wrapper: Wrapper });
    const pageTrigger = created.find((t) => t.config.start === 'top top')!;

    act(() => pageTrigger.config.onUpdate?.({ progress: 0.42 }));

    expect(result.current.progress).toBe(0.42);
  });

  it('sets activeId to the section id only when its trigger becomes active', () => {
    const { result } = renderHook(() => useChapterTracking(), { wrapper: Wrapper });
    const secondChapterTrigger = created.find(
      (t) => (t.config.trigger as HTMLElement).id === CHAPTER_IDS[1],
    )!;

    act(() => secondChapterTrigger.config.onToggle?.({ isActive: false }));
    expect(result.current.activeId).toBe(CHAPTER_IDS[0]);

    act(() => secondChapterTrigger.config.onToggle?.({ isActive: true }));
    expect(result.current.activeId).toBe(CHAPTER_IDS[1]);
  });
});
