import { HeroActions } from "../parts/HeroActions";
import { HeroContainer } from "../parts/HeroContainer";
import { HeroSection } from "../parts/HeroSection";
import { ReadableBand } from "../parts/ReadableBand";
import { useHeroCopy } from "../parts/useHeroCopy";
import { Terminal } from "../terminal/Terminal";

/** T4 — placeholder, replaced in the fan-out. */
export const HeroT4 = () => {
  const { common, terminal, copy } = useHeroCopy(4);

  return (
    <HeroSection>
      <HeroContainer>
        <ReadableBand common={common} copy={copy} />
        <div className="mt-10">
          <Terminal copy={terminal} />
        </div>
        <HeroActions common={common} />
      </HeroContainer>
    </HeroSection>
  );
};
