import { useRef, type ReactNode } from 'react';
import { useSplitText } from '../../motion/useSplitText';
import { CHAPTERS } from '../../data/chapters';
import { PROJECTS, type Project } from '../../data/projects';

// Leg-label accent colour per chapter (design source
// portfolio-v5-flight-deck.dc.html lines 124, 203, 222): ch2 uses rust and
// ch3 uses go, both existing @theme tokens. ch4's #8A9FB8 has no token, but
// it is the exact hex already used as a raw literal for the "Product" leg
// gradient in src/data/experience.ts, so it is applied the same way here
// rather than inventing a new token for a single one-off accent. Project
// carries no accent field (Task 4's interface is fixed), so this is keyed
// on the chapter's own immutable id.
const LEG_ACCENT_CLASS: Partial<Record<Project['id'], string>> = {
  ch2: 'text-rust',
  ch3: 'text-go',
};
const LEG_ACCENT_HEX: Partial<Record<Project['id'], string>> = {
  ch4: '#8A9FB8',
};

// Ported from design source (portfolio-v5-flight-deck.dc.html lines
// 123-239): the shared shell every case-study chapter (ch2, ch3, ch4)
// renders inside. Section id/data attributes come from CHAPTERS, not
// literals, and only the middle case study (ch3) carries the raised
// background — the design alternates it rather than painting all three
// identically, so it is derived from the project's position in PROJECTS.
export function CaseStudy({
  project,
  children,
}: {
  project: Project;
  children: ReactNode;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useSplitText(headingRef);

  const chapter = CHAPTERS.find((c) => c.id === project.id)!;
  const index = PROJECTS.findIndex((p) => p.id === project.id);
  const raised = index % 2 === 1;

  const text = (
    <div>
      <div
        data-anim="fade"
        className={`mb-5 font-mono text-[10.5px] uppercase tracking-[0.18em] ${
          LEG_ACCENT_CLASS[project.id] ?? ''
        }`}
        style={LEG_ACCENT_HEX[project.id] ? { color: LEG_ACCENT_HEX[project.id] } : undefined}
      >
        {project.leg}
      </div>

      <h3
        ref={headingRef}
        data-split="1"
        className="m-0 mb-5 font-display text-[clamp(32px,4.6vw,72px)] font-extralight leading-none tracking-[-0.03em] text-bone"
      >
        {project.title}
      </h3>

      <p
        data-anim="fade"
        className="m-0 mb-[26px] max-w-[500px] text-[16.5px] leading-[1.65] text-muted [text-wrap:pretty]"
      >
        {project.lede}
      </p>

      <div className="flex flex-col gap-[11px]">
        {project.points.map((point) => (
          <div
            key={point}
            data-anim="check"
            className="grid grid-cols-[18px_1fr] items-start gap-[11px]"
          >
            <span className="font-mono text-[13px] text-go">✓</span>
            <p className="m-0 text-[14.5px] leading-[1.55] text-dim-0">{point}</p>
          </div>
        ))}
        <div data-anim="check" className="grid grid-cols-[18px_1fr] items-start gap-[11px]">
          <span className="font-mono text-[13px] text-ember">→</span>
          <p className="m-0 text-[14.5px] font-medium leading-[1.55] text-bone">
            {project.outcome}
          </p>
        </div>
      </div>
    </div>
  );

  const mockup = <div className="max-w-full overflow-x-auto overflow-y-hidden py-1.5">{children}</div>;

  return (
    <section
      id={project.id}
      data-chapter={chapter.hudLabel}
      data-screen-label={chapter.screenLabel}
      className={`relative grid min-h-screen items-center gap-12 border-b border-body/10 pb-[120px] pl-[76px] pr-10 pt-[78px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr))]${
        raised ? ' bg-deck-raised' : ''
      }`}
    >
      {project.textSide === 'right' ? (
        <>
          {mockup}
          {text}
        </>
      ) : (
        <>
          {text}
          {mockup}
        </>
      )}
    </section>
  );
}
