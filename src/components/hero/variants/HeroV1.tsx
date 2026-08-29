import { useEffect } from "react";
import { useRouter } from "next/router";
import { stagger, useAnimate } from "framer-motion";
import { Eyebrow } from "../parts/Eyebrow";
import { HeroActions } from "../parts/HeroActions";
import { HeroContainer } from "../parts/HeroContainer";
import { HeroSection } from "../parts/HeroSection";
import { useHeroCopy } from "../parts/useHeroCopy";
import { useHeroStats } from "../parts/useHeroStats";
import { useMotionCapabilities } from "../hooks/useMotionCapabilities";
import { TelemetryPanel } from "./v1/TelemetryPanel";

/** Soft indigo bloom under the panel. Purely atmospheric, never interactive. */
const GLOW = {
  backgroundImage:
    "radial-gradient(60% 55% at 78% 38%, rgba(99,102,241,0.13), transparent 70%)",
};

/**
 * V1 — Mission control.
 *
 * Editorial split: the claim on the left, stated flat; the instrumentation on
 * the right. Deliberately NOT sticky — a sticky rail inside a one-viewport
 * hero has no scroll travel to work with, so it would cost a stacking context
 * and buy nothing.
 *
 * Entrance is driven through `useAnimate` rather than `motion.initial`,
 * because `initial={{ opacity: 0 }}` puts `opacity:0` in the server HTML and
 * the <h1> here is the LCP element. Nothing is hidden before mount; the
 * effect sets the from-state and animates out of it, and only when
 * `canAnimate` says so. `router.locale` is a dependency for the same reason
 * `util/Reveal` watches it: without it the hero sits frozen after a language
 * switch while the rest of the page re-reveals.
 */
export const HeroV1 = () => {
  const { common, copy } = useHeroCopy(1);
  const stats = useHeroStats();
  const { canAnimate } = useMotionCapabilities();
  const router = useRouter();
  const locale = router.locale || "en";
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    if (!canAnimate) return;
    const root = scope.current;
    if (!root) return;

    const items = Array.from(
      root.querySelectorAll<HTMLElement>("[data-hero-rise]")
    );
    if (items.length === 0) return;

    const controls = animate(
      items,
      { opacity: [0, 1], y: [16, 0] },
      { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: stagger(0.07) }
    );

    return () => {
      controls.stop();
      // StrictMode double-invokes this effect; clearing the inline styles
      // returns every element to the finished, server-rendered design rather
      // than stranding it mid-fade.
      items.forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
      });
    };
  }, [animate, scope, canAnimate, locale]);

  return (
    <HeroSection>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={GLOW}
      />

      <HeroContainer>
        <div
          ref={scope}
          className="grid grid-cols-1 items-start gap-10 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-12"
        >
          <div>
            <div data-hero-rise>
              <Eyebrow>{copy.eyebrow}</Eyebrow>
            </div>

            <h1
              data-hero-rise
              className="text-balance text-[length:clamp(1.85rem,6.2vw,2.35rem)] font-black leading-[1.1] tracking-tight text-zinc-100 md:text-[length:clamp(1.4rem,3.1vw,2.4rem)] md:leading-[1.08]"
            >
              {copy.headlineLines.map((line, i) => {
                const last = i === copy.headlineLines.length - 1;
                // All three locales already end the sentence with a period;
                // it is lifted out and re-rendered in indigo rather than
                // appended, so the site's signature full stop doesn't become
                // an ellipsis in any translation.
                const text = last ? line.replace(/\.$/, "") : line;

                return (
                  <span key={line} className="block">
                    {text}
                    {last && <span className="text-indigo-500">.</span>}
                  </span>
                );
              })}
            </h1>

            <p
              data-hero-rise
              className="mt-6 max-w-prose text-sm leading-relaxed text-zinc-300 md:text-base md:leading-relaxed"
            >
              <span className="font-semibold text-zinc-100">{common.name}</span>
              {" — "}
              {copy.subhead}
            </p>

            <p
              data-hero-rise
              className="mt-5 flex items-center gap-3 text-xs tracking-widest text-zinc-500"
            >
              <span aria-hidden="true" className="h-px w-8 shrink-0 bg-zinc-700" />
              {common.languages}
            </p>

            <div data-hero-rise>
              <HeroActions common={common} />
            </div>
          </div>

          <TelemetryPanel
            copy={copy}
            common={common}
            stats={stats}
            canAnimate={canAnimate}
            replayKey={locale}
          />
        </div>
      </HeroContainer>
    </HeroSection>
  );
};
