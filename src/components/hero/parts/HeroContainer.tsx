import { ReactNode } from "react";

/**
 * Restores the page's text measure inside a full-bleed hero. Mirrors the
 * wrapper in `components/index.tsx` that Hero was hoisted out of.
 */
export const HeroContainer = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`mx-auto w-full max-w-5xl px-4 md:px-8 ${className}`}>
    {children}
  </div>
);
