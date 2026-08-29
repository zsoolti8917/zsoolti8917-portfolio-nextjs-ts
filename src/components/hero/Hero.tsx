import { HeroActions } from "./parts/HeroActions";
import { HeroContainer } from "./parts/HeroContainer";
import { HeroSection } from "./parts/HeroSection";
import { ReadableBand } from "./parts/ReadableBand";
import { useHeroCopy } from "./parts/useHeroCopy";
import { Terminal } from "./terminal/Terminal";

/**
 * The hero: a plain-language band over an interactive console.
 *
 * A STATIC import chain on purpose. The band's <h1> and the terminal's first
 * output block are server-rendered, so the page is legible to a recruiter on
 * first paint and complete to a crawler that never runs JavaScript — the
 * terminal enhances the content, it never gates it.
 */
const Hero = () => {
  const { common, terminal, copy } = useHeroCopy();

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

export default Hero;
