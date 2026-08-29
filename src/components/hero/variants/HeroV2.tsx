import { Eyebrow } from "../parts/Eyebrow";
import { HeroActions } from "../parts/HeroActions";
import { HeroContainer } from "../parts/HeroContainer";
import { HeroSection } from "../parts/HeroSection";
import { useHeroCopy } from "../parts/useHeroCopy";
import { useHeroStats } from "../parts/useHeroStats";
import { ChipLayer } from "./v2/ChipLayer";

/**
 * V2 — Ragdoll stack. Headline stays legible; the chips get thrown.
 *
 * The type block is a positioned `z-10` layer and the pile is a `z-0` one
 * below it: a headline sunk into a physics heap loses the three-second read,
 * and a physics surface laid over the CTAs eats their clicks.
 */
export const HeroV2 = () => {
  const { common, copy } = useHeroCopy(2);
  const stats = useHeroStats();

  return (
    <HeroSection>
      <HeroContainer>
        <div className="relative z-10">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h1 className="text-3xl font-black leading-tight text-zinc-100 sm:text-5xl sm:leading-tight md:text-6xl md:leading-tight">
            {copy.headlineLines.map((line, i) => (
              <span key={line} className={i === 0 ? "block" : "block text-zinc-400"}>
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">
            <span className="font-semibold text-zinc-100">{common.name}</span> —{" "}
            {copy.subhead}
          </p>
          <HeroActions common={common} />
        </div>
        <ChipLayer
          items={stats.flatStack}
          hint={copy.hint}
          resetLabel={copy.resetLabel}
        />
      </HeroContainer>
    </HeroSection>
  );
};
