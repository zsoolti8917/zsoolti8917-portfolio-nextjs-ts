import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Own the first screen. Subtracts the 56px sticky nav (NAV_HEIGHT). */
  tall?: boolean;
  className?: string;
}

/**
 * The outer shell of the hero.
 *
 * - `isolate` creates a stacking context, so no z-index inside can ever climb
 *   over the sticky nav (z-30).
 * - `mb-24 md:mb-32` replaces the gap Hero used to get for free: Hero sits
 *   outside the `space-y-32` wrapper, and that utility only sets margin-top on
 *   `* + *`, so About (the first child) gets nothing.
 * - `id="hero"` is the scroll target for `TerminalBus.run()`. It deliberately
 *   carries no `.section-wrapper` class: the hero is excluded from the nav
 *   scroll-spy, which observes the four content sections only.
 */
export const HeroSection = ({ children, tall = false, className = "" }: Props) => (
  <section
    id="hero"
    className={`relative isolate w-full overflow-hidden mb-24 md:mb-32 ${
      tall ? "min-h-[calc(100svh-56px)] flex items-center" : "py-24 md:py-32"
    } ${className}`}
  >
    {children}
  </section>
);
