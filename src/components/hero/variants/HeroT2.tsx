import { HeroActions } from "../parts/HeroActions";
import { HeroContainer } from "../parts/HeroContainer";
import { HeroSection } from "../parts/HeroSection";
import { ReadableBand } from "../parts/ReadableBand";
import { useHeroCopy } from "../parts/useHeroCopy";
import { TerminalSkipLink } from "../terminal/parts";
import { TtyScreen } from "./t2/TtyScreen";
import { TtyTexture } from "./t2/TtyTexture";

/**
 * T2 — Full-bleed TTY.
 *
 * The opposite of T1: there is no window. The terminal is not an app sitting on
 * the page, it is the page — edge to edge, square corners, a status line where
 * a title bar would be and the prompt welded to the bottom of the first screen.
 *
 * Three layout notes, all of them load-bearing:
 *
 * 1. Full-bleed is plain `w-full`, never `100vw`. Hero is hoisted out of the
 *    `max-w-5xl` wrapper, but the page grid is `grid-cols-[54px_minmax(0,1fr)]`
 *    — the viewport is 54px wider than this column, so `100vw` would overflow
 *    and put a horizontal scrollbar on the whole site.
 * 2. `HeroSection tall` is `flex items-center`, which would centre a
 *    content-height child and leave the prompt floating. `self-stretch` makes
 *    this column fill the section instead, so the scrollback absorbs the slack
 *    and the prompt lands on the bottom edge.
 * 3. The readable band stays inside `HeroContainer`. Prose at the width of a
 *    27" monitor is unreadable, and the band is the part a recruiter actually
 *    reads; only the machine breaks out to the full width.
 *
 * The skip link is hoisted above the band so it is the first focusable element
 * in the hero — earlier than in T1, where it sits inside the terminal.
 */
export const HeroT2 = () => {
  const { common, terminal, copy } = useHeroCopy(2);

  return (
    <HeroSection tall>
      <TtyTexture />
      <div className="relative flex w-full min-w-0 flex-col self-stretch">
        <TerminalSkipLink copy={terminal} />
        <HeroContainer className="pb-8 pt-12 md:pb-10 md:pt-16">
          <ReadableBand common={common} copy={copy} />
          <HeroActions common={common} />
        </HeroContainer>
        <TtyScreen copy={terminal} />
      </div>
    </HeroSection>
  );
};
