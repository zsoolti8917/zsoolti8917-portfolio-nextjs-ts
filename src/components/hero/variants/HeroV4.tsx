import { useState } from "react";
import { useRouter } from "next/router";
import { Eyebrow } from "../parts/Eyebrow";
import { HeroActions } from "../parts/HeroActions";
import { HeroContainer } from "../parts/HeroContainer";
import { HeroSection } from "../parts/HeroSection";
import { ProofStrip } from "../parts/ProofStrip";
import { StatusPill } from "../parts/StatusPill";
import { useHeroCopy } from "../parts/useHeroCopy";
import { useHeroStats } from "../parts/useHeroStats";
import { Terminal } from "./v4/Terminal";

/**
 * V4 — Shell. Readable headline beside a genuinely working terminal.
 *
 * The headline half is a normal hero and never depends on the shell: a
 * recruiter who ignores the right column still gets the name, the claim and
 * the CV button. `gui` swaps the terminal for the graphical panel, because a
 * shell as the only front door bounces exactly the people this page is for.
 * (Nothing is persisted — a reload brings the shell back.)
 */
export const HeroV4 = () => {
  const { common, copy } = useHeroCopy(4);
  const stats = useHeroStats();
  // `true` on the server too: the terminal is part of the SSR output, and
  // this only ever flips in response to a typed command.
  const [shell, setShell] = useState(true);
  const { locale } = useRouter();

  return (
    <HeroSection>
      <HeroContainer>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h1 className="text-4xl font-black leading-tight text-zinc-100 sm:text-5xl sm:leading-tight md:text-6xl md:leading-tight">
              {copy.headline}
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">
              <span className="font-semibold text-zinc-100">{common.name}</span> —{" "}
              {copy.subhead}
            </p>
            <HeroActions common={common} />
          </div>

          {shell ? (
            <Terminal
              // The line buffer is seeded from `copy` once, so a locale switch
              // would otherwise leave the previous language's boot text (and
              // scrollback) on screen — Next re-renders this page in place
              // rather than unmounting it. Remount instead.
              key={locale}
              copy={copy}
              stats={stats}
              onLeave={() => setShell(false)}
            />
          ) : (
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-6">
              <StatusPill common={common} />
              <div className="mt-6">
                <ProofStrip stats={stats} common={common} layout="grid" />
              </div>
            </div>
          )}
        </div>
      </HeroContainer>
    </HeroSection>
  );
};
