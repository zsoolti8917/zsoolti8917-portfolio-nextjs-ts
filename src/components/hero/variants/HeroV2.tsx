import { Chip } from "@/components/util/Chip";
import { Eyebrow } from "../parts/Eyebrow";
import { HeroActions } from "../parts/HeroActions";
import { HeroContainer } from "../parts/HeroContainer";
import { HeroSection } from "../parts/HeroSection";
import { useHeroCopy } from "../parts/useHeroCopy";
import { useHeroStats } from "../parts/useHeroStats";

/** V2 — Ragdoll stack. Headline stays legible; the chips get thrown. */
export const HeroV2 = () => {
  const { common, copy } = useHeroCopy(2);
  const stats = useHeroStats();

  return (
    <HeroSection>
      <HeroContainer>
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
        {/* Static, wrapping chip list: the server output, the reduced-motion
            form, and the mobile form. The physics layer replaces it in place. */}
        <div className="mt-10 flex flex-wrap gap-2">
          {stats.flatStack.map((item) => (
            <Chip key={item}>{item}</Chip>
          ))}
        </div>
      </HeroContainer>
    </HeroSection>
  );
};
