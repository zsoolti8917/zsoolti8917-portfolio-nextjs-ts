import { HeroActions } from "../parts/HeroActions";
import { HeroContainer } from "../parts/HeroContainer";
import { HeroSection } from "../parts/HeroSection";
import { ReadableBand } from "../parts/ReadableBand";
import { StatusPill } from "../parts/StatusPill";
import { useHeroCopy } from "../parts/useHeroCopy";
import { SplitExplorer } from "./t4/SplitExplorer";

/**
 * T4 — Split explorer.
 *
 * A two-pane reader, not a shell: the full verb set is parked in a permanent
 * left rail and the output gets the room it needs to be read rather than
 * skimmed. Someone who never types a character can still reach every line of
 * the CV, because every route is a labelled button that is already on screen.
 *
 * The readable band and the first output block are ordinary server-rendered
 * markup, so the name, role and summary are legible with no JavaScript at all.
 */
export const HeroT4 = () => {
  const { common, terminal, copy } = useHeroCopy(4);

  return (
    <HeroSection>
      <HeroContainer>
        <ReadableBand common={common} copy={copy} />
        <StatusPill common={common} className="mt-6" />
        <div className="mt-8">
          <SplitExplorer copy={terminal} />
        </div>
        <HeroActions common={common} />
      </HeroContainer>
    </HeroSection>
  );
};
