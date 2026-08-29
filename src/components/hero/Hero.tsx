import { useRouter } from "next/router";
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
  const router = useRouter();

  return (
    <HeroSection>
      {/* Remount on a locale switch (same precedent as `util/Reveal`). A switch
          is a client-side `router.push`, so `Terminal` would otherwise keep the
          `blocks` state it seeded on mount and go on showing the old language's
          pre-run output under a page that has already changed language. */}
      <Terminal key={router.locale} copy={terminal} common={common} />
    </HeroSection>
  );
};

export default Hero;
