import { useRef } from "react";
import { useElementSize } from "../hooks/useElementSize";
import { useInViewActive } from "../hooks/useInViewActive";
import { useMotionCapabilities } from "../hooks/useMotionCapabilities";
import { Eyebrow } from "../parts/Eyebrow";
import { HeroActions } from "../parts/HeroActions";
import { HeroContainer } from "../parts/HeroContainer";
import { HeroSection } from "../parts/HeroSection";
import { ProofStrip } from "../parts/ProofStrip";
import { StatusPill } from "../parts/StatusPill";
import { useHeroCopy } from "../parts/useHeroCopy";
import { useHeroStats } from "../parts/useHeroStats";
import { useDitherField } from "./v3/useDitherField";

/** V3 — Dither field. Cursor-reactive WebGL behind the type. */
export const HeroV3 = () => {
  const { common, copy } = useHeroCopy(3);
  const stats = useHeroStats();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reducedMotion, coarsePointer } = useMotionCapabilities();
  // The canvas is `inset-0` inside the section, so measuring and observing it
  // measures and observes the hero — and saves threading a second ref out of
  // the shared HeroSection.
  const { width, height } = useElementSize(canvasRef);
  const active = useInViewActive(canvasRef);
  const ready = useDitherField(canvasRef, {
    active,
    reducedMotion,
    coarsePointer,
    width,
    height,
  });

  return (
    <HeroSection tall>
      {/* CSS fallback layer — the server output. The canvas cross-fades over
          this once the shader has drawn its first frame. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-radial from-indigo-950/40 via-zinc-900 to-zinc-900"
      />
      {/* Always rendered, never conditional: capability values decide what the
          effects *do*, not what the tree contains, so server and client agree.
          If WebGL is missing or refused, `ready` stays false, this element
          stays at opacity 0, and the layer above is all anyone ever sees.
          `w-full h-full` is load-bearing — a canvas is a replaced element, so
          `inset-0` alone would leave it at its intrinsic 300x150. */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`hero-dither-canvas pointer-events-none absolute inset-0 -z-10 h-full w-full transition-opacity duration-700 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Scrim: an animated field behind a headline fails contrast at some
          phase of the animation unless the text sits on solid ground. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-transparent"
      />
      <HeroContainer>
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h1 className="max-w-3xl text-4xl font-black leading-tight text-zinc-100 sm:text-6xl sm:leading-tight md:text-7xl md:leading-tight">
          {copy.headline}
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">
          <span className="font-semibold text-zinc-100">{common.name}</span> —{" "}
          {copy.subhead}
        </p>
        <div className="mt-8">
          <StatusPill common={common} />
        </div>
        <div className="mt-8">
          <ProofStrip stats={stats} common={common} layout="inline" />
        </div>
        <HeroActions common={common} />
      </HeroContainer>
    </HeroSection>
  );
};
