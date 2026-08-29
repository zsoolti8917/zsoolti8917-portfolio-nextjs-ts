import { recursiveMono } from "../fonts";
import { HeroActions } from "../parts/HeroActions";
import { HeroContainer } from "../parts/HeroContainer";
import { HeroSection } from "../parts/HeroSection";
import { ReadableBand } from "../parts/ReadableBand";
import { useHeroCopy } from "../parts/useHeroCopy";
import { TerminalLog, TerminalShell, TerminalSkipLink } from "../terminal/parts";
import { useTerminal } from "../terminal/useTerminal";
import { PaletteCard } from "./t3/PaletteCard";

/**
 * T3 — Palette. The terminal as a command palette.
 *
 * The structure inverts the default assembly: search card on top, output
 * underneath. A palette converts recall into recognition — it opens showing
 * everything it can answer and filters instead of erroring — which is why this
 * is the variant a non-technical visitor can actually use. She should be able
 * to read the whole CV having clicked six times and typed nothing.
 *
 * Everything that runs still runs through the shared engine: `useTerminal` is
 * called exactly once here and handed to both the card and the log, so the
 * output is the same clickable, server-rendered scrollback as every other
 * variant.
 */
export const HeroT3 = () => {
  const { common, terminal, copy } = useHeroCopy(3);
  const term = useTerminal(terminal);

  return (
    <HeroSection>
      <HeroContainer>
        <ReadableBand common={common} copy={copy} />

        <TerminalShell className={`${recursiveMono.variable} mt-8 md:mt-10`}>
          {/* First focusable in the hero, ahead of the input. */}
          <TerminalSkipLink copy={terminal} />
          <PaletteCard term={term} copy={terminal} />
          {/*
            Fixed height, so running a command never moves the card the visitor
            is aiming at. The first block is server-rendered by `useTerminal`,
            so this reads as an answer before any JavaScript arrives.
          */}
          <TerminalLog
            term={term}
            copy={terminal}
            className="mt-4 h-[13rem] rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3.5 sm:px-5 md:h-[18rem]"
          />
        </TerminalShell>

        <HeroActions common={common} />
      </HeroContainer>
    </HeroSection>
  );
};
