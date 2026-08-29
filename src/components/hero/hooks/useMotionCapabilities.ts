import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useMediaQuery } from "./useMediaQuery";

/**
 * The two capability values the terminal reads, and the one rule that keeps it
 * hydration-safe: they may gate `useEffect` bodies ONLY, never a JSX branch.
 * The reduced-motion, fine-pointer form is always what renders; effects upgrade
 * it after mount. Anything wanting to branch in JSX on reduced motion should use
 * framer's `useReducedMotion` directly, as `util/Reveal` does.
 */
export const useMotionCapabilities = () => {
  const reducedMotion = useReducedMotion() ?? false;
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return {
    /** True once mounted on a client that has not asked for less motion. */
    canAnimate: mounted && !reducedMotion,
    /** A touch screen: a tap in the output must not summon the keyboard. */
    coarsePointer,
  };
};
