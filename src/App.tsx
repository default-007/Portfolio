import { useRef, type ComponentType } from 'react';
import { Grain } from './components/atmosphere/Grain';
import { Vignette } from './components/atmosphere/Vignette';
import { Spotlight } from './components/atmosphere/Spotlight';
import { StatusStrip } from './components/hud/StatusStrip';
import { AltitudeLadder } from './components/hud/AltitudeLadder';
import { CornerBrackets } from './components/hud/CornerBrackets';
import { Console } from './console/Console';
import { Arrival } from './components/chapters/Arrival';
import { FlightProfile } from './components/chapters/FlightProfile';
import { CaseStudy } from './components/chapters/CaseStudy';
import { CompetencySheet } from './components/chapters/mockups/CompetencySheet';
import { TriageQueue } from './components/chapters/mockups/TriageQueue';
import { TicketQueuePhone } from './components/chapters/mockups/TicketQueuePhone';
import { Checklist } from './components/chapters/Checklist';
import { Clearance } from './components/chapters/Clearance';
import { useSmoothScroll } from './motion/useSmoothScroll';
import { useReveal } from './motion/useReveal';
import { useChapterTracking } from './motion/useChapterTracking';
import { PROJECTS, type Project } from './data/projects';
import { CHAPTERS } from './data/chapters';

// Typed against PROJECTS' own id union rather than left inferred: a project
// added to PROJECTS without a mockup here is then a compile error instead of
// an `undefined` component that only fails when that chapter renders.
const MOCKUPS: Record<Project['id'], ComponentType> = {
  ch2: CompetencySheet,
  ch3: TriageQueue,
  ch4: TicketQueuePhone,
};

export default function App() {
  const scope = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();
  const { activeId, progress } = useChapterTracking();
  useReveal(scope);

  const activeLabel =
    CHAPTERS.find((c) => c.id === activeId)?.hudLabel ?? CHAPTERS[0].hudLabel;

  return (
    <div ref={scope} className="relative bg-deck text-body">
      <Grain />
      <Spotlight />
      <Vignette />
      <StatusStrip activeChapterLabel={activeLabel} />
      <AltitudeLadder progress={progress} />
      <CornerBrackets />

      <Arrival />
      <FlightProfile />
      {PROJECTS.map((project) => {
        const Mockup = MOCKUPS[project.id];
        return (
          <CaseStudy key={project.id} project={project}>
            <Mockup />
          </CaseStudy>
        );
      })}
      <Checklist />
      <Clearance />

      <Console onRoute={scrollTo} activeId={activeId} />
    </div>
  );
}
