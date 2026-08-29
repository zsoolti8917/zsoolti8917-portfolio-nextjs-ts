import { HeroSection } from "./parts/HeroSection";
import { useHeroCopy } from "./parts/useHeroCopy";
import { Terminal } from "./terminal/Terminal";

/**
 * The hero: one terminal window, the whole first screen.
 *
 * A STATIC import chain on purpose. The window opens on two blocks the server
 * has already run — `whoami` and `projects` — so the name, the role, the
 * current work, the location, the stack and every project title are legible to
 * a recruiter on first paint and complete to a crawler that never runs
 * JavaScript. The shell enhances that content; it never gates it. Nothing is
 * reachable only by typing.
 */
const Hero = () => {
  const { common, terminal } = useHeroCopy();

  return (
    <HeroSection>
      <Terminal copy={terminal} common={common} />
    </HeroSection>
  );
};

export default Hero;
