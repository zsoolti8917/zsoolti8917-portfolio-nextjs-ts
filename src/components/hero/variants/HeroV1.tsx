import { Eyebrow } from "../parts/Eyebrow";
import { HeroActions } from "../parts/HeroActions";
import { HeroContainer } from "../parts/HeroContainer";
import { HeroSection } from "../parts/HeroSection";
import { ProofStrip } from "../parts/ProofStrip";
import { StatusPill } from "../parts/StatusPill";
import { useHeroCopy } from "../parts/useHeroCopy";
import { useHeroStats } from "../parts/useHeroStats";

/** V1 — Mission control. Editorial split + telemetry panel. */
export const HeroV1 = () => {
  const { common, copy } = useHeroCopy(1);
  const stats = useHeroStats();

  return (
    <HeroSection>
      <HeroContainer>
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h1 className="text-4xl font-black leading-tight text-zinc-100 sm:text-6xl sm:leading-tight md:text-7xl md:leading-tight">
          {copy.headlineLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
          <span className="text-indigo-500">.</span>
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base md:leading-relaxed">
          <span className="font-semibold text-zinc-100">{common.name}</span> —{" "}
          {copy.subhead}
        </p>
        <p className="mt-2 text-xs tracking-widest text-zinc-500">
          {common.languages}
        </p>
        <div className="mt-8">
          <StatusPill common={common} />
        </div>
        <div className="mt-10 border-t border-zinc-800 pt-8">
          <ProofStrip stats={stats} common={common} layout="grid" />
        </div>
        <HeroActions common={common} />
      </HeroContainer>
    </HeroSection>
  );
};
