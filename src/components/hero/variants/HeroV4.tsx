import { Eyebrow } from "../parts/Eyebrow";
import { HeroActions } from "../parts/HeroActions";
import { HeroContainer } from "../parts/HeroContainer";
import { HeroSection } from "../parts/HeroSection";
import { useHeroCopy } from "../parts/useHeroCopy";

/** V4 — Shell. Readable headline beside a genuinely working terminal. */
export const HeroV4 = () => {
  const { common, copy } = useHeroCopy(4);

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

          {/* Terminal frame with the boot lines already printed — the server
              output. Interactivity is added on top after hydration. */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 font-mono text-sm">
            <div className="mb-3 flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            </div>
            <div className="space-y-1 text-zinc-400">
              {copy.boot.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <p className="text-indigo-400">
                {copy.prompt} <span className="text-zinc-600">_</span>
              </p>
            </div>
          </div>
        </div>
      </HeroContainer>
    </HeroSection>
  );
};
