import { ReactNode } from "react";

/**
 * The outer shell of the hero: the first screen, minus the 56px sticky nav.
 *
 * - `isolate` creates a stacking context, so no z-index inside can ever climb
 *   over the sticky nav (z-30) — and the `-z-10` backdrop layers below stay
 *   behind the window without escaping behind the page background.
 * - `mb-24 md:mb-32` replaces the gap Hero used to get for free: Hero sits
 *   outside the `space-y-32` wrapper, and that utility only sets margin-top on
 *   `* + *`, so About (the first child) gets nothing.
 * - `id="hero"` is the scroll target for `TerminalBus.run()`. It deliberately
 *   carries no `.section-wrapper` class: the hero is excluded from the nav
 *   scroll-spy, which observes the four content sections only.
 */
export const HeroSection = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <section
    id="hero"
    className={`relative isolate mb-24 w-full overflow-hidden scroll-mt-14 md:mb-32 min-h-[calc(100svh-56px)] ${className}`}
  >
    {/* Dots and glow composite on one layer; the noise carries its own opacity
        and so needs its own. Nothing here animates. */}
    <div aria-hidden className="absolute inset-0 -z-10 bg-dots bg-glow" />
    <div aria-hidden className="absolute inset-0 -z-10 bg-noise" />
    {children}
  </section>
);
