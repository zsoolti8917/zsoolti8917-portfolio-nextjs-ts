import { Eyebrow } from "../parts/Eyebrow";
import { HeroActions } from "../parts/HeroActions";
import { HeroContainer } from "../parts/HeroContainer";
import { HeroSection } from "../parts/HeroSection";
import { ProofStrip } from "../parts/ProofStrip";
import { useHeroCopy } from "../parts/useHeroCopy";
import { useHeroStats } from "../parts/useHeroStats";

/** V5 — Kinetic. Oversized type whose weight tracks the cursor. */
export const HeroV5 = () => {
  const { common, copy } = useHeroCopy(5);
  const stats = useHeroStats();

  return (
    <HeroSection tall>
      <HeroContainer>
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h1
          aria-label={copy.headlineLines.join(" ")}
          className="text-5xl font-black uppercase leading-[0.95] tracking-tight text-zinc-100 sm:text-7xl md:text-8xl"
        >
          {copy.headlineLines.map((line, i) => (
            <span
              key={line}
              aria-hidden
              className={`block ${i === copy.headlineLines.length - 1 ? "text-indigo-500" : ""}`}
            >
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-8 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">
          <span className="font-semibold text-zinc-100">{common.name}</span> —{" "}
          {copy.subhead}
        </p>
        <div className="mt-8">
          <ProofStrip stats={stats} common={common} layout="inline" />
        </div>
        <HeroActions common={common} />
      </HeroContainer>
    </HeroSection>
  );
};
