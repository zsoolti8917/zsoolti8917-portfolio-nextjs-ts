import { useEffect } from "react";
import { useRouter } from "next/router";
import { stagger, useAnimate } from "framer-motion";
import { Eyebrow } from "../parts/Eyebrow";
import { HeroActions } from "../parts/HeroActions";
import { HeroContainer } from "../parts/HeroContainer";
import { HeroSection } from "../parts/HeroSection";
import { ProofStrip } from "../parts/ProofStrip";
import { useHeroCopy } from "../parts/useHeroCopy";
import { useHeroStats } from "../parts/useHeroStats";
import { useMotionCapabilities } from "../hooks/useMotionCapabilities";
import { KineticHeadline } from "./v5/KineticHeadline";

/**
 * V5 — Kinetic.
 *
 * Oversized editorial caps whose per-letter `wght` answers to the cursor: the
 * type swells under the pointer like paper under a magnet. All of it is one
 * variable font that `_app` already loads — no second family, no canvas, no
 * engine. The variant's whole runtime cost is a frame callback that writes a
 * custom property to the handful of letters near the cursor, and it is only
 * alive while the cursor is actually moving.
 *
 * The headline owns that behaviour (see `v5/KineticHeadline`). Everything here
 * is the surrounding page, which rises in on mount and again on
 * `router.locale` — the same reason `util/Reveal` watches it, and without it
 * the hero sits frozen while the rest of the page re-reveals after a language
 * switch. The headline is deliberately NOT part of that stagger: it replays its
 * own weight wave instead, and a transform on it would corrupt the letter
 * geometry the effect caches.
 */
export const HeroV5 = () => {
  const { common, copy } = useHeroCopy(5);
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
      { opacity: [0, 1], y: [14, 0] },
      { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: stagger(0.06) }
    );

    return () => {
      controls.stop();
      // StrictMode double-invokes this; clearing returns each block to the
      // finished, server-rendered design rather than stranding it mid-fade.
      items.forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
      });
    };
  }, [animate, scope, canAnimate, locale]);

  return (
    <HeroSection tall>
      <HeroContainer>
        <div ref={scope}>
          <div data-hero-rise>
            <Eyebrow>{copy.eyebrow}</Eyebrow>
          </div>

          <KineticHeadline lines={copy.headlineLines} />

          {/*
            The prompt only makes sense to someone the effect actually runs
            for. Capability values may not gate JSX, so this is gated in CSS
            instead — one rule that needs BOTH md and motion-safe, rather than
            two rules whose winner depends on Tailwind's variant order.
            `aria-hidden` because "move the cursor" is noise to a screen reader.
          */}
          <p
            aria-hidden="true"
            data-hero-rise
            className="mt-6 hidden items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-zinc-500 md:motion-safe:flex"
          >
            <span className="h-px w-8 shrink-0 bg-indigo-500/70" />
            {copy.hoverHint}
          </p>

          <p
            data-hero-rise
            className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base md:leading-relaxed"
          >
            <span className="font-semibold text-zinc-100">{common.name}</span>
            {" — "}
            {copy.subhead}
          </p>

          <div data-hero-rise className="mt-8">
            <ProofStrip stats={stats} common={common} layout="inline" />
          </div>

          <div data-hero-rise>
            <HeroActions common={common} />
          </div>
        </div>
      </HeroContainer>
    </HeroSection>
  );
};
