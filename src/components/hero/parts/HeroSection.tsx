import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Own the first screen. Subtracts the 72px sticky header. */
  tall?: boolean;
  className?: string;
}

/**
 * The outer shell every variant shares.
 *
 * - `isolate` creates a stacking context, so no z-index inside a variant can
 *   ever climb over the sticky header (z-20) or the sidebar.
 * - `mb-24 md:mb-32` replaces the gap Hero used to get for free: Hero now
 *   sits outside the `space-y-32` wrapper, and that utility only sets
 *   margin-top on `* + *`, so About (the new first child) gets nothing.
 * - No `id` and no `section-wrapper`: Hero is deliberately excluded from the
 *   sidebar scroll-spy, which queries `.section-wrapper` and reads its id.
 */
export const HeroSection = ({ children, tall = false, className = "" }: Props) => (
  <section
    className={`relative isolate w-full overflow-hidden mb-24 md:mb-32 ${
      tall ? "min-h-[calc(100svh-72px)] flex items-center" : "py-24 md:py-32"
    } ${className}`}
  >
    {children}
  </section>
);
